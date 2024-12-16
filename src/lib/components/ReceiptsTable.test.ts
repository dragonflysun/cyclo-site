import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import ReceiptsTable from './ReceiptsTable.svelte';
import { describe, it, expect } from 'vitest';
import { mockReceipt } from '$lib/mocks/mockReceipt';
import type { Receipt } from '$lib/types';
import { formatEther } from 'ethers';

const mockReceipts = [mockReceipt, mockReceipt];

describe('ReceiptsTable Component', () => {
	it('renders the receipts table with correct headers and data', async () => {
		render(ReceiptsTable, { receipts: mockReceipts as unknown as Receipt[] });

		expect(screen.getByTestId('headers')).toBeInTheDocument();

		for (let i = 0; i < mockReceipts.length; i++) {
			expect(screen.getByTestId(`locked-price-${i}`)).toHaveTextContent(
				Number(formatEther(mockReceipts[i].tokenId)).toFixed(5)
			);
			expect(screen.getByTestId(`number-held-${i}`)).toHaveTextContent(
				Number(formatEther(mockReceipts[i].balance)).toFixed(5)
			);
			expect(screen.getByTestId(`sflr-per-receipt-${i}`)).toHaveTextContent(
				Number(mockReceipts[i].readableFlrPerReceipt).toFixed(5)
			);
			expect(screen.getByTestId(`total-locked-sflr-${i}`)).toHaveTextContent(
				Number(mockReceipts[i].readableTotalsFlr).toFixed(5)
			);
		}
	});

	it('opens a receipt modal when redeem button is clicked', async () => {
		render(ReceiptsTable, { receipts: mockReceipts });

		const redeemButton = screen.getByTestId('redeem-button-0');
		await fireEvent.click(redeemButton);

		await waitFor(() => {
			expect(screen.getByTestId('receipt-modal')).toBeInTheDocument();
		});
	});
});
