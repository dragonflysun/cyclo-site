<script lang="ts">
	import { targetNetwork, wrongNetwork } from '$lib/stores';
	import { web3Modal, loading, signerAddress, connected } from 'svelte-wagmi';
	import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import Button from './Button.svelte';
</script>

<Button class="p-2" on:click={() => $web3Modal.open()} tabindex={0}>
	{#if $loading}
		<CheckCircleSolid color="gray" />
		Loading...
	{:else if $wrongNetwork || !$signerAddress || !$connected}
		<CloseCircleSolid color="red" />
		Connect to {$targetNetwork.name}
	{:else}
		<CheckCircleSolid color="green" />
		Connected to {$targetNetwork.name}
	{/if}
</Button>
