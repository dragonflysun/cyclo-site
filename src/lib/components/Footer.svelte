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

	const getCyFlrSupply = async () => {
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
		await getCyFlrSupply();
		await getStakedFlareSupply();
	});

	$: readableSFLRSupply = stakedFlareSupply
		? formatNumberWithAbbreviations(+formatEther(stakedFlareSupply))
		: '';

	$: readableCyFLRSupply = cyFlareSupply
		? formatNumberWithAbbreviations(+formatEther(cyFlareSupply))
		: '';
</script>

<footer class="flex h-16 flex-col justify-center bg-[#1C02B8] px-2 text-white">
	{#if readableCyFLRSupply}
		<div class="flex gap-2" in:fade>Total cyFLR supply <span>{readableCyFLRSupply}</span></div>
	{/if}
	{#if readableSFLRSupply}
		<div class="flex gap-2" in:fade>Total sFLR supply <span>{readableSFLRSupply}</span></div>
	{/if}
</footer>
