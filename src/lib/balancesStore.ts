import type { Config } from '@wagmi/core';
import { readErc20BalanceOf } from '../generated';
import { writable } from 'svelte/store';
import type { Hex } from 'viem';

const initialState = {
	cyFlrBalance: BigInt(0),
	wFlrBalance: BigInt(0),
	status: 'Checking'
};

const balancesStore = () => {
	const { subscribe, set, update } = writable(initialState);
	const reset = () => set(initialState);

	const refreshWFlr = async (config: Config, wFlrAddress: Hex, signerAddress: string) => {
		const newWFlrBalance = await readErc20BalanceOf(config, {
			address: wFlrAddress,
			args: [signerAddress as Hex]
		});
		update((state) => ({
			...state,
			wFlrBalance: newWFlrBalance,
			status: 'Ready'
		}));
	};

	const refreshCyFlr = async (config: Config, cyFlrAddress: Hex, signerAddress: string) => {
		const newCyFlrBalance = await readErc20BalanceOf(config, {
			address: cyFlrAddress,
			args: [signerAddress as Hex]
		});
		update((state) => ({
			...state,
			cyFlrBalance: newCyFlrBalance,
			status: 'Ready'
		}));
	};

	return {
		subscribe,
		reset,
		refreshCyFlr,
		refreshWFlr
	};
};

export default balancesStore();
