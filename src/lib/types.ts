import { type Hex } from 'viem';

export type Receipt = {
	chainId: string;
	tokenAddress: Hex;
	tokenId: string;
	balance: bigint;
	readableTokenId?: string;
	readableTotalFlr?: string;
	readableFlrPerReceipt?: string;
};

export type BlockScoutData = {
	token: {
		address: string;
	};
	value: string;
	id: string;
};
