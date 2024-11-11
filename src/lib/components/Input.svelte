<script lang="ts">
	import { signerAddress } from 'svelte-wagmi';
	import { createEventDispatcher } from 'svelte';
	import balancesStore from '$lib/balancesStore';

	export let amount: number = 0;
	export let tokenName: string = '';
	export let maxValue: number = 0;

	const dispatch = createEventDispatcher();

	function setValueToMax() {
		amount = maxValue;
		dispatch('setValueToMax');
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('input', { value: target.value });
	}
</script>

<div
	class="flex h-full w-fit items-center justify-center rounded-sm border-2 border-white text-lg font-semibold text-primary outline-none md:text-2xl"
>
	<input
		class="mr-2 w-24 border-none bg-primary p-0 text-right text-lg text-white outline-none [appearance:textfield] focus:ring-0 md:w-40 md:text-2xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		{...$$restProps}
		on:input={handleInput}
		min={0}
		placeholder="0.0"
		step="0.1"
		type="number"
		lang="en-001"
		bind:value={amount}
	/>
	{#if tokenName}
		<span
			data-testid="Name"
			class=" h-full content-center self-center bg-primary pr-2 text-right text-lg text-white md:text-2xl"
		>
			{tokenName}</span
		>
	{/if}
	<button
		disabled={!$signerAddress}
		data-testid={'set-val-to-max'}
		on:click={setValueToMax}
		class="flex cursor-pointer items-center self-stretch bg-white pl-3 pr-2 text-base">MAX</button
	>
</div>
