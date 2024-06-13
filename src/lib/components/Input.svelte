<script lang="ts">
	export let amount: string = '0.0';
	export let unit: string = '';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function setValueToMax() {
		dispatch('setValueToMax');
	}
</script>

<div
	class="flex h-full w-fit items-center justify-center rounded-sm border-2 border-white text-2xl font-semibold text-primary outline-none"
>
	<input
		class="m-0 w-40 border-none bg-primary p-0 text-right text-2xl text-white outline-none focus:ring-0"
		{...$$restProps}
		on:change
		min={0}
		placeholder="0.0"
		step="0.1"
		type="number"
		bind:value={amount}
	/>
	{#if unit}
		<span class=" h-full content-center self-center bg-primary pr-2 text-right text-2xl text-white">
			{unit}</span
		>
	{/if}
	<button
		on:click={setValueToMax}
		class="flex cursor-pointer items-center self-stretch bg-white pl-3 pr-2 text-base">MAX</button
	>
</div>
