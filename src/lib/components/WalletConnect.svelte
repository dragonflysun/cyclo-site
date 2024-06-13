<script lang="ts">
	import { targetNetwork, wrongNetwork } from '$lib/stores';
	import { web3Modal, signerAddress, connected } from 'svelte-wagmi';
	import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import Button from './Button.svelte';
</script>

<<<<<<< HEAD
<Button on:click={() => $web3Modal.open()} tabindex={0}>
	{#if $loading}
		<CheckCircleSolid color="gray" />
		Loading...
	{:else if $wrongNetwork || !$signerAddress || !$connected}
		<CloseCircleSolid color="red" class="hidden md:inline" />
		<span>Connect</span><span class="hidden md:inline"> to {$targetNetwork.name}</span>
	{:else}
		<CheckCircleSolid color="green" class="hidden md:inline" />
		<span>Connected</span><span class="hidden md:inline"> to {$targetNetwork.name}</span>
	{/if}
</Button>
=======
{#if $targetNetwork}
	<Button on:click={() => $web3Modal.open()} tabindex={0}>
		{#if $wrongNetwork || !$signerAddress || !$connected}
			<CloseCircleSolid color="red" />
			Connect to {$targetNetwork?.name}
		{:else}
			<CheckCircleSolid color="green" />
			Connected to {$targetNetwork?.name}
		{/if}
	</Button>
{/if}
>>>>>>> main
