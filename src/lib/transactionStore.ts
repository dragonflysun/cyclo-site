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

export type initiateLockTransactionArgs = {
	signerAddress: string | null;
	stakedFlareAddress: Hex;
	vaultAddress: Hex;
	assets: bigint;
	config: Config;
};

export type InitiateUnlockTransactionArgs = {
	signerAddress: string | null;
	cyFlareAddress: Hex;
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
		stakedFlareAddress,
		vaultAddress,
		assets
	}: initiateLockTransactionArgs) => {
		checkingWalletAllowance();
		const data = await readErc20Allowance(config, {
			address: stakedFlareAddress,
			args: [signerAddress as Hex, vaultAddress]
		});
		const writeLock = async () => {
			console.log('wrting Lock');
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to lock your SFLR...');
				const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: vaultAddress,
					args: [assets, signerAddress as Hex, 0n, '0x']
				});

				awaitLockTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });
				if (res) {
					return transactionSuccess(
						hash,
						'You may need to wait a minute or two for your receipt to appear in the list view.'
					);
				}
			} catch (e) {
				console.log(e);
				transactionError('There was an error locking your SFLR. Please try again.');
			}
		};

		if (data < assets) {
			console.log('data2', data < assets);
			awaitWalletConfirmation('You need to approve the cyFLR contract to lock your SFLR...');
			try {
				const hash = await writeErc20Approve(config, {
					address: stakedFlareAddress,
					args: [vaultAddress, assets]
				});

				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });

				if (res) {
					writeLock();
				}
			} catch (e) {
				const error = e as WaitForTransactionReceiptErrorType;
				transactionError(
					error.name === 'UserRejectedRequestError' ? 'User rejected transaction' : error.name
				);
			}
		} else {
			try {
				writeLock();
			} catch (e) {
				console.log(e);
				transactionError('There was an error locking your SFLR. Please try again.');
			}
		}
	};

	const initiateUnlockTransaction = async ({
		signerAddress,
		config,
		cyFlareAddress,
		erc1155Address,
		tokenId,
		assets
	}: InitiateUnlockTransactionArgs) => {
		const writeUnlock = async () => {
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to unlock your SFLR...');
				const hash = await writeErc20PriceOracleReceiptVaultRedeem(config, {
					address: cyFlareAddress,
					args: [assets, signerAddress as Hex, signerAddress as Hex, BigInt(tokenId), '0x']
				});
				awaitUnlockTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });
				if (res) {
					balancesStore.refreshCyFlr(config, cyFlareAddress, signerAddress as string);
					return transactionSuccess(hash);
				} else {
					return transactionError('Transaction timed out... You can see more here' + hash);
				}
			} catch {
				return transactionError('There was an error unlocking your SFLR. Please try again.');
			}
		};

		const writeApproveCyFlareSpend = async () => {
			awaitWalletConfirmation('You need to approve the cyFLR spend to unlock your SFLR...');
			try {
				const hash = await writeErc20Approve(config, {
					address: cyFlareAddress,
					args: [cyFlareAddress, assets]
				});
				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });
				if (res) {
					return res;
				} else {
					return transactionError('Transaction failed to approve the cyFLR spend', hash);
				}
				return res;
			} catch (e) {
				const error = e as WaitForTransactionReceiptErrorType;
				return transactionError(
					error.name === 'UserRejectedRequestError'
						? 'User rejected transaction'
						: 'There was an error approving the cyFLR spend. Please try again.'
				);
			}
		};

		checkingWalletAllowance('Checking you are approved to unlock your SFLR...');

		const isERC1155Approved = await readErc1155IsApprovedForAll(config, {
			address: erc1155Address,
			args: [signerAddress as Hex, cyFlareAddress]
		});

		if (!isERC1155Approved) {
			try {
				awaitWalletConfirmation('You need to approve the cyFLR contract to unlock your SFLR...');
				const hash = await writeErc1155SetApprovalForAll(config, {
					address: erc1155Address,
					args: [cyFlareAddress, true]
				});
				awaitApprovalTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });

				if (res) {
					const cyFlareSpendAllowance = await readErc20Allowance(config, {
						address: cyFlareAddress,
						args: [signerAddress as Hex, cyFlareAddress]
					});
					if (cyFlareSpendAllowance < assets) {
						try {
							await writeApproveCyFlareSpend();
							writeUnlock();
						} catch {
							transactionError('User rejected transaction');
						}
					}
					writeUnlock();
				} else {
					transactionError('Transaction failed to approve the cyFLR spend', hash);
				}
			} catch {
				transactionError('User rejected transaction');
			}
		} else {
			const cyFlareSpendAllowance = await readErc20Allowance(config, {
				address: cyFlareAddress,
				args: [signerAddress as Hex, cyFlareAddress]
			});
			if (cyFlareSpendAllowance < assets) {
				await writeApproveCyFlareSpend();
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
		awaitWalletConfirmation,
		awaitApprovalTx,
		awaitLockTx,
		awaitUnlockTx,
		transactionSuccess,
		transactionError
	};
};

export default transactionStore();
