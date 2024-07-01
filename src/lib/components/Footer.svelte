<script lang="ts">
	import { readErc20TotalSupply } from '../../generated';
	import { onMount } from 'svelte';
	import { wrappedFlareAddress } from '$lib/stores';
	import { wagmiConfig } from 'svelte-wagmi';
	let wrappedFlareSupply;
	const getWrappedFlareSupply = async () => {
		const wrappedFlareSupply = await readErc20TotalSupply($wagmiConfig, {
			address: $wrappedFlareAddress
		});
		return wrappedFlareSupply;
	};

	onMount(async () => {
		await getWrappedFlareSupply();
	});

	$: console.log(wrappedFlareSupply);
</script>

<footer class="h-24 bg-none">
	<p>This is the footer component.</p>
</footer>
