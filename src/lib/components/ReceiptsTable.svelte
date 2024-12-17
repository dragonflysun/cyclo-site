<script lang="ts">
	import {
		Table,
		TableBody,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableBodyCell,
		Modal,
		Button
	} from 'flowbite-svelte';
	import type { Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';

	import ReceiptModal from '$lib/components/ReceiptModal.svelte';
	import Card from './Card.svelte';

	export let receipts: ReceiptType[];
	let selectedReceipt: ReceiptType | null = null;

	const mappedReceipts = receipts.map((receipt) => {
		const totalsFlr = (receipt.balance * 10n ** 18n) / BigInt(receipt.tokenId);
		const flrPerReceipt = 10n ** 36n / BigInt(receipt.tokenId);

		return {
			...receipt,
			totalsFlr: totalsFlr,
			readableFlrPerReceipt: Number(formatEther(flrPerReceipt)).toFixed(5),
			readableTotalsFlr: Number(formatEther(totalsFlr)).toFixed(5)
		};
	});
</script>

<Card size="lg">
	<Table divClass="w-full" data-testid="receipts-table">
		<TableHead
			class="bg-opacity-0 bg-none p-1 text-white md:p-4 [&_th]:px-2 [&_th]:md:px-6"
			data-testid="headers"
		>
			<TableHeadCell>Total sFLR Locked</TableHeadCell>
			<TableHeadCell>Total cysFLR minted</TableHeadCell>
			<TableHeadCell>cysFLR per locked sFLR</TableHeadCell>
		</TableHead>
		<TableBody
			tableBodyClass="bg-opacity-0 [&_td]:text-white p-1 [&_td]:text-left [&_td]:px-2 [&_td]:md:px-6"
		>
			{#each mappedReceipts as receipt, index}
				<TableBodyRow class="bg-opacity-0 " data-testid={`receipt-row-${index}`}>
					<TableBodyCell class="" data-testid={`total-locked-sflr-${index}`}>
						{receipt.readableTotalsFlr}
					</TableBodyCell>
					<TableBodyCell data-testid={`number-held-${index}`}>
						{Number(formatEther(receipt.balance)).toFixed(5)}
					</TableBodyCell>
					<TableBodyCell data-testid={`locked-price-${index}`}>
						{Number(formatEther(receipt.tokenId)).toFixed(5)}
					</TableBodyCell>
					<TableBodyCell class="">
						<Button
							class="flex items-center justify-center rounded-none border-2 border-white bg-primary px-2 py-1 font-bold text-white transition-all hover:bg-blue-700 disabled:bg-neutral-600"
							data-testid={`redeem-button-${index}`}
							on:click={() => (selectedReceipt = receipt)}>Unlock</Button
						>
					</TableBodyCell>
				</TableBodyRow>
			{/each}
		</TableBody>
	</Table>
</Card>

{#if selectedReceipt}
	<Modal
		outsideclose={true}
		dismissable={true}
		on:close={() => (selectedReceipt = null)}
		defaultClass="bg-primary border-4 rounded-none inset h-fit"
		open={selectedReceipt ? true : false}
	>
		<ReceiptModal receipt={selectedReceipt} />
	</Modal>
{/if}
