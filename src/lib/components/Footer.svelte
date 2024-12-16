<script lang="ts">
	import { fade } from 'svelte/transition';
	import { formatEther, formatUnits } from 'ethers';
	import balancesStore from '$lib/balancesStore';
	import { formatNumberWithAbbreviations } from '$lib/methods';

	$: readablecysFLRSupply = $balancesStore.cysFlrSupply
		? formatNumberWithAbbreviations(+formatEther($balancesStore.cysFlrSupply))
		: '';
</script>

<footer
	class="flex w-full flex-col justify-center bg-[#1C02B8] px-2 pb-6 text-sm text-white sm:px-6 sm:text-base"
>
	<div class="flex w-full max-w-2xl flex-col justify-between gap-4 self-center sm:gap-0">
		{#key $balancesStore.lockPrice}
			<div
				class="flex flex-col justify-between gap-0 sm:flex-row sm:gap-2"
				data-testId="lock-price"
			>
				<span>Current Lock Price (USD/sFLR)</span>
				<span>$ {formatEther($balancesStore.lockPrice)}</span>
			</div>
		{/key}
		{#key $balancesStore.cysFlrUsdPrice}
			<div
				class="flex flex-col justify-between gap-0 sm:flex-row sm:gap-2"
				data-testId="cysFlr-price"
			>
				<span>Current cysFLR Price</span>
				<span>$ {formatUnits($balancesStore.cysFlrUsdPrice, 6)}</span>
			</div>
		{/key}
		{#key $balancesStore.TVLUsd}
			<div
				class="flex flex-col justify-between gap-0 sm:flex-row sm:gap-2"
				data-testId="TVL"
			>
				<span>Total Locked Value</span>
				<span
					>{formatEther($balancesStore.TVLsFlr)} sFLR / $ {Number(
						formatUnits($balancesStore.TVLUsd, 18)
					).toFixed(2)}</span
				>
			</div>
		{/key}
		{#key readablecysFLRSupply}
			<div
				class="flex flex-col justify-between gap-0 sm:flex-row sm:gap-2"
				data-testId="cysFlr-supply"
			>
				<span>Total cysFLR supply</span> <span>{readablecysFLRSupply}</span>
			</div>
		{/key}
	</div>
</footer>
