import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { get } from 'svelte/store';
import cyFlrBalanceStore from './balancesStore';
import { readErc20BalanceOf } from '../generated';
import balancesStore from './balancesStore';
import type { Config } from '@wagmi/core';

const { mockWagmiConfigStore } = await vi.hoisted(() => import('./mocks/mockStores'));

vi.mock('../generated', () => ({
	readErc20BalanceOf: vi.fn()
}));

describe('cyFlrBalanceStore', () => {
	const mockSignerAddress = '0x1234567890abcdef';
	const mockWFlrAddress = '0xabcdef1234567890';
	const mockCyFlrAddress = '0xabcdefabcdef1234';

	const { reset, refreshCyFlr, refreshWFlr } = balancesStore;

	beforeEach(() => {
		vi.resetAllMocks();
		reset();
	});

	it.only('should initialize with the correct default state', () => {
		expect(get(cyFlrBalanceStore)).toEqual({
			cyFlrBalance: BigInt(0),
			wFlrBalance: BigInt(0),
			status: 'Checking'
		});
	});

	it.only('should refresh wFlrBalance correctly', async () => {
		const mockWFlrBalance = BigInt(1000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockWFlrBalance);

		await refreshWFlr(
			mockWagmiConfigStore as unknown as Config,
			mockWFlrAddress,
			mockSignerAddress
		);

		const storeValue = get(cyFlrBalanceStore);
		expect(storeValue.wFlrBalance).toBe(mockWFlrBalance);
		expect(storeValue.status).toBe('Ready');
	});

	it.only('should refresh cyFlrBalance correctly', async () => {
		const mockCyFlrBalance = BigInt(2000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockCyFlrBalance);

		await refreshCyFlr(
			mockWagmiConfigStore as unknown as Config,
			mockCyFlrAddress,
			mockSignerAddress
		);

		const storeValue = get(cyFlrBalanceStore);
		expect(storeValue.cyFlrBalance).toBe(mockCyFlrBalance);
		expect(storeValue.status).toBe('Ready');
	});

	it.only('should reset the store to its initial state', () => {
		const mockWFlrBalance = BigInt(1000);
		(readErc20BalanceOf as Mock).mockResolvedValue(mockWFlrBalance);
		refreshWFlr(mockWagmiConfigStore as unknown as Config, mockWFlrAddress, mockSignerAddress);

		reset();

		expect(get(cyFlrBalanceStore)).toEqual({
			cyFlrBalance: BigInt(0),
			wFlrBalance: BigInt(0),
			status: 'Checking'
		});
	});
});
