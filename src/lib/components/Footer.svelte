<script lang="ts">
	import { fade } from 'svelte/transition';
	import { readErc20TotalSupply } from '../../generated';
	import { onMount } from 'svelte';
	import { cyFlareAddress, wrappedFlareAddress } from '$lib/stores';
	import { wagmiConfig } from 'svelte-wagmi';
	import { formatEther } from 'ethers';
	import { formatNumberWithAbbreviations } from '$lib/methods';
	let wrappedFlareSupply: bigint | null = null;
	let cyFlareSupply: bigint | null = null;

	const getcysFLRSupply = async () => {
		const data = await readErc20TotalSupply($wagmiConfig, {
			address: $cyFlareAddress
		});
		return (cyFlareSupply = data);
	};

	const getWrappedFlrSupply = async () => {
		const data = await readErc20TotalSupply($wagmiConfig, {
			address: $wrappedFlareAddress
		});
		return (wrappedFlareSupply = data);
	};

	onMount(async () => {
		await getcysFLRSupply();
		await getWrappedFlrSupply();
	});

	$: readableSFLRSupply = wrappedFlareSupply
		? formatNumberWithAbbreviations(+formatEther(wrappedFlareSupply))
		: '';

	$: readablecysFLRSupply = cyFlareSupply
		? formatNumberWithAbbreviations(+formatEther(cyFlareSupply))
		: '';
</script>

<footer class="flex h-16 flex-col justify-center bg-[#1C02B8] px-2 text-white">
	{#if readablecysFLRSupply}
		<div class="flex gap-2" in:fade>Total cysFLR supply <span>{readablecysFLRSupply}</span></div>
	{/if}
	{#if readableSFLRSupply}
		<div class="flex gap-2" in:fade>Total sFLR supply <span>{readableSFLRSupply}</span></div>
	{/if}
</footer>
