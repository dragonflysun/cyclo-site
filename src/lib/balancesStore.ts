import type { Config } from '@wagmi/core';
import { readErc20BalanceOf } from '../generated';
import { writable } from 'svelte/store';
import type { Hex } from 'viem';

const initialState = {
	cyFlrBalance: BigInt(0),
	sflrBalance: BigInt(0),
	status: 'Checking'
};

const cyFlrBalanceStore = () => {
	const { subscribe, set, update } = writable(initialState);
	const reset = () => set(initialState);

	const refreshSflr = async (config: Config, sflrAddress: Hex, signerAddress: string) => {
		const newSflrBalance = await readErc20BalanceOf(config, {
			address: sflrAddress,
			args: [signerAddress as Hex]
		});
		update((state) => ({
			...state,
			sflrBalance: newSflrBalance,
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

	const refreshBothBalances = async (
		config: Config,
		sFlrAddress: Hex,
		cyFlrAddress: Hex,
		signerAddress: string
	) => {
		try {
			const [newSFlrBalance, newCyFlrBalance] = await Promise.all([
				readErc20BalanceOf(config, {
					address: sFlrAddress,
					args: [signerAddress as Hex]
				}),
				readErc20BalanceOf(config, {
					address: cyFlrAddress,
					args: [signerAddress as Hex]
				})
			]);

			update((state) => ({
				...state,
				sFlrBalance: newSFlrBalance,
				cyFlrBalance: newCyFlrBalance,
				status: 'Ready'
			}));
		} catch (error) {
			console.error('Error refreshing balances:', error);
			update((state) => ({
				...state,
				status: 'Error'
			}));
		}
	};

	return {
		subscribe,
		reset,
		refreshCyFlr,
		refreshSflr,
		refreshBothBalances
	};
};

export default cyFlrBalanceStore();
