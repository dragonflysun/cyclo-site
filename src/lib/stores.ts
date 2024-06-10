import { derived } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { flare } from '@wagmi/core/chains';

export const connectedToFlare = derived(
	[chainId, signerAddress],
	([$chainId, $signerAddress]) => $signerAddress && $chainId === flare.id
);
