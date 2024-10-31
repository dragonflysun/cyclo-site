import { render, screen } from '@testing-library/svelte';
import '@testing-library/jest-dom/vitest';
import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Header.svelte', () => {
	beforeEach(() => {
		vi.resetModules();
	});

	it('renders the logo and WalletConnect component', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_LAUNCHED: 'false' }));
		const { default: Header } = await import('./Header.svelte');
		render(Header);

		const logo = screen.getByAltText('Cyclo logo');
		expect(logo).toBeInTheDocument();

		const walletConnectComponent = screen.getByTestId('wallet-connect');
		expect(walletConnectComponent).toBeInTheDocument();
	});

	it('shows the "App" button when PUBLIC_LAUNCHED is "true"', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_LAUNCHED: 'true' }));
		const { default: Header } = await import('./Header.svelte');
		render(Header);

		const appButton = screen.getByRole('button', { name: /App/i });
		expect(appButton).toBeInTheDocument();
	});

	it('does not show the "App" button when PUBLIC_LAUNCHED is not "true"', async () => {
		vi.doMock('$env/static/public', () => ({ PUBLIC_LAUNCHED: 'false' }));
		const { default: Header } = await import('./Header.svelte');
		render(Header);

		const appButton = screen.queryByRole('button', { name: /App/i });
		expect(appButton).not.toBeInTheDocument();
	});
});
