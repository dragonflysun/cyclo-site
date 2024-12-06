import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';
import type { Hex } from 'viem';
import type { Receipt } from './types';
import { flare } from '@wagmi/core/chains';

export const cysFlrAddress = writable<Hex>('0xD4B47E8F79a65a6376856401efDe8334E00af738');
export const sFlrAddress = writable<Hex>('0x12e605bc104e93B45e1aD99F9e555f659051c2BB');
export const erc1155Address = writable<Hex>('0xB306F9FC8555c77FCFDb59b8F8901E97B5F02DB4');

export const targetNetwork = writable<Chain>(flare);
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);

export const myReceipts = writable<Receipt[]>([]);
