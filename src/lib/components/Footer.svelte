<script lang="ts">
	import { fade } from 'svelte/transition';
	import { formatEther, parseUnits } from 'ethers';
	import balancesStore from '$lib/balancesStore';
	import {
		readErc20TotalSupply,
		simulateQuoterQuoteExactInputSingle,
		simulateQuoterQuoteExactOutput,
		writeQuoterQuoteExactInputSingle,
		writeQuoterQuoteExactOutput
	} from '../../generated';
	import { onMount } from 'svelte';
	import { cysFlrAddress, quoterAddress } from '$lib/stores';
	import { wagmiConfig } from 'svelte-wagmi';
	import { formatNumberWithAbbreviations } from '$lib/methods';
	import { parseEther } from 'ethers';
	import { encodePacked } from 'viem';

	let cysFlrSupply: bigint | null = null;
	let cysFlrUsdPrice: bigint | null = null;

	const getcysFLRSupply = async () => {
		const data = await readErc20TotalSupply($wagmiConfig, {
			address: $cysFlrAddress
		});
		return (cysFlrSupply = data);
	};

	const getcysFLRUsdPrice = async () => {
		const FLARE_USDCE = '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6' as const;
		const FEE_0_3_PERCENT = 3000;

		const data = await simulateQuoterQuoteExactInputSingle($wagmiConfig, {
			address: $quoterAddress,
			args: [
				{
					tokenIn: $cysFlrAddress,
					tokenOut: FLARE_USDCE,
					amountIn: parseEther('1.0'), // 1 cysFLR (18 decimals)
					fee: FEE_0_3_PERCENT,
					sqrtPriceLimitX96: 0n
				}
			]
		});
		console.log('DATA!', data);
		return (cysFlrUsdPrice = data);
	};

	onMount(() => {
		getcysFLRUsdPrice();
		getcysFLRSupply();
	});

	$: readablecysFLRSupply = cysFlrSupply
		? formatNumberWithAbbreviations(+formatEther(cysFlrSupply))
		: '';
</script>

<footer class="flex h-16 flex-col justify-center bg-[#1C02B8] px-2 text-white">
	<button on:click={getcysFLRUsdPrice}>Get cysFLR USD Price</button>
	{#if $balancesStore.lockPrice}
		<div class="flex gap-2" in:fade data-testId="cysFlr-supply">
			Current Lock Price (USD/sFLR) <span>{formatEther($balancesStore.lockPrice)}</span>
		</div>
	{/if}
	{#if readablecysFLRSupply}
		<div class="flex gap-2" in:fade data-testId="cysFlr-supply">
			Total cysFLR supply <span>{readablecysFLRSupply}</span>
		</div>
	{/if}
</footer>
