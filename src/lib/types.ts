import { type Hex } from 'viem';

export type Receipt = {
	chainId: string;
	tokenAddress: Hex;
	tokenId: string;
	balance: bigint;
	readableTokenId?: string;
};
