import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getReceipts } from './getReceipts';
import axios from 'axios';
import { readErc1155BalanceOf } from '../../generated';
import type { Receipt } from '$lib/types';
import type { Config } from '@wagmi/core';
import { formatEther } from 'ethers';

vi.mock('axios');
vi.mock('../../generated', () => ({
    readErc1155BalanceOf: vi.fn(),
}));

describe('getReceipts', () => {
    const mockAddress = '0xMockAddress' as Hex;
    const mockErc1155Address = '0xMockERC1155Address' as Hex;
    const mockConfig = {} as Config;

    const mockData: Receipt[] = [
        {
            chainId: '1',
            tokenAddress: mockErc1155Address,
            tokenId: '1000000000000000000', // 1 ether in wei
            balance: BigInt(1)
        },
        {
            chainId: '1',
            tokenAddress: '0xAnotherERC1155Address' as Hex,
            tokenId: '2000000000000000000', // 2 ether in wei
            balance: BigInt(0)
        }
    ];

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('fetches and processes receipts correctly', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: {
                items: mockData,
            },
        });

        vi.mocked(readErc1155BalanceOf).mockResolvedValueOnce(BigInt(1))

        const result = await getReceipts(mockAddress, mockErc1155Address, mockConfig);

        expect(axios.get).toHaveBeenCalledWith(
            `https://api.routescan.io/v2/network/mainnet/evm/14/address/${mockAddress}/erc1155-holdings?limit=1000`
        );

        expect(readErc1155BalanceOf).toHaveBeenCalled();

        expect(result).toEqual([
            {
                chainId: '1',
                tokenAddress: mockErc1155Address,
                tokenId: '1000000000000000000',
                balance: BigInt(1),
                readableTokenId: formatEther('1000000000000000000') 
            }
        ]);
    });

    it('filters out items with zero balance', async () => {
        vi.mocked(axios.get).mockResolvedValue({
            data: {
                items: mockData,
            },
        });

        vi.mocked(readErc1155BalanceOf).mockResolvedValue(BigInt(0));

        const result = await getReceipts(mockAddress, mockErc1155Address, mockConfig);
        expect(result).toEqual([]);
    });

    it('returns null and logs an error if an exception occurs', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        vi.mocked(axios.get).mockRejectedValue(new Error('Network error'));

        const result = await getReceipts(mockAddress, mockErc1155Address, mockConfig);

        expect(result).toBeNull();
        expect(consoleErrorSpy).toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
    });
});
