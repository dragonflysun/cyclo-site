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
import { waitForTransactionReceipt, type Config } from '@wagmi/core';
import { waitFor } from '@testing-library/svelte';

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
	const mockStakedFlareAddress = '0xabcdef1234567890';
	const mockVaultAddress = '0xabcdefabcdef1234';
	const mockCyFlareAddress = '0xcdef1234abcdef5678';
	const mockERC1155Address = '0xabcdefabcdef1234';
	const mockTokenId = '1';
	const mockAssets = BigInt(1000);

	const {
		reset,
		checkingWalletAllowance,
		initiateLockTransaction,
		initiateUnlockTransaction,
		awaitWalletConfirmation,
		awaitApprovalTx,
		awaitLockTx,
		awaitUnlockTx,
		transactionSuccess,
		transactionError
	} = transactionStore;

	beforeEach(() => {
		vi.resetAllMocks();
		reset();
	});

	it('should update status to CHECKING_ALLOWANCE', () => {
		checkingWalletAllowance('');
		expect(get(transactionStore).status).toBe(TransactionStatus.CHECKING_ALLOWANCE);
	});

	it('should update status to PENDING_WALLET with message', () => {
		awaitWalletConfirmation('Waiting for wallet confirmation...');
		expect(get(transactionStore).status).toBe(TransactionStatus.PENDING_WALLET);
		expect(get(transactionStore).message).toBe('Waiting for wallet confirmation...');
	});

	it('should update status to PENDING_APPROVAL', () => {
		awaitApprovalTx('mockHash');
		expect(get(transactionStore).status).toBe(TransactionStatus.PENDING_APPROVAL);
		expect(get(transactionStore).hash).toBe('mockHash');
		expect(get(transactionStore).message).toBe('');
	});

	it('should update status to PENDING_LOCK', () => {
		awaitLockTx('mockLockHash');
		expect(get(transactionStore).status).toBe(TransactionStatus.PENDING_LOCK);
		expect(get(transactionStore).hash).toBe('mockLockHash');
		expect(get(transactionStore).message).toBe('');
	});

	it('should update status to PENDING_UNLOCK', () => {
		awaitUnlockTx('mockUnlockHash');
		expect(get(transactionStore).status).toBe(TransactionStatus.PENDING_UNLOCK);
		expect(get(transactionStore).hash).toBe('mockUnlockHash');
		expect(get(transactionStore).message).toBe('');
	});

	it('should update status to SUCCESS', () => {
		transactionSuccess('mockSuccessHash', 'Transaction completed successfully');
		expect(get(transactionStore).status).toBe(TransactionStatus.SUCCESS);
		expect(get(transactionStore).hash).toBe('mockSuccessHash');
		expect(get(transactionStore).message).toBe('Transaction completed successfully');
	});

	it('should update status to ERROR', () => {
		transactionError('Transaction failed', 'mockErrorHash');
		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe('Transaction failed');
		expect(get(transactionStore).hash).toBe('mockErrorHash');
	});

	it('should update status to ERROR without hash', () => {
		transactionError('Transaction failed');
		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe('Transaction failed');
		expect(get(transactionStore).hash).toBe('');
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
		initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore as unknown as Config,
			stakedFlareAddress: mockStakedFlareAddress,
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

	it('should prompt the user to approve cyFLR contract to lock WFLR if allowance is less than assets', async () => {
		const mockAllowance = BigInt(500);

		(readErc20Allowance as Mock).mockResolvedValueOnce(mockAllowance);
		(writeErc20Approve as Mock).mockResolvedValueOnce('mockHash');

		await initiateLockTransaction({
			signerAddress: '0x123',
			config: mockWagmiConfigStore as unknown as Config,
			stakedFlareAddress: '0x456',
			vaultAddress: '0x789',
			assets: BigInt(1000)
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.PENDING_APPROVAL);
	});

	it('should handle successful lock transaction', async () => {
		(readErc20Allowance as Mock).mockResolvedValue(BigInt(500));
		(writeErc20Approve as Mock).mockResolvedValue('mockApproveHash');
		(writeErc20PriceOracleReceiptVaultDeposit as Mock).mockResolvedValue('mockDepositHash');
		(waitForTransactionReceipt as Mock).mockResolvedValue(true);

		await initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore as unknown as Config,
			stakedFlareAddress: mockStakedFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: BigInt(100)
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.SUCCESS);
		expect(get(transactionStore).hash).toBe('mockDepositHash');
	});

	it('should handle user rejecting spend approval', async () => {
		const mockAllowance = BigInt(500);
		const assets = BigInt(100);

		(readErc20Allowance as Mock).mockResolvedValueOnce(mockAllowance);
		(writeErc20Approve as Mock).mockRejectedValue(new Error('UserRejectedRequestError'));
		(writeErc20PriceOracleReceiptVaultDeposit as Mock).mockRejectedValue('mockDepositHash');

		await initiateLockTransaction({
			signerAddress: '0x123',
			config: mockWagmiConfigStore as unknown as Config,
			stakedFlareAddress: '0x456',
			vaultAddress: '0x789',
			assets
		});

		await waitFor(() => {
			expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
			expect(get(transactionStore).error).toBe(
				'There was an error locking your SFLR. Please try again.'
			);
		});
	});
	it('should handle user rejecting lock transaction confimation', async () => {
		(readErc20Allowance as Mock).mockResolvedValue(BigInt(500));
		(writeErc20Approve as Mock).mockResolvedValue('mockApproveHash');
		(writeErc20PriceOracleReceiptVaultDeposit as Mock).mockRejectedValue(
			new Error('UserRejectedRequestError')
		);

		await initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore as unknown as Config,
			stakedFlareAddress: mockStakedFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: BigInt(100)
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe(
			'There was an error locking your SFLR. Please try again.'
		);
	});

	it('should handle successful unlock transaction', async () => {
		(readErc1155IsApprovedForAll as Mock).mockResolvedValue(true);
		(readErc20Allowance as Mock).mockResolvedValue(mockAssets);
		(writeErc20PriceOracleReceiptVaultRedeem as Mock).mockResolvedValue('mockRedeemHash');
		(waitForTransactionReceipt as Mock).mockResolvedValue(true);

		await initiateUnlockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore as unknown as Config,
			cyFlareAddress: mockCyFlareAddress,
			erc1155Address: mockERC1155Address,
			tokenId: mockTokenId,
			assets: BigInt(100)
		});

		await waitFor(() => {
			expect(get(transactionStore).status).toBe(TransactionStatus.SUCCESS);
		});
		expect(get(transactionStore).hash).toBe('mockRedeemHash');
	});

	it('should handle unlock approval rejection', async () => {
		(readErc1155IsApprovedForAll as Mock).mockResolvedValue(false);

		(writeErc1155SetApprovalForAll as Mock).mockRejectedValue(
			new Error('UserRejectedRequestError')
		);

		await initiateUnlockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore as unknown as Config,
			cyFlareAddress: mockCyFlareAddress,
			erc1155Address: mockERC1155Address,
			tokenId: mockTokenId,
			assets: BigInt(100)
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe('User rejected transaction');
	});

	it('should handle transaction failure during lock', async () => {
		(readErc20Allowance as Mock).mockResolvedValue(BigInt(500));
		(writeErc20Approve as Mock).mockResolvedValue('mockApproveHash');
		(waitForTransactionReceipt as Mock).mockRejectedValue('hash');
		(writeErc20PriceOracleReceiptVaultDeposit as Mock).mockResolvedValue(
			new Error('Transaction failed')
		);

		await initiateLockTransaction({
			signerAddress: mockSignerAddress,
			config: mockWagmiConfigStore as unknown as Config,
			stakedFlareAddress: mockStakedFlareAddress,
			vaultAddress: mockVaultAddress,
			assets: BigInt(100)
		});

		expect(get(transactionStore).status).toBe(TransactionStatus.ERROR);
		expect(get(transactionStore).error).toBe(
			'There was an error locking your SFLR. Please try again.'
		);
	});
});
