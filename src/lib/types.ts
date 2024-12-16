import { type Hex } from 'viem';

export type Receipt = {
	chainId: string;
	tokenAddress: Hex;
	tokenId: string;
	balance: bigint;
	readableTokenId?: string;
	readableTotalsFlr?: string;
	readableFlrPerReceipt?: string;
	totalsFlr?: bigint;
};

export type BlockScoutData = {
	token: {
		address: string;
	};
	value: string;
	id: string;
};
