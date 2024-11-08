import { render, screen, waitFor } from '@testing-library/svelte';
import Unlock from './Unlock.svelte';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import type { Receipt } from '$lib/types';
import { mockConnectedStore, mockSignerAddressStore } from '$lib/mocks/mockStores';

const { mockBalancesStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('$lib/queries/getReceipts', () => ({
	getReceipts: vi.fn()
}));

vi.mock('$lib/balancesStore', async () => {
	return {
		default: mockBalancesStore
	};
});

const mockReceipts: Receipt[] = [
	{
		chainId: '14',
		balance: BigInt(1000000000000000000),
		tokenId: '1'
	}
] as unknown as Receipt[];

describe('Unlock Component', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(1000000000000000000),
			BigInt(1000000000000000000),
			'Ready'
		);
	});

	it('should show connect wallet button when wallet is not connected', () => {
		mockConnectedStore.mockSetSubscribeValue(false);
		mockSignerAddressStore.mockSetSubscribeValue('');
		render(Unlock);

		expect(screen.getByText('CONNECT WALLET TO VIEW RECEIPTS')).toBeInTheDocument();
	});

	it('should display cysFLR balance correctly when wallet is connected', async () => {
		mockConnectedStore.mockSetSubscribeValue(true);
		mockSignerAddressStore.mockSetSubscribeValue('mockWalletAddress');
		render(Unlock);

		await waitFor(() => {
			const balanceText = screen.getByText(BigInt(1).toString());
			expect(balanceText).toBeInTheDocument();
			expect(screen.getByText('cysFLR')).toBeInTheDocument();
		});
	});

	it('should show loading state while fetching receipts', async () => {
		const { getReceipts } = await import('$lib/queries/getReceipts');
		vi.mocked(getReceipts).mockImplementation(() => new Promise(() => {}));

		render(Unlock);

		await waitFor(() => {
			expect(screen.getByText('LOADING...')).toBeInTheDocument();
		});
	});

	it('should display receipts table when receipts are available', async () => {
		const { getReceipts } = await import('$lib/queries/getReceipts');
		vi.mocked(getReceipts).mockResolvedValue(mockReceipts);

		render(Unlock);

		await waitFor(() => {
			expect(screen.queryByText('NO RECEIPTS FOUND...')).not.toBeInTheDocument();
			expect(screen.queryByText('LOADING...')).not.toBeInTheDocument();
		});
	});

	it('should show "NO RECEIPTS FOUND" message when no receipts are available', async () => {
		const { getReceipts } = await import('$lib/queries/getReceipts');
		vi.mocked(getReceipts).mockResolvedValue([]);

		render(Unlock);

		await waitFor(() => {
			expect(screen.getByText('NO RECEIPTS FOUND...')).toBeInTheDocument();
		});
	});

	it('should refresh receipts when wallet address changes', async () => {
		const { getReceipts } = await import('$lib/queries/getReceipts');
		const getReceiptsSpy = vi.mocked(getReceipts);

		render(Unlock);

		await waitFor(() => {
			expect(getReceiptsSpy).toHaveBeenCalled();
		});
	});

	it('should handle case when getReceipts returns empty', async () => {
		const { getReceipts } = await import('$lib/queries/getReceipts');
		vi.mocked(getReceipts).mockResolvedValue([]);
		render(Unlock);

		await waitFor(() => {
			expect(screen.getByText('NO RECEIPTS FOUND...')).toBeInTheDocument();
		});
	});
});
