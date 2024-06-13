<script>
	import { connected, signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import balancesStore from '$lib/balancesStore';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { cyFlareAddress, wrappedFlareAddress, wrongNetwork } from '$lib/stores';
	import { web3Modal } from 'svelte-wagmi';

	$: if ($signerAddress) {
		balancesStore.refreshWFlr($wagmiConfig, $wrappedFlareAddress, $signerAddress);
		balancesStore.refreshCyFlr($wagmiConfig, $cyFlareAddress, $signerAddress);
	}
</script>

<div class="flex min-h-screen flex-col items-center gap-6 bg-primary pb-24 pt-4">
	{#if !$signerAddress || !$connected}
		<button on:click={() => $web3Modal.open()} class="">Connect a wallet to use CYCLO </button>
	{:else if $wrongNetwork}
		<button on:click={() => $web3Modal.open()}>Connect to Flare</button>
	{:else}
		<div class="flex h-fit max-w-prose gap-6">
			<button
				class=" w-32"
				class:inset={$page.url.pathname === '/lock'}
				on:click={() => goto('/lock')}>LOCK</button
			>
			<button
				class="w-32"
				class:inset={$page.url.pathname === '/unlock'}
				on:click={() => goto('/unlock')}>UNLOCK</button
			>
		</div>
		<slot />
		<TransactionModal />
	{/if}
</div>
