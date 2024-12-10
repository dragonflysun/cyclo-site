<script lang="ts">
	import { fade } from 'svelte/transition';
	import { formatEther } from 'ethers';
	import balancesStore from '$lib/balancesStore';
	import { readErc20TotalSupply } from '../../generated';
	import { onMount } from 'svelte';
	import { cysFlrAddress } from '$lib/stores';
	import { wagmiConfig } from 'svelte-wagmi';
	import { formatNumberWithAbbreviations } from '$lib/methods';

	let cysFlrSupply: bigint | null = null;

	const getcysFLRSupply = async () => {
		const data = await readErc20TotalSupply($wagmiConfig, {
			address: $cysFlrAddress
		});
		return (cysFlrSupply = data);
	};

	onMount(() => {
		getcysFLRSupply();
	});

	$: readablecysFLRSupply = cysFlrSupply
		? formatNumberWithAbbreviations(+formatEther(cysFlrSupply))
		: '';
</script>

<footer class="flex h-16 flex-col justify-center bg-[#1C02B8] px-2 text-white">
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
