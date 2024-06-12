import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';
import type { Hex } from 'viem';
import type { Receipt } from './types';

export const erc20PriceOracleReceiptVaultAddress = writable<Hex>(
	'0xA77592E40d4A06e3bCeAe6f56d61FD26Cf2E4bE7'
);
export const cyFlareAddress = writable<Hex>('0xA77592E40d4A06e3bCeAe6f56d61FD26Cf2E4bE7');
export const erc1155Address = writable<Hex>('0xA3b81870529832AE874e0c6F5a03D94EbB042Ba7');
export const wrappedFlareAddress = writable<Hex>('0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d');

export const targetNetwork = writable<Chain>();
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);

export const myReceipts = writable<Receipt[]>([]);
