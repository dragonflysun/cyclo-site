import { writable } from 'svelte/store';

import type { Hex } from 'viem';

import type { Config } from '@wagmi/core';
import { waitForTransactionReceipt } from '@wagmi/core';
import {
	readErc20Allowance,
	writeErc20Approve,
	writeErc20PriceOracleReceiptVaultDeposit
} from '../generated';

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

export type InitiateTransactionArgs = {
	signerAddress: string | null;
	wrappedFlareAddress: Hex;
	vaultAddress: Hex;
	assets: bigint;
	config: Config;
};

export type TxError = {
	// 1 - Transaction failed
	// 2 - Transaction reverted
	// 3 - Transaction not found
	// 4 - IPFS not logged in
	// 5 - Wrong network
	// 6 - Transaction IPFS Upload failed
	// 7 - Transaction subgraph failed
	message: string;
	details?: string;
};

const initialState = {
	status: TransactionStatus.IDLE,
	error: { code: null, message: '', details: '' },
	hash: '',
	data: null,
	functionName: '',
	message: ''
};

// TODO: Add a timeout on all transactions
const transactionStore = () => {
	const { subscribe, set, update } = writable(initialState);

	const reset = () => set(initialState);

	const checkingWalletAllowance = () =>
		update((state) => ({ ...state, status: TransactionStatus.CHECKING_ALLOWANCE, message: '' }));

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

	const transactionSuccess = (hash: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.SUCCESS,
			hash: hash,
			message: ''
		}));

	const transactionError = (error: { message: string }) =>
		update((state) => ({
			...state,
			status: TransactionStatus.ERROR,
			error: { message: 'message', code: 500, details: '' }
		}));

	const initiateTransaction = async ({
		signerAddress,
		config,
		wrappedFlareAddress,
		vaultAddress,
		assets
	}: InitiateTransactionArgs) => {
		checkingWalletAllowance();
		const data = await readErc20Allowance(config, {
			address: wrappedFlareAddress,
			args: [signerAddress as Hex, vaultAddress]
		});

		if (data < assets) {
			awaitWalletConfirmation('You need to approve the cyFLR contract to lock your FLR...');
			const hash = await writeErc20Approve(config, {
				address: wrappedFlareAddress,
				args: [vaultAddress, assets]
			});
			console.log('HASH from APPROVAL', hash);
			awaitApprovalTx(hash);
			const res = await waitForTransactionReceipt(config, { hash: hash });

			if (res) {
				const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: vaultAddress,
					args: [assets, signerAddress as Hex, ONE, '0x']
				});
				console.log('HASH from MINTING', hash);
				awaitLockTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });
				if (res) {
					transactionSuccess(hash);
				}
			}
		} else {
			try {
				const hash = await writeErc20PriceOracleReceiptVaultDeposit(config, {
					address: vaultAddress,
					args: [assets, signerAddress as Hex, 0n, '0x']
				});
				console.log('HASH from MINTING', hash);
				awaitLockTx(hash);
				const res = await waitForTransactionReceipt(config, { hash: hash });
				if (res) {
					transactionSuccess(hash);
				}
			} catch (error) {
				console.log('err', error);
			}
		}
	};

	return {
		subscribe,
		reset,
		initiateTransaction,
		awaitWalletConfirmation,
		awaitApprovalTx,
		awaitLockTx,
		awaitUnlockTx,
		transactionSuccess,
		transactionError
	};
};

export default transactionStore();
