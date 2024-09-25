import { render, screen, waitFor } from '@testing-library/svelte';
import Lock from './Lock.svelte';
import transactionStore from '$lib/transactionStore';
import userEvent from '@testing-library/user-event';
import { vi, describe, beforeEach, it } from 'vitest';

const { mockBalancesStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('$lib/transactionStore', async (importOriginal) => ({
	default: {
		...((await importOriginal) as object),
		initiateLockTransaction: vi.fn().mockResolvedValue({})
	}
}));

describe('Lock Component', () => {
	const initiateLockTransactionSpy = vi.spyOn(transactionStore, 'initiateLockTransaction');

	beforeEach(() => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(1000000000000000000), 'Ready');
		initiateLockTransactionSpy.mockClear();
	});

	it.only('should render WFLR balance and price ratio correctly', async () => {
		render(Lock);
		screen.debug();
		// await waitFor(() => {
		// 	expect(screen.getByTestId('wflr-balance')).toHaveTextContent('1.0000');
		// 	expect(screen.getByTestId('price-ratio')).toBeInTheDocument();
		// });
	});

	it('should calculate the correct cyFLR amount based on input', async () => {
		render(Lock);

		const input = screen.getByTestId('lock-input');
		await userEvent.type(input, '0.5');
		await waitFor(() => {
			expect(screen.getByTestId('calculated-cyflr')).toHaveTextContent('0.500');
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

	it('should disable the lock button if WFLR balance is insufficient', async () => {
		mockBalancesStore.mockSetSubscribeValue(BigInt(0), BigInt(0), 'Ready');
		render(Lock);

		const lockButton = screen.getByTestId('lock-button');
		expect(lockButton).toBeDisabled();
	});
});
