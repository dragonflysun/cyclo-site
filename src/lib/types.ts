import { type Hex } from 'viem';

export type Receipt = {
	chainId: string;
	tokenAddress: Hex;
	tokenId: string;
	balance: string;
	readableTokenId?: string;
};
