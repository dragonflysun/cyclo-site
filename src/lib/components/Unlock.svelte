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
