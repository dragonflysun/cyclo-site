import { render, screen, fireEvent, waitFor } from '@testing-library/svelte';
import Input from './Input.svelte';
import { describe, it, expect, vi, beforeEach } from 'vitest';

const { mockSignerAddressStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('$lib/stores', async (importOriginal) => {
	return {
		...((await importOriginal()) as object),
		signerAddress: mockSignerAddressStore
	};
});

describe('Input', () => {
	it('renders the input field, token name, and MAX button', () => {
		render(Input, { tokenName: 'FLR' });

		const input = screen.getByPlaceholderText('0.0');
		const tokenName = screen.getByText('FLR');
		const maxButton = screen.getByText('MAX');

		expect(input).toBeInTheDocument();
		expect(tokenName).toBeInTheDocument();
		expect(maxButton).toBeInTheDocument();
	});

	it('updates the input value when typing', async () => {
		render(Input, { tokenName: 'FLR' });

		const input = screen.getByPlaceholderText('0.0');
		await fireEvent.input(input, { target: { value: '10.5' } });

		expect((input as HTMLInputElement).value).toBe('10.5');
	});

	it('sets input value to maxValue when MAX button is clicked', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('0x');

		const maxValue = 50;
		render(Input, { maxValue, tokenName: 'FLR' });

		const maxButton = screen.getByText('MAX');
		await fireEvent.click(maxButton);

		const input = screen.getByPlaceholderText('0.0');
		expect((input as HTMLInputElement).value).toBe(maxValue.toString());
	});

	it('disables the MAX button when signerAddress is not set', () => {
		mockSignerAddressStore.mockSetSubscribeValue('');

		render(Input, { tokenName: 'FLR' });

		const maxButton = screen.getByText('MAX');
		expect(maxButton.hasAttribute('disabled')).toBeTruthy();
	});

	it('enables the MAX button when signerAddress is set', async () => {
		mockSignerAddressStore.mockSetSubscribeValue('0x');

		render(Input, { tokenName: 'FLR' });

		const maxButton = screen.getByText('MAX');
		expect(maxButton.getAttribute('disabled')).toBeFalsy();
	});
});
