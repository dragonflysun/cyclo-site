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

	const { reset, refreshcysFlr, refreshsFlr } = balancesStore;

	beforeEach(() => {
		vi.resetAllMocks();
		reset();
	});

	it('should initialize with the correct default state', () => {
		expect(get(cysFlrBalanceStore)).toEqual({
			cysFLRBalance: BigInt(0),
			sFlrBalance: BigInt(0),
			status: 'Checking'
		});
	});

	it('should refresh sFlrBalance correctly', async () => {
		const mocksFlrBalance = BigInt(1000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mocksFlrBalance);

		await refreshsFlr(
			mockWagmiConfigStore as unknown as Config,
			mocksFlrAddress,
			mockSignerAddress
		);

		const storeValue = get(cysFlrBalanceStore);
		expect(storeValue.sFlrBalance).toBe(mocksFlrBalance);
		expect(storeValue.status).toBe('Ready');
	});

	it('should refresh cysFLRBalance correctly', async () => {
		const mockCyFlrBalance = BigInt(2000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockCyFlrBalance);

		await refreshcysFlr(
			mockWagmiConfigStore as unknown as Config,
			mockCysFlrAddress,
			mockSignerAddress
		);

		const storeValue = get(cysFlrBalanceStore);
		expect(storeValue.cysFLRBalance).toBe(mockCyFlrBalance);
		expect(storeValue.status).toBe('Ready');
	});

	it('should reset the store to its initial state', () => {
		const mocksFlrBalance = BigInt(1000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mocksFlrBalance);
		refreshsFlr(mockWagmiConfigStore as unknown as Config, mocksFlrAddress, mockSignerAddress);

		reset();

		expect(get(cysFlrBalanceStore)).toEqual({
			cysFLRBalance: BigInt(0),
			sFlrBalance: BigInt(0),
			status: 'Checking'
		});
	});
});
