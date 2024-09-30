import type { Config } from '@wagmi/core';
import { readErc20BalanceOf } from '../generated';
import { writable } from 'svelte/store';
import type { Hex } from 'viem';

const initialState = {
	cyFlrBalance: BigInt(0),
	sFlrBalance: BigInt(0),
	status: 'Checking'
};

const cyFlrBalanceStore = () => {
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
		refreshSflr
	};
};

export default cyFlrBalanceStore();
