<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import { onMount } from 'svelte';

	let receiptIds: number[] = [1, 2, 3, 4, 5]; // Replace with your array of receipt ID numbers
	let selectedReceiptId: number = receiptIds[0];

	onMount((): void => {
		updateSelectDisplay();
	});

	function updateSelectDisplay(): void {
		const select = document.querySelector<HTMLSelectElement>('.select-custom');
		const display = document.querySelector<HTMLSpanElement>('.select-display');
		if (select && display) {
			display.textContent = selectedReceiptId.toString();
		}
	}

	function handleSelectChange(event: Event): void {
		const target = event.target as HTMLSelectElement;
		selectedReceiptId = Number(target.value);
		updateSelectDisplay();
	}
</script>

<Card size="lg">
	<div
		class="flex w-full flex-row items-center justify-between font-handjet text-[56px] font-semibold text-white"
	>
		<span>RECEIPT ID</span>
		<div class="select-container relative flex items-center">
			<span class="select-display"></span>
			<select class="select-custom w-fit" on:change={handleSelectChange}>
				{#each receiptIds as receiptId}
					<option value={receiptId}>{receiptId}</option>
				{/each}
			</select>
			<span class="arrow">▼</span>
		</div>
	</div>
</Card>

<style lang="postcss">
	.select-container {
		position: relative;
		display: flex;
		align-items: center;
		width: fit-content;
	}

	.select-custom {
		@apply flex h-fit items-center justify-center gap-2 border-4 border-white bg-blue-500 px-4 py-2 font-bold text-white;
		border-style: outset;
		outline: none;
		appearance: none;
		opacity: 0; /* Hide the select element */
		position: absolute;
		z-index: 1;
		width: 100%;
		height: 100%;
	}

	.select-custom option {
		@apply cursor-pointer;
		font-size: 16px; /* Small text size for options */
	}

	.select-display {
		font-size: 56px; /* Larger text size for display */
		position: relative;
		z-index: 0;
		padding-right: 1.5em; /* Make space for the arrow */
	}

	.arrow {
		cursor: pointer;
		font-family: 'Handjet', sans-serif;
		font-size: 32px;
		color: white;
		position: absolute;
		right: 16px;
		pointer-events: none; /* Ensure the arrow doesn't block select interactions */
	}
</style>
