import { defineConfig } from '@wagmi/cli';

import { erc20Abi } from 'viem';

export default defineConfig({
	out: 'src/generated.ts',
	contracts: [
		{
			name: 'erc20',
			abi: erc20Abi
		}
	]
});
