import { writable } from 'svelte/store';

import type { Hex, WaitForTransactionReceiptErrorType, WriteContractErrorType } from 'viem';

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
	CHECKING_ALLOWANCE = 'Checking your approved wFLR spend...',
	PENDING_WALLET = 'Waiting for wallet confirmation...',
	PENDING_APPROVAL = 'Approving WFLR spend...',
	PENDING_LOCK = 'Locking WFLR...',
	PENDING_UNLOCK = 'Unlocking WFLR...',
	SUCCESS = 'Success! Transaction confirmed',
	ERROR = 'Something went wrong'
}

export type initiateLockTransactionArgs = {
	signerAddress: string | null;
	wrappedFlareAddress: Hex;
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
		wrappedFlareAddress,
		vaultAddress,
		assets
	}: initiateLockTransactionArgs) => {
		checkingWalletAllowance();

		const erc20Allowance = await readErc20Allowance(config, {
			address: wrappedFlareAddress,
			args: [signerAddress as Hex, vaultAddress]
		});

		if (erc20Allowance < assets) {
			awaitWalletConfirmation('You need to approve the cyFLR contract to lock your WFLR...');

			try {
				const hash = await writeErc20Approve(config, {
					address: wrappedFlareAddress,
					args: [vaultAddress, assets]
				});

				try {
					awaitApprovalTx(hash);
					const res = await waitForTransactionReceipt(config, { hash: hash });

					if (res) {
						awaitWalletConfirmation('Awaiting wallet confirmation to lock your WFLR...');

						const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
							address: vaultAddress,
							args: [assets, signerAddress as Hex, 0n, '0x']
						});

						try {
							awaitLockTx(hash);
							await waitForTransactionReceipt(config, { hash: hash });
							transactionSuccess(
								hash,
								"Congrats! You've successfully locked your WFLR in return for cyFLR. You can burn your cyFLR and receipts to redeem your original FLR at any time, or trade your cyFLR on the Flare Network."
							);
						} catch {
							transactionError('Transaction failed to lock your WFLR', hash);
						}
					}
				} catch {
					return transactionError('Transaction failed to approve the cyFLR spend', hash);
				}
			} catch {
				return transactionError('User rejected transaction');
			}
		} else {
			try {
				awaitWalletConfirmation('Awaiting wallet confirmation to lock your WFLR...');
				const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: vaultAddress,
					args: [assets, signerAddress as Hex, 0n, '0x']
				});

				try {
					awaitLockTx(hash);
					await waitForTransactionReceipt(config, { hash: hash });
					transactionSuccess(hash);
				} catch {
					transactionError('Transaction failed to lock your WFLR', hash);
				}
			} catch {
				return transactionError('User rejected transaction');
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
				awaitWalletConfirmation('Awaiting wallet confirmation to unlock your WFLR...');
				const hash = await writeErc20PriceOracleReceiptVaultRedeem(config, {
					address: cyFlareAddress,
					args: [assets, signerAddress as Hex, signerAddress as Hex, BigInt(tokenId), '0x']
				});
				try {
					awaitUnlockTx(hash);
					await waitForTransactionReceipt(config, { hash: hash });
					balancesStore.refreshCyFlr(config, cyFlareAddress, signerAddress as string);
					return transactionSuccess(hash);
				} catch {
					return transactionError('Transaction timed out... You can see more here' + hash);
				}
			} catch {
				return transactionError('There was an error unlocking your WFLR. Please try again.');
			}
		};

		const writeApproveCyFlareSpend = async () => {
			awaitWalletConfirmation('You need to approve the cyFLR spend to unlock your WFLR...');
			try {
				const hash = await writeErc20Approve(config, {
					address: cyFlareAddress,
					args: [cyFlareAddress, assets]
				});
				try {
					awaitApprovalTx(hash);
					const res = await waitForTransactionReceipt(config, { hash: hash });
					return res;
				} catch {
					return transactionError('Transaction failed to approve the cyFLR spend', hash);
				}
			} catch (e) {
				const error = e as WaitForTransactionReceiptErrorType;
				return transactionError(
					error.name === 'UserRejectedRequestError'
						? 'User rejected transaction'
						: 'There was an error approving the cyFLR spend. Please try again.'
				);
			}
		};

		checkingWalletAllowance('Checking you are approved to unlock your WFLR...');

		const isERC1155Approved = await readErc1155IsApprovedForAll(config, {
			address: erc1155Address,
			args: [signerAddress as Hex, cyFlareAddress]
		});

		if (!isERC1155Approved) {
			try {
				awaitWalletConfirmation('You need to approve the cyFLR contract to unlock your WFLR...');
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
		checkingWalletAllowance,
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
