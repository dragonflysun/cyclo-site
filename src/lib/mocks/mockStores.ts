import { writable } from 'svelte/store';

import { type Config } from '@wagmi/core';
import type { Hex } from 'viem';
import { mockWeb3Config } from './mockWagmiConfig';

// Mock writable stores
export const web3ModalStore = writable<null>(null);
const mockWrongNetworkWritable = writable<boolean>(false);
const mockSignerAddressWritable = writable<string>('');
const mockChainIdWritable = writable<number>(0);
const mockPageWritable = writable({ url: { pathname: '/' } });
const mockConnectedWritable = writable<boolean>(false);
const mockWagmiConfigWritable = writable<Config>(mockWeb3Config);
const erc1155AddressWritable = writable<Hex>('0x6D6111ab02800aC64f66456874add77F44529a90');
const mockCysFlrAddressWritable = writable<Hex>('0x91e3B9820b47c7D4e6765E90F94C1638E7bc53C6');
const mockSFlrAddressWritable = writable<Hex>('0x91e3B9820b47c7D4e6765E90F94C163123456789');

const mockBalancesWritable = writable({
	cysFlrBalance: BigInt(100),
	sFlrBalance: BigInt(100),
	status: 'Checking',
	lockPrice: BigInt(1),
	cysFlrUsdPrice: BigInt(1),
	sFlrUsdPrice: BigInt(1),
	cysFlrSupply: BigInt(1000000),
	TVLsFlr: BigInt(1000),
	TVLUsd: BigInt(1000),
	swapQuotes: {
		cysFlrOutput: BigInt(0),
		cusdxOutput: BigInt(0)
	}
});

export const mockBalancesStore = {
	subscribe: mockBalancesWritable.subscribe,
	set: mockBalancesWritable.set,
	mockSetSubscribeValue: (
		cysFlrBalance: bigint,
		sFlrBalance: bigint,
		status: string,
		lockPrice: bigint,
		cysFlrUsdPrice: bigint,
		sFlrUsdPrice: bigint,
		cysFlrSupply: bigint = BigInt(1000000),
		TVLsFlr: bigint = BigInt(1000),
		TVLUsd: bigint = BigInt(1000),
		swapQuotes: {
			cysFlrOutput: bigint;
			cusdxOutput: bigint;
		}
	): void => {
		mockBalancesWritable.set({
			cysFlrBalance,
			sFlrBalance,
			status,
			lockPrice,
			cysFlrUsdPrice,
			sFlrUsdPrice,
			cysFlrSupply,
			TVLsFlr,
			TVLUsd,
			swapQuotes
		});
	}
};
export const mockWrongNetworkStore = {
	subscribe: mockWrongNetworkWritable.subscribe,
	set: mockWrongNetworkWritable.set,
	mockSetSubscribeValue: (value: boolean): void => mockWrongNetworkWritable.set(value)
};

export const mockSignerAddressStore = {
	subscribe: mockSignerAddressWritable.subscribe,
	set: mockSignerAddressWritable.set,
	mockSetSubscribeValue: (value: string): void => mockSignerAddressWritable.set(value)
};

export const mockChainIdStore = {
	subscribe: mockChainIdWritable.subscribe,
	set: mockChainIdWritable.set,
	mockSetSubscribeValue: (value: number): void => mockChainIdWritable.set(value)
};

export const mockPageStore = {
	subscribe: mockPageWritable.subscribe,
	set: mockPageWritable.set,
	mockSetSubscribeValue: (value: { url: { pathname: string } }): void => mockPageWritable.set(value)
};

export const mockConnectedStore = {
	subscribe: mockConnectedWritable.subscribe,
	set: mockConnectedWritable.set,
	mockSetSubscribeValue: (value: boolean): void => mockConnectedWritable.set(value)
};

export const mockWagmiConfigStore = {
	subscribe: mockWagmiConfigWritable.subscribe,
	set: mockWagmiConfigWritable.set,
	mockSetSubscribeValue: (value: Config): void => mockWagmiConfigWritable.set(value)
};

export const mockErc1155AddressStore = {
	subscribe: erc1155AddressWritable.subscribe,
	set: erc1155AddressWritable.set,
	mockSetSubscribeValue: (value: Hex): void => erc1155AddressWritable.set(value)
};

export const mockCysFlrAddressStore = {
	subscribe: mockCysFlrAddressWritable.subscribe,
	set: mockCysFlrAddressWritable.set,
	mockSetSubscribeValue: (value: Hex): void => mockCysFlrAddressWritable.set(value)
};

export const mockSflrAddressStore = {
	subscribe: mockSFlrAddressWritable.subscribe,
	set: mockSFlrAddressWritable.set,
	mockSetSubscribeValue: (value: Hex): void => mockSFlrAddressWritable.set(value)
};
