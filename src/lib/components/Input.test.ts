import { render, screen, fireEvent } from '@testing-library/svelte';
import Input from './Input.svelte';
import { describe, it, expect } from 'vitest';

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
		await fireEvent.input(input, { target: { value: '10.5' } });

		expect((input as HTMLInputElement).value).toBe('10.5');
	});
});
