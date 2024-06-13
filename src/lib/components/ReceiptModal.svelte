<script lang="ts">
	import balancesStore from '$lib/balancesStore';
	import type { Receipt } from '$lib/types';
	import { fade } from 'svelte/transition';
	import { cyFlareAddress, erc1155Address } from '$lib/stores';
	import transactionStore from '$lib/transactionStore';
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { formatEther, parseEther } from 'ethers';
	import burnDia from '$lib/images/burn-dia.svg';
	import Input from './Input.svelte';

	export let receipt: Receipt;

	let erc1155balance = BigInt(receipt.balance);
	let readableAmountToRedeem: string = '0.0';

	let amountToRedeem = BigInt(0);
	let flrToReceive = BigInt(0);
	const readableBalance = Number(formatEther(receipt.balance));
	const tokenId = receipt.tokenId;

	const checkBalance = () => {
		if (readableAmountToRedeem === '') {
			readableAmountToRedeem = '0.0';
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

<div class="flex w-full flex-col items-center justify-center gap-6 p-6">
	<div class="flex w-full flex-row justify-between text-2xl font-semibold text-white">
		<span>NUMBER HELD</span>
		<div class="flex flex-row gap-4">
			{#key readableBalance}{#if readableBalance}<span in:fade={{ duration: 700 }}
						>{Number(readableBalance).toFixed(5)}</span
					>{/if}{/key}
		</div>
	</div>

	<div class="flex w-full flex-row justify-between text-2xl font-semibold text-white">
		<span>LOCK-UP PRICE</span>

		<div class="flex flex-row items-center gap-2">
			<span>{Number(formatEther(tokenId)).toFixed(4)}</span>
		</div>
	</div>

	<div class="flex w-full flex-row items-center justify-between text-2xl font-semibold text-white">
		<span>REDEEM AMOUNT</span>
		<div class="flex flex-row items-center">
			<Input
				maxValue={maxRedeemable}
				bind:amount={readableAmountToRedeem}
				on:change={checkBalance}
				on:setValueToMax={() => {
					amountToRedeem = maxRedeemable;
					readableAmountToRedeem = Number(formatEther(maxRedeemable.toString())).toFixed(5);
				}}
			/>
		</div>
	</div>

	<div class="flex w-full flex-col items-center justify-center text-2xl font-semibold text-white">
		<div class="flex w-full flex-row justify-center gap-12 text-right">
			<span class="w-1/2 text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} RECEIPTS</span
			>
			<span class="w-1/2 text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} cyFLR</span
			>
		</div>
		<img src={burnDia} alt="diagram" class="w-1/2 py-4" />

		<div class="flex flex-row items-center gap-2 overflow-ellipsis">
			<span class="flex overflow-ellipsis">
				{Number(formatEther(flrToReceive)).toFixed(5)} WFLR
			</span>
		</div>
	</div>

	<button
		class="outset flex h-fit w-full items-center justify-center gap-2 border-4 border-white bg-primary px-4 py-2 text-2xl font-bold text-white"
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
		>{erc1155balance < amountToRedeem
			? 'INSUFFICIENT RECEIPTS'
			: $balancesStore.cyFlrBalance < amountToRedeem
				? 'INSUFFICIENT cyFLR'
				: 'UNLOCK'}</button
	>
</div>
