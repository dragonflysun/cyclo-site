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
const mockCyFlrAddressWritable = writable<Hex>('0x91e3B9820b47c7D4e6765E90F94C1638E7bc53C6');

const mockBalancesWritable = writable({
	cysFLRBalance: BigInt(100),
	sFlrBalance: BigInt(100),
	status: 'Checking'
});

export const mockBalancesStore = {
	subscribe: mockBalancesWritable.subscribe,
	set: mockBalancesWritable.set,
	mockSetSubscribeValue: (cysFLRBalance: bigint, sFlrBalance: bigint, status: string): void => {
		console.log('Mock Balances Store Updated:', { cysFLRBalance, sFlrBalance, status });
		mockBalancesWritable.set({
			cysFLRBalance,
			sFlrBalance,
			status
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

export const mockCyFlrAddressStore = {
	subscribe: mockCyFlrAddressWritable.subscribe,
	set: mockCyFlrAddressWritable.set,
	mockSetSubscribeValue: (value: Hex): void => mockCyFlrAddressWritable.set(value)
};
