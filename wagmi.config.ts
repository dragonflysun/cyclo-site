import { defineConfig } from '@wagmi/cli';
import { foundry } from '@wagmi/cli/plugins';
import { actions } from '@wagmi/cli/plugins';
import { type ActionsConfig } from '@wagmi/cli/plugins';

export default defineConfig({
	out: 'src/generated.ts',
	plugins: [
		actions(),
		foundry({
			include: ['ERC20PriceOracleReceiptVault.json'],
			project: './ethgild'
		})
	]
});
