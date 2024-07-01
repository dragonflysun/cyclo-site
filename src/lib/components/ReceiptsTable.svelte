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

<Table
	divClass="border-outset flex flex-col items-center gap-6 rounded-none border-4 border-white bg-primary p-1 md:p-4 shadow-md max-w-full"
>
	<TableHead class="bg-opacity-0 bg-none p-1 text-white md:p-4 [&_th]:px-2 [&_th]:md:px-6">
		<TableHeadCell>Locked Price</TableHeadCell>
		<TableHeadCell>Number Held</TableHeadCell>
		<TableHeadCell class="hidden md:block">Locked WFLR/Receipt</TableHeadCell>
		<TableHeadCell>Total Locked WFLR</TableHeadCell>
		<TableHeadCell></TableHeadCell>
	</TableHead>
	<TableBody
		tableBodyClass="bg-opacity-0 [&_td]:text-white p-1 [&_td]:text-left [&_td]:px-2 [&_td]:md:px-6"
	>
		{#each mappedReceipts as receipt}
			<TableBodyRow class="bg-opacity-0 ">
				<TableBodyCell>{Number(formatEther(receipt.tokenId)).toFixed(5)}</TableBodyCell>
				<TableBodyCell>{Number(formatEther(receipt.balance)).toFixed(5)}</TableBodyCell>

				<TableBodyCell class="hidden md:table-cell">
					{receipt.readableFlrPerReceipt}
				</TableBodyCell>
				<TableBodyCell class="">{receipt.readableTotalFlr}</TableBodyCell>
				<TableBodyCell class=""
					><Button on:click={() => (selectedReceipt = receipt)}>Redeem</Button></TableBodyCell
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
