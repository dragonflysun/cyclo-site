<script lang="ts">
	import { signerAddress } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import { getReceipts } from '$lib/queries/getReceipts';
	import type { Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';
	import Receipt from './Receipt.svelte';

	import cyFlrBalanceStore from '$lib/balancesStore';
	let receipts: ReceiptType[] = []; // Replace with your array of receipt ID numbers
	let loading = true;
	let error = false;

	$: if ($signerAddress) {
		refreshReceipts();
	}

	const refreshReceipts = async () => {
		if (!$signerAddress) return;
		const res = await getReceipts($signerAddress);
		if (res.items) {
			loading = false;
			receipts = res.items;
		} else {
			error = true;
		}
	};

	// show a table of receipts with your balance and the lock price (represented by the formatted Token ID which was the price of FLR at that time (in USD))
	// open the receipt to show an amount you wanna
	// we can show the number you have the receipt, the price it was locked at, and the amount of FLR that can be unlocked by this receipt (max) or by your chose unlock amount.
</script>

{#key receipts}
	<Card size="lg">
		<div class="flex w-full justify-between font-handjet text-[56px] font-semibold text-white">
			<span>BALANCE</span><span
				>{Number(formatEther($cyFlrBalanceStore.cyFlrBalance)).toFixed(4)} cyFLR</span
			>
		</div>
	</Card>
	{#if loading}
		<div
			class="flex w-full items-center justify-center text-center font-handjet text-[56px] font-semibold text-white"
		>
			LOADING...
		</div>
	{:else if receipts.length > 0}
		{#each receipts as receipt}
			<Receipt {receipt} />
		{/each}
	{:else if error}
		<div
			class="flex w-full items-center justify-center text-center font-handjet text-[56px] font-semibold text-white"
		>
			ERROR: NO RECEIPTS FOUND...
		</div>
	{/if}
{/key}

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
