import type { Receipt } from '$lib/types';
import axios from 'axios';
import { formatEther } from 'ethers';

export const getReceipts = async (address: string) => {
	const query: string = `https://api.routescan.io/v2/network/mainnet/evm/14/address/${address}/erc1155-holdings?limit=1000`;

	try {
		const response = await axios.get(query);

		response.data.items.map((item: Receipt) => {
			item.readableTokenId = formatEther(item.tokenId);
		});
		return response.data; // Return the data here
	} catch (error) {
		console.error(error);
		return null; // Return null or handle the error appropriately
	}
};
