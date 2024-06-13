<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import {
		Table,
		TableBody,
		TableBodyRow,
		TableHead,
		TableHeadCell,
		TableBodyCell,
		Modal
	} from 'flowbite-svelte';
	import type { Receipt as ReceiptType } from '$lib/types';
	import { formatEther } from 'ethers';

	import ReceiptModal from '$lib/components/ReceiptModal.svelte';

	export let receipts: ReceiptType[];
	let selectedReceipt: ReceiptType | null = null;

	const mappedReceipts = receipts.map((receipt) => {
		const flrPerReceipt = 10n ** 36n / BigInt(receipt.tokenId);
		const totalFlr = (BigInt(receipt.balance) * flrPerReceipt) / 10n ** 18n;

		return {
			...receipt,
			readableFlrPerReceipt: Number(formatEther(flrPerReceipt)).toFixed(5),
			readableTotalFlr: Number(formatEther(totalFlr)).toFixed(5)
		};
	});
</script>

<Table divClass="table">
	<TableHead class="bg-opacity-0 bg-none text-white">
		<TableHeadCell>Locked Price</TableHeadCell>
		<TableHeadCell>Number Held</TableHeadCell>
		<TableHeadCell>Locked FLR/Receipt</TableHeadCell>
		<TableHeadCell>Total Locked FLR</TableHeadCell>
		<TableHeadCell>Action</TableHeadCell>
	</TableHead>
	<TableBody tableBodyClass="bg-opacity-0 text-white">
		{#each mappedReceipts as receipt}
			<TableBodyRow class="bg-opacity-0 text-white">
				<TableBodyCell class="text-white"
					>{Number(formatEther(receipt.tokenId)).toFixed(5)}</TableBodyCell
				>
				<TableBodyCell class="text-white"
					>{Number(formatEther(receipt.balance)).toFixed(5)}</TableBodyCell
				>

				<TableBodyCell class="text-white">
					{receipt.readableFlrPerReceipt}
				</TableBodyCell>
				<TableBodyCell class="text-white">{receipt.readableTotalFlr}</TableBodyCell>
				<TableBodyCell class="text-white"
					><Button on:click={() => (selectedReceipt = receipt)}>REDEEM</Button></TableBodyCell
				>
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>

{#if selectedReceipt}
	<Modal
		outsideclose={true}
		dismissable={true}
		on:close={() => (selectedReceipt = null)}
		defaultClass="bg-primary border-4 rounded-none inset"
		open={selectedReceipt ? true : false}
	>
		<ReceiptModal receipt={selectedReceipt} />
	</Modal>
{/if}
