<script lang="ts">
	import Button from '$lib/components/Button.svelte';
	import Receipt from '$lib/components/Receipt.svelte';

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
	import balancesStore from '$lib/balancesStore';
	import transactionStore from '$lib/transactionStore';
	import { signerAddress } from 'svelte-wagmi';
	import { formatEther } from 'ethers';
	import { onMount } from 'svelte';

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

	let balances;
	let cyFlareAddress;
	let erc1155Address;
	let signer;

	onMount(() => {
		balances = $balancesStore;
		cyFlareAddress = $cyFlareAddress;
		erc1155Address = $erc1155Address;
		signer = $signerAddress;
	});
</script>

<Table divClass="table" hoverable={true}>
	<TableHead>
		<TableHeadCell>Locked Price</TableHeadCell>
		<TableHeadCell>Number Held</TableHeadCell>
		<TableHeadCell>Locked FLR/Receipt</TableHeadCell>
		<TableHeadCell>Total Locked FLR</TableHeadCell>
		<TableHeadCell>Redeem</TableHeadCell>
	</TableHead>
	<TableBody>
		{#each mappedReceipts as receipt}
			<TableBodyRow>
				<TableBodyCell>{receipt.tokenId}</TableBodyCell>
				<TableBodyCell>{Number(formatEther(receipt.balance)).toFixed(5)}</TableBodyCell>

				<TableBodyCell>
					{receipt.readableFlrPerReceipt}
				</TableBodyCell>
				<TableBodyCell>{receipt.readableTotalFlr}</TableBodyCell>
				<TableBodyCell
					><Button on:click={() => (selectedReceipt = receipt)}>Redeem</Button></TableBodyCell
				>
			</TableBodyRow>
		{/each}
	</TableBody>
</Table>

{#if selectedReceipt}
	<Modal open={selectedReceipt ? true : false}>
		<Receipt receipt={selectedReceipt} />
	</Modal>
{/if}
