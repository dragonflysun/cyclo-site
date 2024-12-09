import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';
import type { Hex } from 'viem';
import type { Receipt } from './types';
import { flare } from '@wagmi/core/chains';

export const cysFlrAddress = writable<Hex>('0x6Eb062Ba625ccafeD34450d80f24Ba11bcef374C');
export const sFlrAddress = writable<Hex>('0x12e605bc104e93B45e1aD99F9e555f659051c2BB');
export const erc1155Address = writable<Hex>('0x6A512b5cD7DF91fA8193E89BD8BD5264519BbF85');

export const targetNetwork = writable<Chain>(flare);
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);

export const myReceipts = writable<Receipt[]>([]);
