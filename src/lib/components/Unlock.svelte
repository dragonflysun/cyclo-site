<script lang="ts">
	import { signerAddress, wagmiConfig, web3Modal } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import { getReceipts } from '$lib/queries/getReceipts';
	import type { Receipt } from '$lib/types';
	import { formatEther } from 'ethers';
	import ReceiptsTable from '$lib/components/ReceiptsTable.svelte';
	import Button from '$lib/components/Button.svelte';
	import balancesStore from '$lib/balancesStore';
	import { fade } from 'svelte/transition';
	import { erc1155Address } from '$lib/stores';

	import { myReceipts } from '$lib/stores';

	let loading = true;

	$: if ($signerAddress) {
		refreshReceipts();
	}

	const refreshReceipts = async (): Promise<Receipt[]> => {
		if (!$signerAddress) return [];
		const res = await getReceipts($signerAddress, $erc1155Address, $wagmiConfig);
		if (res) {
			loading = false;
			return ($myReceipts = res);
		} else {
			return [];
		}
	};
</script>

{#if !$signerAddress}
	<Button on:click={() => $web3Modal.open()} class=" w-fit text-lg md:text-xl"
		>CONNECT WALLET TO VIEW RECEIPTS</Button
	>
{:else}
	{#key $myReceipts}
		<Card size="lg">
			<div
				class=" flex w-full flex-col justify-between font-semibold text-white sm:flex-row sm:text-xl md:text-xl"
			>
				<span>BALANCE</span>
				<div class="flex flex-row gap-4" data-testid="cysflr-balance">
					{#key $balancesStore.cysFlrBalance}<span in:fade={{ duration: 700 }}
							>{formatEther($balancesStore.cysFlrBalance)}</span
						>{/key}
					<span>cysFLR</span>
				</div>
			</div>
		</Card>
		{#if loading}
			<div
				class=" flex w-full items-center justify-center text-center text-lg font-semibold text-white md:text-xl"
			>
				LOADING...
			</div>
		{:else if $myReceipts.length > 0}
			<ReceiptsTable receipts={$myReceipts} />
		{:else if !$myReceipts.length}
			<div
				class=" flex w-full items-center justify-center text-center text-lg font-semibold text-white md:text-xl"
			>
				NO RECEIPTS FOUND...
			</div>
		{/if}
	{/key}
{/if}
