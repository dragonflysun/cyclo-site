<script lang="ts">
	import { signerAddress, web3Modal } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import { getReceipts } from '$lib/queries/getReceipts';
	import type { Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';
	import Receipt from './ReceiptModal.svelte';
	import ReceiptsTable from '$lib/components/ReceiptsTable.svelte';

	import cyFlrBalanceStore from '$lib/balancesStore';
	import Button from '$lib/components/Button.svelte';
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

{#if !$signerAddress}
	<Button on:click={() => $web3Modal.open()} class=" w-fit text-2xl"
		>CONNECT WALLET TO VIEW RECEIPTS</Button
	>
{:else}
	{#key receipts}
		<Card size="md">
			<div class="flex w-full justify-between text-2xl font-semibold text-white">
				<span>BALANCE</span><span
					>{Number(formatEther($cyFlrBalanceStore.cyFlrBalance)).toFixed(4)} cyFLR</span
				>
			</div>
		</Card>
		{#if loading}
			<div
				class=" flex w-full items-center justify-center text-center text-2xl font-semibold text-white"
			>
				LOADING...
			</div>
		{:else if receipts.length > 0}
			<!-- lock up price | number held | locked FLR per receipt | total locked FLR | [redeem] -->
			<!-- A more declarative modal that explains what's gonna happen -->
			<!-- Show the calculation in the modal -->
			<ReceiptsTable {receipts} />
		{:else if error}
			<div
				class=" flex w-full items-center justify-center text-center text-2xl font-semibold text-white"
			>
				ERROR: NO RECEIPTS FOUND...
			</div>
		{/if}
	{/key}
{/if}
