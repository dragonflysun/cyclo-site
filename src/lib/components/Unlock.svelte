<script lang="ts">
	import { signerAddress, wagmiConfig, web3Modal } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import { getReceipts } from '$lib/queries/getReceipts';
	import type { Receipt, Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';
	import ReceiptsTable from '$lib/components/ReceiptsTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import balancesStore from '$lib/balancesStore';
	import { fade } from 'svelte/transition';
	import { erc1155Address } from '$lib/stores';
	import transactionStore from '$lib/transactionStore';
	let receipts: ReceiptType[] = [];
	let loading = true;

	$: if ($signerAddress) {
		refreshReceipts();
	}

	const refreshReceipts = async (): Promise<Receipt[]> => {
		if (!$signerAddress) return [];
		const res = await getReceipts($signerAddress, $erc1155Address, $wagmiConfig);
		if (res) {
			loading = false;
			return (receipts = res);
		} else return [];
	};
</script>

{#if !$signerAddress}
	<Button on:click={() => $web3Modal.open()} class=" w-fit text-2xl"
		>CONNECT WALLET TO VIEW RECEIPTS</Button
	>
{:else}
	{#key receipts}
		<Card size="md">
			<div class=" flex w-full flex-row justify-between text-2xl font-semibold text-white">
				<span>BALANCE</span>
				<div class="flex flex-row gap-4">
					{#key $balancesStore.cyFlrBalance}<span in:fade={{ duration: 700 }}
							>{Number(formatEther($balancesStore.cyFlrBalance)).toFixed(4)}</span
						>{/key}
					<span>cyFLR</span>
				</div>
			</div>
		</Card>
		{#if loading}
			<div
				class=" flex w-full items-center justify-center text-center text-2xl font-semibold text-white"
			>
				LOADING...
			</div>
		{:else if receipts.length > 0}
			<ReceiptsTable {receipts} />
		{:else if !receipts.length}
			<div
				class=" flex w-full items-center justify-center text-center text-2xl font-semibold text-white"
			>
				NO RECEIPTS FOUND...
			</div>
		{/if}
	{/key}
{/if}
