<script lang="ts">
	import balancesStore from '$lib/balancesStore';
	import type { Receipt } from '$lib/types';
	import Card from '$lib/components/Card.svelte';
	import { fade } from 'svelte/transition';
	import { cyFlareAddress, erc1155Address } from '$lib/stores';
	import transactionStore from '$lib/transactionStore';
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { formatEther, parseEther } from 'ethers';

	export let receipt: Receipt;

	let erc1155balance = BigInt(receipt.balance);
	let readableAmountToRedeem: string | number = 0.0;
	let amountToRedeem = BigInt(0);
	let flrToReceive = BigInt(0);
	const readableBalance = Number(formatEther(receipt.balance));
	const tokenId = receipt.tokenId;

	const checkBalance = () => {
		if (readableAmountToRedeem === '') {
			readableAmountToRedeem = 0.0;
		}
		amountToRedeem = parseEther(readableAmountToRedeem.toString());
	};

	$: maxRedeemable =
		$balancesStore?.cyFlrBalance < erc1155balance ? $balancesStore.cyFlrBalance : erc1155balance;

	$: buttonDisabled = erc1155balance < amountToRedeem || amountToRedeem <= 0;

	$: if (amountToRedeem > 0) {
		const _flrToReceive = (amountToRedeem * 10n ** 18n) / BigInt(receipt.tokenId);
		flrToReceive = _flrToReceive;
	} else {
		amountToRedeem = BigInt(0);
	}
</script>

<Card size="lg">
	<div class="flex w-full flex-col items-center justify-center gap-6">
		<div class="flex w-full flex-row justify-between text-2xl font-semibold text-white">
			<span>NUMBER HELD</span>
			<div class="flex flex-row gap-4">
				{#key readableBalance}{#if readableBalance}<span in:fade={{ duration: 700 }}
							>~{Number(readableBalance).toFixed(5)}</span
						>{/if}{/key}
			</div>
		</div>

		<div class="flex w-full flex-row justify-between text-2xl font-semibold text-white">
			<span>UNLOCK PRICE</span>

			<div class="flex flex-row items-center gap-2">
				<span>{Number(formatEther(tokenId)).toFixed(4)}</span>
			</div>
		</div>

		<div class="flex w-full flex-row justify-between text-2xl font-semibold text-white">
			<span>REDEEMING</span>
			<div class="flex flex-row items-center">
				<input
					min={0}
					placeholder="0.0"
					step="0.1"
					type="number"
					bind:value={readableAmountToRedeem}
					on:change={checkBalance}
					class="h-full w-64 overflow-ellipsis border-none bg-transparent text-end text-2xl font-semibold text-white outline-none"
				/>
				<span class="ml-2"> cyFLR</span>
				<button
					on:click={() => {
						amountToRedeem = maxRedeemable;
						readableAmountToRedeem = Number(formatEther(maxRedeemable.toString())).toFixed(5);
					}}
					class="ml-4 p-1 text-base">MAX</button
				>
			</div>
		</div>

		<div class="flex w-full flex-row justify-between text-2xl font-semibold text-white">
			<span>YOU RECEIVE</span>

			<div class="flex flex-row items-center gap-2 overflow-ellipsis">
				<span class="flex overflow-ellipsis">
					~{Number(formatEther(flrToReceive)).toFixed(5)} wFLR
				</span>
			</div>
		</div>

		<button
			disabled={buttonDisabled}
			on:click={() =>
				transactionStore.initiateUnlockTransaction({
					signerAddress: $signerAddress,
					config: $wagmiConfig,
					erc1155Address: $erc1155Address,
					cyFlareAddress: $cyFlareAddress,
					assets: amountToRedeem,
					tokenId: receipt.tokenId
				})}
			class={`w-fit px-6 py-0  text-2xl ${buttonDisabled ? 'text-red-500' : ''}`}>{'UNLOCK'}</button
		>
	</div>
</Card>
