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
	const transactionError = (message: string, hash?: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.ERROR,
			error: message,
			hash: hash || ''
		}));

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

		if (data < assets) {
			awaitWalletConfirmation('You need to approve the cysFLR contract to lock your sFLR...');
			try {
				const hash = await writeErc20Approve(config, {
					address: sFlrAddress,
					args: [cysFlrAddress, assets]
				});

				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });

				if (res) {
					awaitWalletConfirmation('Awaiting wallet confirmation to lock your sFLR...');
					const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
						address: cysFlrAddress,
						args: [assets, signerAddress as Hex, 0n, '0x']
					});

					awaitLockTx(hash);
					const res = await waitForTransactionReceipt(config, { hash: hash });
					if (res) {
						await balancesStore.refreshBalances(
							config,
							sFlrAddress,
							cysFlrAddress,
							signerAddress as string
						);
						transactionSuccess(
							hash,
							"Congrats! You've successfully locked your sFLR in return for cysFLR. You can burn your cysFLR and receipts to redeem your original sFLR at any time, or trade your cysFLR on the Flare Network."
						);
					} else {
						return transactionError('Transaction failed to lock your sFLR', hash);
					}
				}
			} catch (e) {
				const error = e as WaitForTransactionReceiptErrorType;
				transactionError(
					error.name === 'UserRejectedRequestError' ? 'User rejected transaction' : error.name
				);
			}
		} else {
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to lock your sFLR...');
				const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: cysFlrAddress,
					args: [assets, signerAddress as Hex, 0n, '0x']
				});

				awaitLockTx(hash);
				const res = await waitForTransactionReceipt(config, { confirmations: 4, hash: hash });
				if (res) {
					await balancesStore.refreshBalances(
						config,
						sFlrAddress,
						cysFlrAddress,
						signerAddress as string
					);

					const res = await getReceipts(signerAddress as Hex, erc1155Address, config);
					if (res) {
						myReceipts.set(res);
					}
					return transactionSuccess(hash);
				} else {
					transactionError('Transaction failed to lock your sFLR', hash);
				}
			} catch {
				transactionError('There was an error locking your sFLR. Please try again.');
			}
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
		const writeUnlock = async () => {
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to unlock your sFLR...');
				const hash = await writeErc20PriceOracleReceiptVaultRedeem(config, {
					address: cysFlrAddress,
					args: [assets, signerAddress as Hex, signerAddress as Hex, BigInt(tokenId), '0x']
				});
				awaitUnlockTx(hash);
				const res = await waitForTransactionReceipt(config, { confirmations: 4, hash: hash });
				if (res) {
					await balancesStore.refreshBalances(
						config,
						sFlrAddress,
						cysFlrAddress,
						signerAddress as string
					);
					const res = await getReceipts(signerAddress as Hex, erc1155Address, config);
					if (res) {
						myReceipts.set(res);
					}
					return transactionSuccess(hash);
				} else {
					return transactionError('Transaction timed out... You can see more here' + hash);
				}
			} catch {
				return transactionError('There was an error unlocking your sFLR. Please try again.');
			}
		};

		const writeApprovecysFlrSpend = async () => {
			awaitWalletConfirmation('You need to approve the cysFLR spend to unlock your sFLR...');
			try {
				const hash = await writeErc20Approve(config, {
					address: cysFlrAddress,
					args: [cysFlrAddress, assets]
				});
				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });
				if (res) {
					return res;
				} else {
					return transactionError('Transaction failed to approve the cysFLR spend', hash);
				}
			} catch (e) {
				const error = e as WaitForTransactionReceiptErrorType;
				return transactionError(
					error.name === 'UserRejectedRequestError'
						? 'User rejected transaction'
						: 'There was an error approving the cysFLR spend. Please try again.'
				);
			}
		};

		checkingWalletAllowance('Checking you are approved to unlock your sFLR...');

		const isERC1155Approved = await readErc1155IsApprovedForAll(config, {
			address: erc1155Address,
			args: [signerAddress as Hex, cysFlrAddress]
		});

		if (!isERC1155Approved) {
			try {
				awaitWalletConfirmation('You need to approve the cysFLR contract to unlock your sFLR...');
				const hash = await writeErc1155SetApprovalForAll(config, {
					address: erc1155Address,
					args: [cysFlrAddress, true]
				});
				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });

				if (res) {
					const cysFlrSpendAllowance = await readErc20Allowance(config, {
						address: cysFlrAddress,
						args: [signerAddress as Hex, cysFlrAddress]
					});
					if (cysFlrSpendAllowance < assets) {
						try {
							await writeApprovecysFlrSpend();
							writeUnlock();
						} catch {
							transactionError('User rejected transaction');
						}
					}
					writeUnlock();
				} else {
					transactionError('Transaction failed to approve the cysFLR spend', hash);
				}
			} catch {
				transactionError('User rejected transaction');
			}
		} else {
			const cysFlrSpendAllowance = await readErc20Allowance(config, {
				address: cysFlrAddress,
				args: [signerAddress as Hex, cysFlrAddress]
			});
			if (cysFlrSpendAllowance < assets) {
				await writeApprovecysFlrSpend();
				writeUnlock();
			}
			writeUnlock();
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
