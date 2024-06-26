import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';
import type { Hex } from 'viem';
import type { Receipt } from './types';
import { flare } from '@wagmi/core/chains';

export const cyFlareAddress = writable<Hex>('0x91e3B9820b47c7D4e6765E90F94C1638E7bc53C6');
export const wrappedFlareAddress = writable<Hex>('0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d');
export const erc1155Address = writable<Hex>('0x6D6111ab02800aC64f66456874add77F44529a90');

export const targetNetwork = writable<Chain>(flare);
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);

export const myReceipts = writable<Receipt[]>([]);
