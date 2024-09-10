import '@testing-library/jest-dom/vitest';
import { vi } from 'vitest';
const { mockWagmiConfigStore, mockSignerAddressStore, mockChainIdStore } = await vi.hoisted(
	() => import('./src/lib/mocks/mockStores')
);

vi.mock('svelte-wagmi', async () => {
	return {
		// ...((await importOriginal()) as object),
		wagmiConfig: mockWagmiConfigStore,
		signerAddress: mockSignerAddressStore,
		chainId: mockChainIdStore
	};
});
