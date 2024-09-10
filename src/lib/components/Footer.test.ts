import { render, screen, waitFor } from '@testing-library/svelte';
import Footer from './Footer.svelte';
import { readErc20TotalSupply } from '../../generated';
import { describe, it, vi, expect, type Mock, beforeEach } from 'vitest';

vi.mock('../../generated', () => ({
	readErc20TotalSupply: vi.fn()
}));

describe('Footer.svelte', () => {
	const mockWrappedFlareAddress = '0xwrappedFlare';
	const mockCyFlareAddress = '0xcyFlare';

	beforeEach(() => {
		vi.spyOn(global, 'fetch').mockResolvedValue({} as Response);

		// wrappedFlareAddress.set(mockWrappedFlareAddress);
		// cyFlareAddress.set(mockCyFlareAddress);
	});

	it('should display cyFLR and sFLR supplies correctly when fetched', async () => {
		// Mock the return value of readErc20TotalSupply
		(readErc20TotalSupply as Mock)
			.mockResolvedValueOnce(BigInt(2000000000000000000)) // Mock for cyFLR
			.mockResolvedValueOnce(BigInt(5000000000000000000)); // Mock for sFLR

		render(Footer);

		// Ensure the DOM updates after the supplies are fetched and rendered
		await waitFor(() => {
			expect(screen.getByTestId('cyFLR-supply')).toBeInTheDocument();
			expect(screen.getByText('2')).toBeInTheDocument(); // cyFLR formatted value
		});

		await waitFor(() => {
			expect(screen.getByTestId('sFlr-supply')).toBeInTheDocument();
			expect(screen.getByText('5')).toBeInTheDocument(); // sFLR formatted value
		});
	});

	it('should not display supply if fetch fails', async () => {
		(readErc20TotalSupply as Mock).mockResolvedValueOnce(null);

		render(Footer);

		await waitFor(() => {
			expect(screen.queryByText('Total cyFLR supply')).not.toBeInTheDocument();
			expect(screen.queryByText('Total sFLR supply')).not.toBeInTheDocument();
		});
	});
});
