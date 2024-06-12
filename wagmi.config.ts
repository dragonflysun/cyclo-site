import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';
import { actions } from '@wagmi/cli/plugins';
import { type ActionsConfig } from '@wagmi/cli/plugins';
import { erc20Abi } from 'viem';

export default defineConfig({
	out: 'src/generated.ts',
	contracts: [
		{
			name: 'erc20',
			abi: erc20Abi
		}
	],
	plugins: [
		actions(),
		foundry({
			include: ['ERC20PriceOracleReceiptVault.json'],
			project: './ethgild'
		})
	]
});
