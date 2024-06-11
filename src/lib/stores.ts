import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';

export const targetNetwork = writable<Chain>();

export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);
