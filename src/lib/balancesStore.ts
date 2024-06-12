import type { Config } from '@wagmi/core';
import { readErc20BalanceOf } from '../generated';
import { writable } from 'svelte/store';
import type { Hex } from 'viem';

const initialState = {
	cyFlrBalance: BigInt(0),
	status: 'Checking'
};

const cyFlrBalanceStore = () => {
	const { subscribe, set, update } = writable(initialState);
	const reset = () => set(initialState);

	const refreshCyFlr = async (config: Config, signerAddress: string) => {
		const newCyFlrBalance = await readErc20BalanceOf(config, {
			address: '0xa77592e40d4a06e3bceae6f56d61fd26cf2e4be7',
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
		refreshCyFlr
	};
};

export default cyFlrBalanceStore();
