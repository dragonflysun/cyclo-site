import { render, screen, waitFor } from '@testing-library/svelte';
import Lock from './Lock.svelte';
import transactionStore from '$lib/transactionStore';
import userEvent from '@testing-library/user-event';
import { vi, describe, beforeEach, it, expect } from 'vitest';
import { mockSignerAddressStore } from '$lib/mocks/mockStores';

const { mockBalancesStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

// Mock `simulateErc20PriceOracleReceiptVaultPreviewDeposit`
vi.mock('../../generated', async (importOriginal) => {
	return {
		...((await importOriginal()) as object),
		simulateErc20PriceOracleReceiptVaultPreviewDeposit: vi.fn(async () => ({
			result: 14920000000000000n
		}))
	};
});

// Mock `balancesStore`
vi.mock('$lib/balancesStore', async () => {
	return {
		default: mockBalancesStore
	};
});

// Mock `transactionStore`
vi.mock('$lib/transactionStore', async (importOriginal) => ({
	default: {
		...((await importOriginal) as object),
		initiateLockTransaction: vi.fn().mockResolvedValue({})
	}
}));

const mockSimulateContract = vi.fn().mockResolvedValue({
  result: 14920000000000000n // Mock result for `simulateContract`
});


vi.mock('viem', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual as object,
    createPublicClient: vi.fn(() => ({
      simulateContract: mockSimulateContract,
    })),
  };
});

describe('Lock Component', () => {
	const initiateLockTransactionSpy = vi.spyOn(transactionStore, 'initiateLockTransaction');

	beforeEach(() => {
		initiateLockTransactionSpy.mockClear();
		mockBalancesStore.mockSetSubscribeValue(
			BigInt(1234000000000000000), // sFlrBalance
			BigInt(9876000000000000000), // wFlrBalance
			'Ready' // status
		);
	});

	it('should render SFLR balance and price ratio correctly', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('0x1234567890123456789012345678901234567890');
		render(Lock);
		await waitFor(() => {
			expect(screen.getByTestId('sflr-balance')).toBeInTheDocument();

			expect(screen.getByTestId('sflr-balance')).toHaveTextContent('9.8760');
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
			const calculatedCyflr = screen.getByTestId('calculated-cyflr');
			expect(calculatedCyflr).toHaveTextContent('0.001');
		});
	});

	it('should call initiateLockTransaction when lock button is clicked', async () => {
		render(Lock);

		const input = screen.getByTestId('lock-input');
		await userEvent.type(input, '0.5');

		const lockButton = screen.getByTestId('lock-button');
		await userEvent.click(lockButton);

		await waitFor(() => {
			expect(initiateLockTransactionSpy).toHaveBeenCalled();
		});
	});

	it('should disable the lock button if SFLR balance is insufficient', async () => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(0), 'Ready');
		render(Lock);

		const lockButton = screen.getByTestId('lock-button');
		expect(lockButton).toBeDisabled();
	});

	it('should call publicClient.simulateContract if there is no signerAddress', async () => {
		// Set `signerAddress` to null to simulate no wallet connection
		mockSignerAddressStore.mockSetSubscribeValue('');

		// Render the component
		render(Lock);

		// Wait for `simulateContract` to be called
		await waitFor(() => {
			expect(mockSimulateContract).toHaveBeenCalled();
		});
	});

});
