import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { get } from 'svelte/store';
import cysFlrBalanceStore from './balancesStore';
import { readErc20BalanceOf } from '../generated';
import balancesStore from './balancesStore';
import type { Config } from '@wagmi/core';

const { mockWagmiConfigStore } = await vi.hoisted(() => import('./mocks/mockStores'));

vi.mock('../generated', () => ({
	readErc20BalanceOf: vi.fn()
}));

describe('cysFlrBalanceStore', () => {
	const mockSignerAddress = '0x1234567890abcdef';
	const mocksFlrAddress = '0xabcdef1234567890';
	const mockCysFlrAddress = '0xabcdefabcdef1234';

	const { reset, refreshcysFLR, refreshSflr } = balancesStore;

	beforeEach(() => {
		vi.resetAllMocks();
		reset();
	});

	it.only('should initialize with the correct default state', () => {
		expect(get(cysFlrBalanceStore)).toEqual({
			cysFLRBalance: BigInt(0),
			sFlrBalance: BigInt(0),
			status: 'Checking'
		});
	});

	it.only('should refresh sFlrBalance correctly', async () => {
		const mockWFlrBalance = BigInt(1000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockWFlrBalance);

		await refreshSflr(
			mockWagmiConfigStore as unknown as Config,
			mocksFlrAddress,
			mockSignerAddress
		);

		const storeValue = get(cysFlrBalanceStore);
		expect(storeValue.sFlrBalance).toBe(mockWFlrBalance);
		expect(storeValue.status).toBe('Ready');
	});

	it.only('should refresh cysFLRBalance correctly', async () => {
		const mockCyFlrBalance = BigInt(2000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockCyFlrBalance);

		await refreshcysFLR(
			mockWagmiConfigStore as unknown as Config,
			mockCysFlrAddress,
			mockSignerAddress
		);

		const storeValue = get(cysFlrBalanceStore);
		expect(storeValue.cysFLRBalance).toBe(mockCyFlrBalance);
		expect(storeValue.status).toBe('Ready');
	});

	it.only('should reset the store to its initial state', () => {
		const mockWFlrBalance = BigInt(1000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockWFlrBalance);
		refreshSflr(mockWagmiConfigStore as unknown as Config, mocksFlrAddress, mockSignerAddress);

		reset();

		expect(get(cysFlrBalanceStore)).toEqual({
			cysFLRBalance: BigInt(0),
			sFlrBalance: BigInt(0),
			status: 'Checking'
		});
	});
});
