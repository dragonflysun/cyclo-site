<script lang="ts">
	import { signerAddress } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import { getReceipts } from '$lib/queries/getReceipts';
	import type { Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';
	import Receipt from './Receipt.svelte';

	import cyFlrBalanceStore from '$lib/balancesStore';
	let receipts: ReceiptType[] = [];
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
</script>

{#key receipts}
	<Card size="lg">
		<div class="flex w-full justify-between font-handjet text-2xl font-semibold text-white">
			<span>BALANCE</span><span
				>{Number(formatEther($cyFlrBalanceStore.cyFlrBalance)).toFixed(4)} cyFLR</span
			>
		</div>
	</Card>
	{#if loading}
		<div
			class="flex w-full items-center justify-center text-center font-handjet text-2xl font-semibold text-white"
		>
			LOADING...
		</div>
	{:else if receipts.length > 0}
		{#each receipts as receipt}
			<Receipt {receipt} />
		{/each}
	{:else if error}
		<div
			class="flex w-full items-center justify-center text-center font-handjet text-2xl font-semibold text-white"
		>
			ERROR: NO RECEIPTS FOUND...
		</div>
	{/if}
{/key}
