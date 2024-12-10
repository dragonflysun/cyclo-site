import { writable } from 'svelte/store';

import type { Hex } from 'viem';

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
import { TransactionErrorMessage } from './types/errors';

export const ADDRESS_ZERO = '0x0000000000000000000000000000000000000000';
export const ONE = BigInt('1000000000000000000');

export enum TransactionStatus {
	IDLE = 'Idle',
	CHECKING_ALLOWANCE = 'Checking your approved sFLR spend...',
	PENDING_WALLET = 'Waiting for wallet confirmation...',
	PENDING_APPROVAL = 'Approving sFLR spend...',
	PENDING_LOCK = 'Locking sFLR...',
	PENDING_UNLOCK = 'Unlocking sFLR...',
	SUCCESS = 'Success! Transaction confirmed',
	ERROR = 'Something went wrong'
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
	const transactionError = (message: TransactionErrorMessage, hash?: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.ERROR,
			error: message,
			hash: hash || ''
		}));

	const handleLockTransaction = async ({
		signerAddress,
		config,
		cysFlrAddress,
		sFlrAddress,
		erc1155Address,
		assets
	}: initiateLockTransactionArgs) => {
		const writeLock = async () => {
			let hash: Hex | undefined;
			return transactionError(TransactionErrorMessage.GENERIC);
			// GET WALLET CONFIRMATION
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to lock your SFLR...');
				hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: cysFlrAddress,
					args: [assets, signerAddress as Hex, 0n, '0x']
				});
			} catch {
				return transactionError(TransactionErrorMessage.USER_REJECTED_LOCK);
			}
			awaitLockTx(hash);
			// WAIT FOR TX RECEIPT
			try {
				await waitForTransactionReceipt(config, { confirmations: 4, hash: hash });
			} catch {
				return transactionError(TransactionErrorMessage.TIMEOUT, hash);
			}
			// UPDATE BALANCES AND RECEIPTS
			try {
				await balancesStore.refreshBalances(
					config,
					sFlrAddress,
					cysFlrAddress,
					signerAddress as string
				);
				const getReceiptsResult = await getReceipts(signerAddress as Hex, erc1155Address, config);
				if (getReceiptsResult) {
					myReceipts.set(getReceiptsResult);
				}
			} catch {
				return transactionError(TransactionErrorMessage.BALANCE_REFRESH_FAILED, hash);
			}
			// SUCCESS
			return transactionSuccess(
				hash,
				"Congrats! You've successfully locked your SFLR in return for cysFLR. You can burn your cysFLR and receipts to redeem your original FLR at any time, or trade your cysFLR on the Flare Network."
			);
		};

		checkingWalletAllowance();

		const data = await readErc20Allowance(config, {
			address: sFlrAddress,
			args: [signerAddress as Hex, cysFlrAddress]
		});

		if (data < assets) {
			awaitWalletConfirmation('You need to approve the cysFLR contract to lock your SFLR...');
			// GET WALLET CONFIRMATION FOR APPROVAL
			let hash: Hex | undefined;
			try {
				hash = await writeErc20Approve(config, {
					address: sFlrAddress,
					args: [cysFlrAddress, assets]
				});
			} catch {
				return transactionError(TransactionErrorMessage.USER_REJECTED_APPROVAL);
			}

			awaitApprovalTx(hash);
			// WAIT FOR TX RECEIPT FOR APPROVAL
			try {
				await waitForTransactionReceipt(config, { hash: hash });
			} catch {
				return transactionError(TransactionErrorMessage.TIMEOUT, hash);
			}

			// WRITE LOCK TRANSACTION
			return writeLock();
		} else {
			// WRITE LOCK TRANSACTION
			return writeLock();
		}
	};

	const handleUnlockTransaction = async ({
		signerAddress,
		config,
		cysFlrAddress,
		sFlrAddress,
		erc1155Address,
		tokenId,
		assets
	}: InitiateUnlockTransactionArgs) => {
		const writeUnlock = async () => {
			let hash: Hex | undefined;
			// GET WALLET CONFIRMATION
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to unlock your SFLR...');
				hash = await writeErc20PriceOracleReceiptVaultRedeem(config, {
					address: cysFlrAddress,
					args: [assets, signerAddress as Hex, signerAddress as Hex, BigInt(tokenId), '0x']
				});
			} catch {
				return transactionError(TransactionErrorMessage.USER_REJECTED_UNLOCK);
			}
			awaitUnlockTx(hash);
			// WAIT FOR TX RECEIPT
			try {
				await waitForTransactionReceipt(config, { confirmations: 4, hash: hash });
			} catch {
				return transactionError(TransactionErrorMessage.TIMEOUT, hash);
			}
			// UPDATE BALANCES AND RECEIPTS
			try {
				await balancesStore.refreshBalances(
					config,
					sFlrAddress,
					cysFlrAddress,
					signerAddress as string
				);
				const getReceiptsResult = await getReceipts(signerAddress as Hex, erc1155Address, config);
				if (getReceiptsResult) {
					myReceipts.set(getReceiptsResult);
				}
			} catch {
				return transactionError(TransactionErrorMessage.BALANCE_REFRESH_FAILED, hash);
			}
			// SUCCESS
			return transactionSuccess(hash);
		};

		const writeApprovecysFlrSpend = async () => {
			awaitWalletConfirmation('You need to approve the cysFLR spend to unlock your SFLR...');
			let hash: Hex | undefined;

			try {
				hash = await writeErc20Approve(config, {
					address: cysFlrAddress,
					args: [cysFlrAddress, assets]
				});
			} catch {
				console.log('writeApprovecysFlrSpend error');
				return transactionError(TransactionErrorMessage.USER_REJECTED_APPROVAL);
			}

			awaitApprovalTx(hash);
			try {
				await waitForTransactionReceipt(config, { hash: hash });
				return writeUnlock();
			} catch {
				return transactionError(TransactionErrorMessage.TIMEOUT, hash);
			}
		};

		checkingWalletAllowance('Checking you are approved to unlock your sFLR...');

		const isERC1155Approved = await readErc1155IsApprovedForAll(config, {
			address: erc1155Address,
			args: [signerAddress as Hex, cysFlrAddress]
		});

		if (!isERC1155Approved) {
			awaitWalletConfirmation('You need to approve the cysFLR contract to unlock your SFLR...');
			let hash: Hex | undefined;
			try {
				hash = await writeErc1155SetApprovalForAll(config, {
					address: erc1155Address,
					args: [cysFlrAddress, true]
				});
			} catch {
				return transactionError(TransactionErrorMessage.USER_REJECTED_APPROVAL);
			}
			awaitApprovalTx(hash);
			try {
				await waitForTransactionReceipt(config, { hash: hash });
			} catch {
				return transactionError(TransactionErrorMessage.TIMEOUT, hash);
			}

			const cysFlrSpendAllowance = await readErc20Allowance(config, {
				address: cysFlrAddress,
				args: [signerAddress as Hex, cysFlrAddress]
			});
			if (cysFlrSpendAllowance < assets) {
				return writeApprovecysFlrSpend();
			} else {
				return writeUnlock();
			}
		} else {
			const cysFlrSpendAllowance = await readErc20Allowance(config, {
				address: cysFlrAddress,
				args: [signerAddress as Hex, cysFlrAddress]
			});
			if (cysFlrSpendAllowance < assets) {
				return writeApprovecysFlrSpend();
			} else {
				return writeUnlock();
			}
		}
	};

	return {
		subscribe,
		reset,
		handleLockTransaction,
		handleUnlockTransaction,
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
