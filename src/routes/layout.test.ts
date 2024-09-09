import { render, screen } from '@testing-library/svelte';
import { describe, it, vi, expect, beforeEach } from 'vitest';
import Layout from './+layout.svelte';

const { mockWagmiConfigStore } = await vi.hoisted(() => import('$lib/mocks/mockStores'));

vi.mock('svelte-wagmi', async (importOriginal) => {
	return {
		...((await importOriginal()) as object),
		wagmiConfig: mockWagmiConfigStore
	};
});

describe('Layout.svelte', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('renders the layout when wagmiConfig is truthy', async () => {
		render(Layout);

		expect(screen.getByRole('banner')).toBeInTheDocument(); // Header
		expect(screen.getByRole('main')).toBeInTheDocument(); // Main content
	});

	it('does not render layout when wagmiConfig is falsy', async () => {
		render(Layout);

		expect(screen.queryByRole('banner')).not.toBeInTheDocument();
		expect(screen.queryByRole('main')).not.toBeInTheDocument();
	});
});
