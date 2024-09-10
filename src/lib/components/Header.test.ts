import { render, screen } from '@testing-library/svelte';
import Header from './Header.svelte';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect } from 'vitest';

describe('Header.svelte', () => {
	it('renders the logo', () => {
		render(Header);

		const logo = screen.getByAltText('Cyclo logo');
		expect(logo).toBeInTheDocument();
	});

	it('renders the WalletConnect component', () => {
		render(Header);

		const walletConnectComponent = screen.getByTestId('wallet-connect');
		expect(walletConnectComponent).toBeInTheDocument();
	});
});
