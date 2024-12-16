import { render, screen, waitFor } from '@testing-library/svelte';
import Footer from './Footer.svelte';
import { describe, it, vi, expect, beforeEach } from 'vitest';

const { mockBalancesStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('ethers', async () => {
	return {
		formatEther: vi.fn().mockImplementation((value) => value.toString()),
		formatUnits: vi.fn().mockImplementation((value) => value.toString())
	};
});

vi.mock('$lib/balancesStore', async () => {
	return {
		default: mockBalancesStore
	};
});

describe('Footer.svelte', () => {
	beforeEach(() => {
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(100), //
			BigInt(100),
			'Ready',
			BigInt(1e18),
			BigInt(1e18),
			BigInt(1e18),
			BigInt(1e18), // cysFlrSupply
			BigInt(3000),
			BigInt(3000) // TVLsFlr
		);
	});

	it('should display cysFLR supply correctly', async () => {
		render(Footer);

		await waitFor(() => {
			expect(screen.getByTestId('cysFlr-supply')).toBeInTheDocument();
		});
	});

	it('should display TVL correctly', async () => {
		render(Footer);

		await waitFor(() => {
			expect(screen.getByTestId('TVL')).toBeInTheDocument();
			expect(screen.getByText('3000 sFLR / $ 3000.00')).toBeInTheDocument();
		});
	});

	it('should not display supply if fetch fails', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(0),
			BigInt(0),
			'Error',
			BigInt(0),
			BigInt(0),
			BigInt(0),
			BigInt(0), // cysFlrSupply
			BigInt(0) // TVL
		);

		render(Footer);

		await waitFor(() => {
			expect(screen.queryByText('Total cysFLR supply')).not.toBeInTheDocument();
			expect(screen.queryByText('Total TVL')).not.toBeInTheDocument();
		});
	});

	it('should display market cap correctly', async () => {
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(0),
			BigInt(0),
			'Error',
			BigInt(0),
			BigInt(1e18),
			BigInt(1e18),
			BigInt(1), // cysFlrSupply
			BigInt(0) // TVL
		);
		render(Footer);

		await waitFor(() => {
			expect(screen.getByTestId('market-cap')).toBeInTheDocument();
			expect(screen.getByText('$ 1000000000000.00')).toBeInTheDocument();
		});
	});
});
