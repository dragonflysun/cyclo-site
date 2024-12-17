import type { Config } from '@wagmi/core';
import {
	readErc20BalanceOf,
	readErc20TotalSupply,
	simulateErc20PriceOracleReceiptVaultPreviewDeposit,
	simulateQuoterQuoteExactInputSingle,
} from '../generated';
import { multicall } from "@wagmi/core"
import { writable } from 'svelte/store';
import type { Hex } from 'viem';
import { ZeroAddress } from 'ethers';
import {quoterAbi} from "$lib/contracts/quoterAbi"
import {erc20PriceOracleReceiptVaultAbi} from "$lib/contracts/ERC20PriceOracleReceiptVaultAbi"

const initialState = {
	cysFlrBalance: BigInt(0),
	sFlrBalance: BigInt(0),
	status: 'Checking',
	lockPrice: BigInt(0),
	cysFlrUsdPrice: BigInt(0),
	cysFlrSupply: BigInt(0),
	TVLsFlr: BigInt(0),
	TVLUsd: BigInt(0),
	swapQuotes: {
		cysFlrOutput: BigInt(0),
		cusdxOutput: BigInt(0)
	}
};

const getSwapQuote = async (
	config: Config,
	cysFlrAddress: Hex,
	cusdxAddress: Hex,
	assets: bigint,
	quoterAddress: Hex
) => {
	const { result: depositPreviewValue } = await simulateErc20PriceOracleReceiptVaultPreviewDeposit(
		config,
		{
			address: cysFlrAddress,
			args: [assets, 0n],
			account: ZeroAddress as `0x${string}`
		}
	);
	const { result: swapQuote } = await simulateQuoterQuoteExactInputSingle(config, {
		address: quoterAddress,
		args: [
			{
				tokenIn: cysFlrAddress,
				tokenOut: cusdxAddress,
				amountIn: depositPreviewValue,
				fee: 3000,
				sqrtPriceLimitX96: BigInt(0)
			}
		]
	});
	return { cysFlrOutput: depositPreviewValue, cusdxOutput: swapQuote[0] };
};

const getPrices = async (
	config: Config,
	quoterAddress: Hex,
	cusdxAddress: Hex,
	cysFlrAddress: Hex
) => {
	const data = await multicall(config,{
		contracts: [

			{
				address: cysFlrAddress,
				abi: erc20PriceOracleReceiptVaultAbi,
				functionName: 'previewDeposit',
				account: ZeroAddress as `0x${string}`,
				args: [BigInt(1e18), 0n]
			},
			{
				address: quoterAddress,
				abi: quoterAbi,
				functionName: 'quoteExactOutputSingle',
				args: [{
					tokenIn: cusdxAddress,
					tokenOut: cysFlrAddress,
					amount: BigInt(1e18),
					fee: 3000,
					sqrtPriceLimitX96: BigInt(0)
				}]
			}
		]
	});

	console.log(data[0], data[1])

	return {
		cysFlrUsdPrice: data[0] || 0n,
		lockPrice: data[1] || 0n
	};
};

const getcysFLRSupply = async (config: Config, cysFlrAddress: Hex) => {
	const data = await readErc20TotalSupply(config, {
		address: cysFlrAddress
	});
	return data;
};

// Get the TVL

const getsFLRBalanceLockedInCysFlr = async (
	config: Config,
	cysFlrAddress: Hex,
	sFlrAddress: Hex
) => {
	const sFlrBalanceLockedInCysFlr = await readErc20BalanceOf(config, {
		address: sFlrAddress,
		args: [cysFlrAddress]
	});
	return sFlrBalanceLockedInCysFlr;
};

const balancesStore = () => {
	const { subscribe, set, update } = writable(initialState);
	const reset = () => set(initialState);

	const refreshPrices = async (
		config: Config,
		cysFlrAddress: Hex,
		quoterAddress: Hex,
		cusdxAddress: Hex,
		sFlrAddress: Hex
	) => {
		try {
			const [prices, cysFlrSupply, sFlrBalanceLockedInCysFlr] = await Promise.all([
				getPrices(config, quoterAddress, cusdxAddress, cysFlrAddress),
				getcysFLRSupply(config, cysFlrAddress),
				getsFLRBalanceLockedInCysFlr(config, cysFlrAddress, sFlrAddress)
			]);

			const TVLUsd = (sFlrBalanceLockedInCysFlr * prices.lockPrice) / BigInt(1e18);
			const TVLsFlr = sFlrBalanceLockedInCysFlr;

			update((state) => ({
				...state,
				status: 'Ready',
				cysFlrUsdPrice: prices.cysFlrUsdPrice,
				lockPrice: prices.lockPrice,
				cysFlrSupply,
				TVLsFlr,
				TVLUsd
			}));
		} catch (error) {
			console.error('Error refreshing prices:', error);
			update((state) => ({
				...state,
				status: 'Error'
			}));
		}
	};

	const refreshBalances = async (
		config: Config,
		sFlrAddress: Hex,
		cysFlrAddress: Hex,
		signerAddress: string
	) => {
		try {
			const [newSFlrBalance, newCysFlrBalance] = await Promise.all([
				readErc20BalanceOf(config, {
					address: sFlrAddress,
					args: [signerAddress as Hex]
				}),
				readErc20BalanceOf(config, {
					address: cysFlrAddress,
					args: [signerAddress as Hex]
				})
			]);

			update((state) => ({
				...state,
				sFlrBalance: newSFlrBalance,
				cysFlrBalance: newCysFlrBalance,
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

	const refreshSwapQuote = async (
		config: Config,
		cysFlrAddress: Hex,
		cusdxAddress: Hex,
		assets: bigint,
		quoterAddress: Hex
	) => {
		const swapQuotes = await getSwapQuote(
			config,
			cysFlrAddress,
			cusdxAddress,
			assets,
			quoterAddress
		);
		update((state) => ({
			...state,
			swapQuotes
		}));
	};

	return {
		subscribe,
		reset,
		refreshBalances,
		refreshPrices,
		refreshSwapQuote
	};
};

export default balancesStore();
