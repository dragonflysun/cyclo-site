import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';
import type { Hex } from 'viem';
import type { Receipt } from './types';
import { flare } from '@wagmi/core/chains';

export const cysFlrAddress = writable<Hex>('0x19831cfB53A0dbeAD9866C43557C1D48DfF76567');
export const sFlrAddress = writable<Hex>('0x12e605bc104e93B45e1aD99F9e555f659051c2BB');
export const erc1155Address = writable<Hex>('0xd387FC43E19a63036d8FCeD559E81f5dDeF7ef09');
export const quoterAddress = writable<Hex>('0x5B5513c55fd06e2658010c121c37b07fC8e8B705');
export const cusdxAddress = writable<Hex>('0xfe2907dfa8db6e320cdbf45f0aa888f6135ec4f8');

export const targetNetwork = writable<Chain>(flare);
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);

export const myReceipts = writable<Receipt[]>([]);
