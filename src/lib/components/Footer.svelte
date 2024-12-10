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
		const FLARE_USDCE = '0xFbDa5F676cB37624f28265A144A48B0d6e87d3b6';
		const FEE_0_3_PERCENT = 3000;

		// Encode path in reverse order (USDC -> cysFLR)
		const path = encodePacked(
			['address', 'uint24', 'address'],
			[FLARE_USDCE, FEE_0_3_PERCENT, $cysFlrAddress]
		);

		const data = await simulateQuoterQuoteExactOutput($wagmiConfig, {
			address: $quoterAddress,
			args: [
				path,
				parseUnits('1.0', 6) // 1 USDC (6 decimals)
			]
		});

		console.log('DATA!', data);
		// return (cysFlrUsdPrice = data);
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
