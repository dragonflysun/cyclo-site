<script lang="ts">
	import { connectedToFlare } from '$lib/stores';
	import { web3Modal } from 'svelte-wagmi';
	import { CheckCircleSolid, CloseCircleSolid } from 'flowbite-svelte-icons';
	import { flare } from '@wagmi/core/chains';
</script>

<button on:click={() => $web3Modal.open()} tabindex={0}>
	{#if !$connectedToFlare}
		<CheckCircleSolid color="red" />
		Please connect to {flare.name}
	{:else}
		<CloseCircleSolid color="green" />
		Connected to {flare.name}
	{/if}
</button>
