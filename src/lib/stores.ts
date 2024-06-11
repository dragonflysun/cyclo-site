import { derived, writable } from 'svelte/store';
import { chainId, signerAddress } from 'svelte-wagmi';
import { type Chain } from '@wagmi/core/chains';

export const targetNetwork = writable<Chain>();
export const erc20PriceOracleReceiptVaultAddress = writable(
	'0xbC8CAb01A78b3EB1963FD613F7DBF4f570e052aa'
);
export const wrappedFlateAddress = writable('0x1D80c49BbBCd1C0911346656B529DF9E5c2F783d')
export const wrongNetwork = derived(
	[chainId, signerAddress, targetNetwork],
	([$chainId, $signerAddress, $targetNetwork]) => $signerAddress && $chainId !== $targetNetwork.id
);
