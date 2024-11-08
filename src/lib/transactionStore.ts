import { writable } from 'svelte/store';

import type { Hex, WaitForTransactionReceiptErrorType } from 'viem';

import type { Config } from '@wagmi/core';
import { waitForTransactionReceipt } from '@wagmi/core';
import {
	readErc1155IsApprovedForAll,
	readErc20Allowance,
	writeErc1155SetApprovalForAll,
	writeErc20Approve,
	writeErc20PriceOracleReceiptVaultDeposit,
	writeErc20PriceOracleReceiptVaultRedeem
} from '../generated';
import balancesStore from './balancesStore';
import { myReceipts } from './stores';
import { getReceipts } from './queries/getReceipts';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const ONE = BigInt('1000000000000000000');

export enum TransactionStatus {
	IDLE = 'Idle',
	CHECKING_ALLOWANCE = 'Checking your approved sFLR spend...',
	PENDING_WALLET = 'Waiting for wallet confirmation...',
	PENDING_APPROVAL = 'Approving SFLR spend...',
	PENDING_LOCK = 'Locking SFLR...',
	PENDING_UNLOCK = 'Unlocking SFLR...',
	SUCCESS = 'Success! Transaction confirmed',
	ERROR = 'Something went wrong'
}

export enum TransactionError {
	USER_REJECTED = 'User rejected the transaction. Please confirm the transaction in your wallet to proceed.',
	INSUFFICIENT_ALLOWANCE = 'Insufficient allowance. Please approve the cysFLR contract to spend your SFLR.',
	LOCK_TRANSACTION_FAILED = 'Transaction failed while locking SFLR. Please check your network and try again.',
	UNLOCK_TRANSACTION_FAILED = 'Transaction failed while unlocking SFLR. Please check your network and try again.',
	APPROVAL_FAILED = 'Approval transaction failed. Please ensure you have enough funds and try again.',
	ERC1155_APPROVAL_FAILED = 'ERC1155 approval transaction failed. Please try approving the cysFLR contract again.',
	TIMED_OUT = 'Transaction timed out. Please check your wallet or transaction history to confirm its status.',
	INVALID_ASSET_AMOUNT = 'Invalid asset amount. Ensure you have a sufficient balance and are not exceeding the allowance.',
	INSUFFICIENT_FUNDS = 'Insufficient funds in your wallet. Check your balance and try again.',
	NETWORK_ERROR = 'Network error occurred. Please check your connection and try again.',
	UNKNOWN_ERROR = 'An unknown error occurred. Please try again or contact support if the problem persists.',
	UNSUPPORTED_TOKEN = 'Unsupported token. Ensure you are using a supported token address and try again.'
}

export type initiateLockTransactionArgs = {
	signerAddress: string | null;
	sFlrAddress: Hex;
	cysFlrAddress: Hex;
	erc1155Address: Hex;
	assets: bigint;
	config: Config;
};

export type InitiateUnlockTransactionArgs = {
	signerAddress: string | null;
	cysFlrAddress: Hex;
	sFlrAddress: Hex;
	erc1155Address: Hex;
	assets: bigint;
	config: Config;
	tokenId: string;
};

const initialState = {
	status: TransactionStatus.IDLE,
	error: '',
	hash: '',
	data: null,
	functionName: '',
	message: ''
};

