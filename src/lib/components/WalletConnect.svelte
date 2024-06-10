<script lang="ts">
	import { targetNetwork, wrongNetwork } from '$lib/stores';
	import { signerAddress, web3Modal, chainId, loading } from 'svelte-wagmi';
	import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
</script>

<button on:click={() => $web3Modal.open()} tabindex={0}>
	{#if $loading}
		<CheckCircleSolid color="gray" />

		Loading...
	{:else if $wrongNetwork}
		<CloseCircleSolid color="red" />
		Please connect to {$targetNetwork.name}
	{:else}
		<CheckCircleSolid color="green" />
		Connected to {$targetNetwork.name}
	{/if}
</button>
