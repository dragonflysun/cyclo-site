<script>
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import balancesStore from '$lib/balancesStore';
	import TransactionModal from '$lib/components/TransactionModal.svelte';
	import { cyFlareAddress, wrappedFlareAddress } from '$lib/stores';

	import Button from '$lib/components/Button.svelte';
	import { base } from '$app/paths';

	$: if ($signerAddress) {
		balancesStore.refreshSflr($wagmiConfig, $wrappedFlareAddress, $signerAddress);
		balancesStore.refreshCyFlr($wagmiConfig, $cyFlareAddress, $signerAddress);
	}
</script>

<div class="flex flex-grow flex-col items-center gap-6 bg-[#1C02B8] px-6 py-6 md:px-0">
	<div class="flex h-fit max-w-prose gap-6">
		<Button
			class=" w-32"
			inset={$page.url.pathname === '/lock'}
			on:click={() => goto(base + '/lock')}>LOCK</Button
		>
		<Button
			class="w-32"
			inset={$page.url.pathname === '/unlock'}
			on:click={() => goto(base + '/unlock')}>UNLOCK</Button
		>
	</div>
	<slot />
	<TransactionModal />
</div>
