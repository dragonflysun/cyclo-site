import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';
import type { Hex } from 'viem';
import type { Receipt } from './types';
import { flare } from '@wagmi/core/chains';

export const cysFlrAddress = writable<Hex>('0xf0363b922299EA467d1E9c0F9c37d89830d9a4C4');
export const sFlrAddress = writable<Hex>('0x12e605bc104e93B45e1aD99F9e555f659051c2BB');
export const erc1155Address = writable<Hex>('0x839D6775a2E76681391C89689Bf2bE7ddEA10f90');

export const targetNetwork = writable<Chain>(flare);
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);

export const myReceipts = writable<Receipt[]>([]);
