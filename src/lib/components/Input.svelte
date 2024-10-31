<script lang="ts">
	export let amount: string = '0.0';
	export let unit: string = '';

	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function setValueToMax() {
		dispatch('setValueToMax');
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		dispatch('change', { value: target.value });
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
		bind:value={amount}
	/>
	{#if unit}
		<span
			data-testid="unit"
			class=" h-full content-center self-center bg-primary pr-2 text-right text-lg text-white md:text-2xl"
		>
			{unit}</span
		>
	{/if}
	<button
		on:click={setValueToMax}
		class="flex cursor-pointer items-center self-stretch bg-white pl-3 pr-2 text-base">MAX</button
	>
</div>
