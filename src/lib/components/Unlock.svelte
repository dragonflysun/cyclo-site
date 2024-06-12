<script lang="ts">
	import { signerAddress } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import { onMount } from 'svelte';
	import { getReceipts } from '$lib/queries/getReceipts';
	import type { Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';
	import Receipt from './Receipt.svelte';
	let receipts: ReceiptType[] = []; // Replace with your array of receipt ID numbers

	$: if ($signerAddress) {
		refreshReceipts();
	}

	const refreshReceipts = async () => {
		console.log('refreshing!');
		if (!$signerAddress) return;
		const res = await getReceipts($signerAddress);
		receipts = res.items;
	};
	// get overall balance of cyFLR
	// show a table of receipts with your balance and the lock price (represented by the formatted Token ID which was the price of FLR at that time (in USD))
	// open the receipt to show an amount you wanna
	// we can show the number you have the receipt, the price it was locked at, and the amount of FLR that can be unlocked by this receipt (max) or by your chose unlock amount.

	{
		const receipts = [
			{
				chainId: '14',
				tokenAddress: '0xA3b81870529832AE874e0c6F5a03D94EbB042Ba7',
				tokenId: '1257220947081177536',
				balance: '7543325682487065216'
			},
			{
				chainId: '14',
				tokenAddress: '0xA3b81870529832AE874e0c6F5a03D94EbB042Ba7',
				tokenId: '1398481939835619712',
				balance: '2796963879671239424'
			},
			{
				chainId: '14',
				tokenAddress: '0xA3b81870529832AE874e0c6F5a03D94EbB042Ba7',
				tokenId: '1060308083497264290',
				balance: '1060308083497264290'
			},
			{
				chainId: '14',
				tokenAddress: '0xA3b81870529832AE874e0c6F5a03D94EbB042Ba7',
				tokenId: '506816838193429936',
				balance: '506816838193429936'
			}
		];
	}

	// function updateSelectDisplay(): void {
	// 	const select = document.querySelector<HTMLSelectElement>('.select-custom');
	// 	const display = document.querySelector<HTMLSpanElement>('.select-display');
	// 	if (select && display) {
	// 		display.textContent = parseEther(selectedReceipt.tokenId).toString();
	// 	}
	// }

	// function handleSelectChange(event: Event): void {
	// 	const target = event.target as HTMLSelectElement;
	// 	parseEther(selectedReceipt.tokenId) = Number(target.value);
	// 	updateSelectDisplay();
	// }
</script>

{#key receipts}
	{#each receipts as receipt}
		<Receipt {receipt} />
	{/each}
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
