<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { signerAddress } from 'svelte-wagmi';

	export let amount: string | number = '0.0';
	export let unit: string = '';

	const dispatch = createEventDispatcher();
	let displayAmount = amount.replace(/,/g, '.') || '0';

	$: displayAmount = amount ? amount.replace(/,/g, '.') : '0';

	function setValueToMax() {
		dispatch('setValueToMax');
	}

	function handleInput(event: Event) {
		const target = event.target as HTMLInputElement;
		let sanitizedValue = target.value.replace(/,/g, '.');
		sanitizedValue = sanitizedValue.replace(/[^0-9.]/g, '');
		const parts = sanitizedValue.split('.');
		if (parts.length > 2) {
			sanitizedValue = parts[0] + '.' + parts.slice(1).join('');
		}
		displayAmount = sanitizedValue || '0';
		dispatch('change', { value: sanitizedValue });
	}

	function handleKeyDown(event: KeyboardEvent) {
		const allowedKeys = [
			'Backspace', 'Tab', 'ArrowLeft', 'ArrowRight', 'Delete', 'Home', 'End'
		];
		const isNumber = /^[0-9]$/.test(event.key);

		if (event.key === '.' && displayAmount.includes('.')) {
			event.preventDefault();
		}

		if (!isNumber && !allowedKeys.includes(event.key) && event.key !== '.') {
			event.preventDefault();
		}
	}
</script>

<div
	class="flex h-full w-fit items-center justify-center rounded-sm border-2 border-white text-lg font-semibold text-primary outline-none md:text-2xl"
>
	<input
		class="mr-2 w-24 border-none bg-primary p-0 text-right text-lg text-white outline-none [appearance:textfield] focus:ring-0 md:w-40 md:text-2xl [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none"
		{...$$restProps}
		on:input={handleInput}
		on:keydown={handleKeyDown}
		min={0}
		placeholder="0.0"
		step="0.1"
		type="text"
		bind:value={displayAmount} />
	{#if unit}
		<span
			data-testid="unit"
			class="h-full content-center self-center bg-primary pr-2 text-right text-lg text-white md:text-2xl"
		>
			{unit}</span
		>
	{/if}
	<button
		disabled={!$signerAddress}
		data-testid={'set-val-to-max'}
		on:click={setValueToMax}
		class="flex cursor-pointer items-center self-stretch bg-white pl-3 pr-2 text-base">MAX</button
	>
</div>
