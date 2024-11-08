import { render, screen } from '@testing-library/svelte';
import userEvent from '@testing-library/user-event';
import Input from './Input.svelte';
import { describe, it, expect, vi } from 'vitest';

const { mockSignerAddressStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('svelte-wagmi', async () => {
	return {
		signerAddress: mockSignerAddressStore
	};
});

describe('Input', () => {
	it('renders the input field and unit', () => {
		render(Input, { amount: '0.0', unit: 'FLR' });

		const input = screen.getByPlaceholderText('0.0');
		const unit = screen.getByText('FLR');
		const maxButton = screen.getByText('MAX');

		expect(input).toBeInTheDocument();
		expect(unit).toBeInTheDocument();
		expect(maxButton).toBeInTheDocument();
	});

	it('updates the input value when typing', async () => {
		render(Input, { amount: '0.0' });

		const input = screen.getByPlaceholderText('0.0');
		await userEvent.type(input, '10.5');

		expect((input as HTMLInputElement).value).toBe('0.0105');
	});

	it('prevents non-numeric characters from being entered', async () => {
		render(Input, { amount: '0.0' });

		const input = screen.getByPlaceholderText('0.0');
		await userEvent.type(input, 'abc');

		expect((input as HTMLInputElement).value).toBe('0.0');
	});

	it('allows only a single decimal point', async () => {
		render(Input, { amount: '0.0' });

		const input = screen.getByPlaceholderText('0.0');
		await userEvent.type(input, '10.5.');

		expect((input as HTMLInputElement).value).toBe('0.0105');
	});

	it('does not allow backspace to clear "0"', async () => {
		render(Input, { amount: '0' });

		const input = screen.getByPlaceholderText('0.0');
		await userEvent.type(input, '{backspace}');

		expect((input as HTMLInputElement).value).toBe('0');
	});
	it('disables the max button if no wallet is connected', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('');
		render(Input, { amount: '0' });
		const maxButton = screen.getByTestId('set-val-to-max');
		expect(maxButton).toBeDisabled();
	});
	it('disables the max button if no wallet is connected', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('0x');
		render(Input, { amount: '0' });
		const maxButton = screen.getByTestId('set-val-to-max');
		expect(maxButton.getAttribute('disabled')).toBeFalsy();
	});
});
