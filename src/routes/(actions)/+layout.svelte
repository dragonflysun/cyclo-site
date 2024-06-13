<script>
	import { connected, signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import balancesStore from '$lib/balancesStore';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { cyFlareAddress, wrappedFlareAddress, wrongNetwork } from '$lib/stores';
	import { web3Modal } from 'svelte-wagmi';
	import Button from '$lib/components/Button.svelte';
	import { base } from '$app/paths';

	$: if ($signerAddress) {
		balancesStore.refreshWFlr($wagmiConfig, $wrappedFlareAddress, $signerAddress);
		balancesStore.refreshCyFlr($wagmiConfig, $cyFlareAddress, $signerAddress);
	}
</script>

<div class="flex min-h-screen flex-col items-center gap-6 bg-primary pb-24 pt-4">
	{#if !$signerAddress || !$connected}
		<Button on:click={() => $web3Modal.open()}>Connect a wallet to use CYCLO</Button>
	{:else if $wrongNetwork}
		<Button on:click={() => $web3Modal.open()}>Connect to Flare</Button>
	{:else}
		<div class="flex h-fit max-w-prose gap-6">
			<Button
				class="w-32"
				inset={$page.url.pathname === base + '/lock'}
				on:click={() => goto(base + '/lock')}>LOCK</Button
			>
			<Button
				class="w-32"
				inset={$page.url.pathname === base + '/unlock'}
				on:click={() => goto(base + '/unlock')}>UNLOCK</Button
			>
		</div>
		<slot />
		<TransactionModal />
	{/if}
</div>
