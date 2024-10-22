import type { Config } from '@wagmi/core';
import { readErc20BalanceOf } from '../generated';
import { writable } from 'svelte/store';
import type { Hex } from 'viem';

const initialState = {
	cysFLRBalance: BigInt(0),
	sFlrBalance: BigInt(0),
	status: 'Checking'
};

const cysFLRBalanceStore = () => {
	const { subscribe, set, update } = writable(initialState);
	const reset = () => set(initialState);

	const refreshSflr = async (config: Config, sFlrAddress: Hex, signerAddress: string) => {
		const newSflrBalance = await readErc20BalanceOf(config, {
			address: sFlrAddress,
			args: [signerAddress as Hex]
		});
		update((state) => ({
			...state,
			sFlrBalance: newSflrBalance,
			status: 'Ready'
		}));
	};

	const refreshcysFLR = async (config: Config, cysFLRAddress: Hex, signerAddress: string) => {
		const newcysFLRBalance = await readErc20BalanceOf(config, {
			address: cysFLRAddress,
			args: [signerAddress as Hex]
		});
		update((state) => ({
			...state,
			cysFLRBalance: newcysFLRBalance,
			status: 'Ready'
		}));
	};

	return {
		subscribe,
		reset,
		refreshcysFLR,
		refreshSflr
	};
};

export default cysFLRBalanceStore();
