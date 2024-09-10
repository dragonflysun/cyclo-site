import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';

const { mockWagmiConfigStore } = await vi.hoisted(() => import('./src/lib/mocks/mockStores'));

vi.mock('svelte-wagmi', async (importOriginal) => {
	return {
		...((await importOriginal()) as object),
		wagmiConfig: mockWagmiConfigStore
	};
});
