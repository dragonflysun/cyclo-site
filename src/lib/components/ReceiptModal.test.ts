import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/svelte';
import ReceiptModal from './ReceiptModal.svelte';
import transactionStore from '$lib/transactionStore';

import { formatEther } from 'ethers';
import { mockReceipt } from '$lib/mocks/mockReceipt';
import userEvent from '@testing-library/user-event';

const { mockBalancesStore, mockErc1155AddressStore, mockCysFlrAddressStore, mockSflrAddressStore } =
	await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('$lib/stores', async () => ({
	cysFlrAddress: mockCysFlrAddressStore,
	erc1155Address: mockErc1155AddressStore,
	sFlrAddress: mockSflrAddressStore
}));

vi.mock('$lib/balancesStore', async () => {
	return {
		default: mockBalancesStore
	};
});

describe('ReceiptModal Component', () => {
	const initiateUnlockTransactionSpy = vi.spyOn(transactionStore, 'initiateUnlockTransaction');

	beforeEach(() => {
		initiateUnlockTransactionSpy.mockClear();
		vi.resetAllMocks();
	});

	it('should render the modal with the correct receipt balance and lock-up price', async () => {
		render(ReceiptModal, { receipt: mockReceipt });

		const receiptBalance = Number(formatEther(mockReceipt.balance));
		const lockUpPrice = Number(formatEther(mockReceipt.tokenId));

		await waitFor(() => {
			expect(screen.getByTestId('balance')).toHaveTextContent(receiptBalance.toFixed(5));
			expect(screen.getByTestId('lock-up-price')).toHaveTextContent(lockUpPrice.toFixed(4));
		});
	});

	it('should calculate and display correct flrToReceive when redeem amount is entered', async () => {
		render(ReceiptModal, { receipt: mockReceipt });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.5');

		await waitFor(() => {
			expect(screen.getByTestId('flr-to-receive')).toHaveTextContent('0.21664 SFLR');
		});
	});

	it('should disable the unlock button when the redeem amount is greater than balance', async () => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(0), 'Ready');

		render(ReceiptModal, { receipt: mockReceipt });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '2000');

		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton).toBeDisabled();
		});
	});

	it('should display "INSUFFICIENT cysFLR" if cysFLR balance is insufficient', async () => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(0), 'Ready');

		render(ReceiptModal, { receipt: mockReceipt });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '250000000');
		await userEvent.tab();

		await waitFor(() => {
			const button = screen.getByTestId('unlock-button');
			expect(button).toHaveTextContent('INSUFFICIENT cysFLR');
			expect(button).toBeDisabled();
		});
	});

	it('should enable the unlock button when a valid amount is entered', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(1000000000000000000),
			BigInt(1000000000000000000),
			'Ready'
		);

		render(ReceiptModal, { receipt: mockReceipt });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.5');
		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton.getAttribute('disabled')).toBeFalsy();
		});
		screen.debug();
	});

	it('should call initiateUnlockTransaction when unlock button is clicked', async () => {
		render(ReceiptModal, { receipt: mockReceipt });

		const input = screen.getByTestId('redeem-input');
		await userEvent.type(input, '0.001');

		await waitFor(() => {
			const unlockButton = screen.getByTestId('unlock-button');
			expect(unlockButton.getAttribute('disabled')).toBeFalsy();
		});
		const unlockButton = screen.getByTestId('unlock-button');
		await userEvent.click(unlockButton);

		await waitFor(() => {
			expect(initiateUnlockTransactionSpy).toHaveBeenCalledOnce();
		});
	});
});