const transactionStore = () => {
	const { subscribe, set, update } = writable(initialState);
	const reset = () => set(initialState);

	const checkingWalletAllowance = (message?: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.CHECKING_ALLOWANCE,
			message: message || ''
		}));
	const awaitWalletConfirmation = (message?: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.PENDING_WALLET,
			message: message || ''
		}));
	const awaitApprovalTx = (hash: string) =>
		update((state) => ({
			...state,
			hash: hash,
			status: TransactionStatus.PENDING_APPROVAL,
			message: ''
		}));
	const awaitLockTx = (hash: string) =>
		update((state) => ({
			...state,
			hash: hash,
			status: TransactionStatus.PENDING_LOCK,
			message: ''
		}));
	const awaitUnlockTx = (hash: string) =>
		update((state) => ({
			...state,
			hash: hash,
			status: TransactionStatus.PENDING_UNLOCK,
			message: ''
		}));
	const transactionSuccess = (hash: string, message?: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.SUCCESS,
			hash: hash,
			message: message || ''
		}));
	const transactionError = (error: TransactionError, hash?: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.ERROR,
			error: error,
			hash: hash || ''
		}));

	const handleCatchError = (e: {details: string}, step: string, hash: string | undefined) => {
		console.log('handling catch error!', e.details);
		if (
			e.details.includes('User denied transaction signature') ||
			e.details.includes('User rejected the request.')
		) {
			return transactionError(TransactionError.USER_REJECTED);
		} else if (step === 'lock') {
			return transactionError(TransactionError.LOCK_TRANSACTION_FAILED, hash);
		} else if (step === 'approve') {
			return transactionError(TransactionError.APPROVAL_FAILED, hash);
		} else if (step === 'unlock') {
			return transactionError(TransactionError.UNLOCK_TRANSACTION_FAILED, hash);
		}
	};

	const initiateLockTransaction = async ({
		signerAddress,
		config,
		cysFlrAddress,
		sFlrAddress,
		erc1155Address,
		assets
	}: initiateLockTransactionArgs) => {
		checkingWalletAllowance();

		const data = await readErc20Allowance(config, {
			address: sFlrAddress,
			args: [signerAddress as Hex, cysFlrAddress]
		});

		const handleLock = async () => {
			let hash;
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to lock your SFLR...');
				hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: cysFlrAddress,
					args: [assets, signerAddress as Hex, 0n, '0x']
				});

				awaitLockTx(hash);
				await waitForTransactionReceipt(config, { confirmations: 1, hash });
				await balancesStore.refreshBalances(
					config,
					sFlrAddress,
					cysFlrAddress,
					signerAddress as string
				);

				const receipts = await getReceipts(signerAddress as Hex, erc1155Address, config);
				if (receipts) {
					myReceipts.set(receipts);
				}
				return transactionSuccess(hash);
			} catch (e: unknown) {
				return handleCatchError(e, 'lock', hash);
			}
		};

		if (data < assets) {
			awaitWalletConfirmation('You need to approve the cysFLR contract to lock your SFLR...');
			let hash;
			try {
				hash = await writeErc20Approve(config, {
					address: sFlrAddress,
					args: [cysFlrAddress, assets]
				});

				awaitApprovalTx(hash);
				await waitForTransactionReceipt(config, { hash });
				return await handleLock();
			} catch (e: unknown) {
				handleCatchError(e, 'approve', hash);
			}
		} else {
			return await handleLock();
		}
	};

	const initiateUnlockTransaction = async ({
		signerAddress,
		config,
		cysFlrAddress,
		sFlrAddress,
		erc1155Address,
		tokenId,
		assets
	}: InitiateUnlockTransactionArgs) => {
		checkingWalletAllowance('Checking you are approved to unlock your SFLR...');

		const handleUnlock = async () => {
			let hash;
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to unlock your SFLR...');
				hash = await writeErc20PriceOracleReceiptVaultRedeem(config, {
					address: cysFlrAddress,
					args: [assets, signerAddress as Hex, signerAddress as Hex, BigInt(tokenId), '0x']
				});

				awaitUnlockTx(hash);
				await waitForTransactionReceipt(config, { confirmations: 4, hash });
				await balancesStore.refreshBalances(
					config,
					sFlrAddress,
					cysFlrAddress,
					signerAddress as string
				);

				const receipts = await getReceipts(signerAddress as Hex, erc1155Address, config);
				if (receipts) {
					myReceipts.set(receipts);
				}
				return transactionSuccess(hash);
			} catch (e: unknown) {
				handleCatchError(e, 'unlock', hash);
			}
		};

		const writeApproveCysFlrSpend = async () => {
			awaitWalletConfirmation('You need to approve the cysFLR spend to unlock your SFLR...');
			let hash;
			try {
				hash = await writeErc20Approve(config, {
					address: cysFlrAddress,
					args: [cysFlrAddress, assets]
				});

				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { confirmations: 1, hash });
				if (res) {
					return res;
				}
			} catch (e: unknown) {
				handleCatchError(e, 'approve', hash);
			}
		};

		const isERC1155Approved = await readErc1155IsApprovedForAll(config, {
			address: erc1155Address,
			args: [signerAddress as Hex, cysFlrAddress]
		});

		if (!isERC1155Approved) {
			awaitWalletConfirmation('You need to approve the cysFLR contract to unlock your SFLR...');
			let hash;
			try {
				hash = await writeErc1155SetApprovalForAll(config, {
					address: erc1155Address,
					args: [cysFlrAddress, true]
				});

				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash });
				if (!res) {
					return transactionError(TransactionError.ERC1155_APPROVAL_FAILED, hash);
				}

				const allowance = await readErc20Allowance(config, {
					address: cysFlrAddress,
					args: [signerAddress as Hex, cysFlrAddress]
				});

				if (allowance < assets) {
					const approvalRes = await writeApproveCysFlrSpend();
					if (!approvalRes) throw new Error(TransactionError.APPROVAL_FAILED);
				}
				return await handleUnlock();
			} catch (e) {
				handleCatchError(e, 'approve', hash);
			}
		} else {
			const allowance = await readErc20Allowance(config, {
				address: cysFlrAddress,
				args: [signerAddress as Hex, cysFlrAddress]
			});

			if (allowance < assets) {
				const approvalRes = await writeApproveCysFlrSpend();
				if (!approvalRes) return;
			}
			return await handleUnlock();
		}
	};

	return {
		subscribe,
		reset,
		initiateLockTransaction,
		initiateUnlockTransaction,
		checkingWalletAllowance,
		awaitWalletConfirmation,
		awaitApprovalTx,
		awaitLockTx,
		awaitUnlockTx,
		transactionSuccess,
		transactionError
	};
};

export default transactionStore();
