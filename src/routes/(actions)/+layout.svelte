<script>
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import balancesStore from '$lib/balancesStore';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { cyFlareAddress, wrappedFlareAddress } from '$lib/stores';

	$: if ($signerAddress) {
		balancesStore.refreshWFlr($wagmiConfig, $wrappedFlareAddress, $signerAddress);
		balancesStore.refreshCyFlr($wagmiConfig, $cyFlareAddress, $signerAddress);
	}
</script>

<div class="flex min-h-screen flex-col items-center gap-6 bg-primary pb-24">
	<div class="flex h-fit max-w-prose gap-6">
		<button
			class=" w-32"
			class:inset={$page.url.pathname === '/lock'}
			on:click={() => goto('/lock')}>Lock</button
		>
		<button
			class="w-32"
			class:inset={$page.url.pathname === '/unlock'}
			on:click={() => goto('/unlock')}>Unlock</button
		>
	</div>
	<slot />
	<TransactionModal />
</div>
