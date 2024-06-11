import { writable, get } from 'svelte/store';
import { writeContract, waitForTransactionReceipt, simulateContract } from '@wagmi/core';
import type { Abi, Hex } from 'viem';
import { wrongNetwork, targetNetwork } from '$lib/stores';

import type { Config } from '@wagmi/core';

export enum TransactionStatus {
	IDLE = 'Idle',
	PENDING_WALLET = 'Waiting for wallet confirmation...',
	PENDING_APPROVAL = 'Approving WFLR spend...',
	PENDING_LOCK = 'Locking WFLR...',
	PENDING_UNLOCK = 'Unlocking WFLR...',
	SUCCESS = 'Success! Transaction confirmed',
	ERROR = 'Something went wrong'
}

export type InitiateTransactionArgs = {
	contractAddress: string;
	abi: Abi;
	functionName: string;
	args: never[];
	ipfsUpload: boolean;
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
	functionName: ''
};

// TODO: Add a timeout on all transactions
const transactionStore = () => {
	const _targetNetwork = get(targetNetwork);
	const { subscribe, set, update } = writable(initialState);

	const reset = () => set(initialState);

	const awaitWalletConfirmation = () =>
		update((state) => ({ ...state, status: TransactionStatus.PENDING_WALLET }));

	const awaitApprovalTx = (hash: string) =>
		update((state) => ({ ...state, hash: hash, status: TransactionStatus.PENDING_APPROVAL }));

	const awaitLockTx = (hash: string) =>
		update((state) => ({ ...state, hash: hash, status: TransactionStatus.PENDING_LOCK }));

	const awaitUnlockTx = (hash: string) =>
		update((state) => ({ ...state, hash: hash, status: TransactionStatus.PENDING_UNLOCK }));

	const transactionSuccess = (hash: string) =>
		update((state) => ({
			...state,
			status: TransactionStatus.SUCCESS,
			hash: hash
		}));

	const transactionError = (txError: TxError) =>
		update((state) => ({
			...state,
			status: TransactionStatus.ERROR,
			error: { message: 'message' }
		}));

	const initiateTransaction = async ({
		contractAddress,
		abi,
		functionName,
		args,
		ipfsUpload,
		config
	}: InitiateTransactionArgs) => {
		update((state) => ({
			...state,
			functionName: functionName
		}));

		const wrongNet = get(wrongNetwork);
		if (wrongNet) {
			transactionError({
				code: 500,
				message: `Please connect to ${_targetNetwork.name} to continue.`
			});
		}

		awaitWalletConfirmation();

		try {
			try {
				// CONTRACT CALL
				transactionSuccess(hash);
			} catch (error) {
				console.log('err', error);
				transactionError({
					code: 500,
					details: hash,
					message:
						'User rejected the transaction. This means that the transaction was not confirmed by the user in their wallet.'
				});
			}
		} catch (error) {
			console.log('err', error);
			transactionError({
				code: 500,
				message:
					'There was a problem preparing the transaction. This means that invalid values were passed to the contract. Please contact the administrator.'
			});
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
