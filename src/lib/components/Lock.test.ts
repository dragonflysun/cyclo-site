import { render, screen, waitFor } from '@testing-library/svelte';
import Lock from './Lock.svelte';
import transactionStore from '$lib/transactionStore';
import userEvent from '@testing-library/user-event';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockSignerAddressStore } from '$lib/mocks/mockStores';

const { mockBalancesStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('../../generated', async (importOriginal) => {
	return {
		...((await importOriginal()) as object),
		simulateErc20PriceOracleReceiptVaultPreviewDeposit: vi.fn(async () => ({
			result: 14920000000000000n
		}))
	};
});

vi.mock('$lib/balancesStore', async () => {
	return {
		default: mockBalancesStore
	};
});

vi.mock('$lib/transactionStore', async (importOriginal) => ({
	default: {
		...((await importOriginal) as object),
		handleLockTransaction: vi.fn().mockResolvedValue({})
	}
}));

describe('Lock Component', () => {
	const initiateLockTransactionSpy = vi.spyOn(transactionStore, 'handleLockTransaction');

	beforeEach(() => {
		initiateLockTransactionSpy.mockClear();
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(1234000000000000000), // sFlrBalance
			BigInt(9876000000000000000), // cysFlrBalance
			'Ready' // status
		);
	});

	it('should render sFLR balance and price ratio correctly', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('0x1234567890123456789012345678901234567890');
		render(Lock);
		await waitFor(() => {
			expect(screen.getByTestId('sflr-balance')).toBeInTheDocument();

			expect(screen.getByTestId('sflr-balance')).toHaveTextContent('9.876');
			expect(screen.getByTestId('price-ratio')).toBeInTheDocument();
		});
	});

	it('should calculate the correct cysFLR amount based on input', async () => {
		render(Lock);

		const input = screen.getByTestId('lock-input');
		await userEvent.type(input, '500000');

		await waitFor(() => {
			const priceRatio = screen.getByTestId('price-ratio');
			expect(priceRatio).toBeInTheDocument();
			const calculatedCysflr = screen.getByTestId('calculated-cysflr');
			expect(calculatedCysflr).toHaveTextContent('0.000746');
		});
	});

	it('should call handleLockTransaction when lock button is clicked', async () => {
		render(Lock);

		const input = screen.getByTestId('lock-input');
		await userEvent.type(input, '0.0005');

		const lockButton = screen.getByTestId('lock-button');
		await userEvent.click(lockButton);

		await waitFor(() => {
			expect(initiateLockTransactionSpy).toHaveBeenCalled();
		});
	});

	it('should disable the lock button if sFLR balance is insufficient', async () => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(0), 'Ready');
		render(Lock);
		const input = screen.getByTestId('lock-input');
		await userEvent.type(input, '500000');
		const lockButton = screen.getByTestId('lock-button');
		expect(lockButton).toBeDisabled();
		expect(lockButton).toHaveTextContent('INSUFFICIENT sFLR');
	});

	it('should disable the lock button if no value had been entered', async () => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(0), 'Ready');
		render(Lock);
		const lockButton = screen.getByTestId('lock-button');
		expect(lockButton).toBeDisabled();
		expect(lockButton).toHaveTextContent('LOCK');
	});

	it('should show the connect message if there is no signerAddress', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('');
		render(Lock);
		await waitFor(() => {
			expect(screen.getByTestId('connect-message')).toBeInTheDocument();
		});
	});

	it('should show the sFLR balance if there is a signerAddress', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('0x0000');
		render(Lock);
		await waitFor(() => {
			const balance = screen.getByTestId('your-balance');
			expect(balance).toBeInTheDocument();
			expect(balance).toHaveTextContent('sFLR Balance: 9.876');
		});
	});
});
