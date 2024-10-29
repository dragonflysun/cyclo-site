<script lang="ts">
	import { fade } from 'svelte/transition';
	import { readErc20TotalSupply } from '../../generated';
	import { onMount } from 'svelte';
	import { cyFlareAddress, stakedFlareAddress } from '$lib/stores';
	import { wagmiConfig } from 'svelte-wagmi';
	import { formatEther } from 'ethers';
	import { formatNumberWithAbbreviations } from '$lib/methods';
	let stakedFlareSupply: bigint | null = null;
	let cyFlareSupply: bigint | null = null;

	const getcysFLRSupply = async () => {
		const data = await readErc20TotalSupply($wagmiConfig, {
			address: $cyFlareAddress
		});
		return (cyFlareSupply = data);
	};

	const getStakedFlareSupply = async () => {
		const data = await readErc20TotalSupply($wagmiConfig, {
			address: $stakedFlareAddress
		});
		return (stakedFlareSupply = data);
	};

	onMount(async () => {
		await getcysFLRSupply();
		await getStakedFlareSupply();
	});

	$: readableSFLRSupply = stakedFlareSupply
		? formatNumberWithAbbreviations(+formatEther(stakedFlareSupply))
		: '';

	$: readablecysFLRSupply = cyFlareSupply
		? formatNumberWithAbbreviations(+formatEther(cyFlareSupply))
		: '';
</script>

<footer class="flex h-16 flex-col justify-center bg-[#1C02B8] px-2 text-white">
	{#if readablecysFLRSupply}
		<div class="flex gap-2" in:fade data-testId="cysFlr-supply">Total cysFLR supply <span>{readablecysFLRSupply}</span></div>
	{/if}
	{#if readableSFLRSupply}
		<div class="flex gap-2" in:fade data-testId="sFlr-supply">
			Total sFLR supply <span>{readableSFLRSupply}</span>
		</div>
	{/if}
</footer>
