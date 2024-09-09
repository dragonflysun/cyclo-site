import { describe, it, expect, vi, beforeEach, type Mock } from 'vitest';
import { get } from 'svelte/store';
import transactionStore, { TransactionStatus } from './transactionStore';
import {
	readErc20Allowance,
	writeErc20Approve,
	writeErc20PriceOracleReceiptVaultDeposit,
	writeErc20PriceOracleReceiptVaultRedeem,
	readErc1155IsApprovedForAll,
	writeErc1155SetApprovalForAll
} from '../generated';
import { waitForTransactionReceipt } from '@wagmi/core';

const { mockWagmiConfigStore } = await vi.hoisted(() => import('./mocks/mockStores'));
vi.mock('../generated', () => ({
	readErc20BalanceOf: vi.fn(),
	readErc20Allowance: vi.fn(),
	writeErc20Approve: vi.fn(),
	writeErc20PriceOracleReceiptVaultDeposit: vi.fn(),
	writeErc20PriceOracleReceiptVaultRedeem: vi.fn(),
	readErc1155IsApprovedForAll: vi.fn(),
	writeErc1155SetApprovalForAll: vi.fn()
}));
vi.mock('@wagmi/core', () => ({
	waitForTransactionReceipt: vi.fn()
}));

describe('transactionStore', () => {
	const mockSignerAddress = '0x1234567890abcdef';
	const mockWFlareAddress = '0xabcdef1234567890';
	const mockVaultAddress = '0xabcdefabcdef1234';
	const mockCyFlareAddress = '0xcdef1234abcdef5678';
	const mockERC1155Address = '0xabcdefabcdef1234';
	const mockTokenId = '1';
	const mockAssets = BigInt(1000);

	const { reset, initiateLockTransaction, initiateUnlockTransaction } = transactionStore;

	beforeEach(() => {
		vi.resetAllMocks();
		reset();
	});

	it('should initialize with the correct default state', () => {
		expect(get(transactionStore)).toEqual({
			status: TransactionStatus.IDLE,
			error: '',
			hash: '',
			data: null,
			functionName: '',
			message: ''
		});
	});

	it('should reset the store to its initial state', () => {
		// Modify store state and reset
		initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore,
			wrappedFlareAddress: mockWFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: mockAssets
		});
		reset();
		expect(get(transactionStore)).toEqual({
			status: TransactionStatus.IDLE,
			error: '',
			hash: '',
			data: null,
			functionName: '',
			message: ''
		});
	});

	it('should handle successful lock transaction', async () => {
		(readErc20Allowance as Mock).mockResolvedValue(BigInt(500));

		(writeErc20Approve as Mock).mockResolvedValue('mockApproveHash');
		(writeErc20PriceOracleReceiptVaultDeposit as Mock).mockResolvedValue('mockDepositHash');
		(waitForTransactionReceipt as Mock).mockResolvedValue(true);

		await initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore,
			wrappedFlareAddress: mockWFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: mockAssets
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.SUCCESS);
		expect(get(transactionStore).hash).toBe('mockDepositHash');
	});

	it('should handle failed lock transaction approval', async () => {
		// Mock the allowance check to be below the asset amount
		(readErc20Allowance as Mock).mockResolvedValue(BigInt(500));

		// Mock the write functions and waitForTransactionReceipt
		(writeErc20Approve as Mock).mockRejectedValue(new Error('UserRejectedRequestError'));

		await initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore,
			wrappedFlareAddress: mockWFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: mockAssets
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe('User rejected transaction');
	});

	it('should handle successful unlock transaction', async () => {
		// Mock isApprovedForAll to return true
		(readErc1155IsApprovedForAll as Mock).mockResolvedValue(true);
		// Mock the allowance check and write functions
		(readErc20Allowance as Mock).mockResolvedValue(mockAssets);
		(writeErc20PriceOracleReceiptVaultRedeem as Mock).mockResolvedValue('mockRedeemHash');
		(waitForTransactionReceipt as Mock).mockResolvedValue(true);

		await initiateUnlockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore,
			cyFlareAddress: mockCyFlareAddress,
			erc1155Address: mockERC1155Address,
			tokenId: mockTokenId,
			assets: mockAssets
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.SUCCESS);
		expect(get(transactionStore).hash).toBe('mockRedeemHash');
	});

	it('should handle unlock approval rejection', async () => {
		// Mock isApprovedForAll to return false, requiring approval
		(readErc1155IsApprovedForAll as Mock).mockResolvedValue(false);

		// Mock the write functions and waitForTransactionReceipt
		(writeErc1155SetApprovalForAll as Mock).mockRejectedValue(
			new Error('UserRejectedRequestError')
		);

		await initiateUnlockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore,
			cyFlareAddress: mockCyFlareAddress,
			erc1155Address: mockERC1155Address,
			tokenId: mockTokenId,
			assets: mockAssets
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe('User rejected transaction');
	});

	it('should handle transaction failure during lock', async () => {
		(readErc20Allowance as Mock).mockResolvedValue(BigInt(500));

		(writeErc20Approve as Mock).mockResolvedValue('mockApproveHash');
		(writeErc20PriceOracleReceiptVaultDeposit as Mock).mockRejectedValue(
			new Error('Transaction failed')
		);

		await initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore,
			wrappedFlareAddress: mockWFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: mockAssets
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe(
			'There was an error locking your WFLR. Please try again.'
		);
	});
});
