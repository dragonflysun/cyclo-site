import { render, screen, waitFor } from '@testing-library/svelte';
import Footer from './Footer.svelte';
import { readErc20TotalSupply } from '../../generated';
import { describe, it, vi, expect, type Mock, beforeEach } from 'vitest';

const { mockWagmiConfigStore, mockSignerAddressStore, mockChainIdStore } = await vi.hoisted(
	() => import('$lib/mocks/mockStores')
);

vi.mock('svelte-wagmi', () => {
	return {
		wagmiConfig: mockWagmiConfigStore,
		signerAddress: mockSignerAddressStore,
		chainId: mockChainIdStore
	};
});

vi.mock('../../generated', () => ({
	readErc20TotalSupply: vi.fn()
}));

describe('Footer.svelte', () => {
	beforeEach(() => {
		vi.spyOn(global, 'fetch').mockResolvedValue({} as Response);
	});

	it('should display cyFLR and sFLR supplies correctly when fetched', async () => {
		(readErc20TotalSupply as Mock)
			.mockResolvedValueOnce(BigInt(2000000000000000000))
			.mockResolvedValueOnce(BigInt(5000000000000000000));

		render(Footer);

		await waitFor(() => {
			expect(screen.getByTestId('cysFlr-supply')).toBeInTheDocument();
			expect(screen.getByText('2')).toBeInTheDocument();
		});

		await waitFor(() => {
			expect(screen.getByTestId('sFlr-supply')).toBeInTheDocument();
			expect(screen.getByText('5')).toBeInTheDocument();
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
