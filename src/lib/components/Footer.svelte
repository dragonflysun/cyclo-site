<script lang="ts">
	import { fade } from 'svelte/transition';
	import { formatEther } from 'ethers';
	import balancesStore from '$lib/balancesStore';
	

</script>

<footer class="flex h-16 flex-col justify-center bg-[#1C02B8] px-2 text-white">
	{#if $balancesStore.lockPrice}
		<div class="flex gap-2" in:fade data-testId="cysFlr-supply">
			Current Lock Price (USD/sFLR) <span>{formatEther($balancesStore.lockPrice)}</span>
		</div>
	{/if}
</footer>
