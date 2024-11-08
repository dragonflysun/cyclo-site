<script lang="ts">
	import balancesStore from '$lib/balancesStore';
	import type { Receipt } from '$lib/types';
	import { fade } from 'svelte/transition';
	import { cysFlrAddress, erc1155Address, sFlrAddress } from '$lib/stores';
	import transactionStore from '$lib/transactionStore';
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { formatEther, parseEther } from 'ethers';
	import burnDia from '$lib/images/burn-dia.svg';
	import Input from './Input.svelte';

	enum ButtonStatus {
		INSUFFICIENT_RECEIPTS = 'INSUFFICIENT RECEIPTS',
		INSUFFICIENT_cysFLR = 'INSUFFICIENT cysFLR',
		READY = 'UNLOCK'
	}
	export let receipt: Receipt;
	let buttonStatus: ButtonStatus = ButtonStatus.READY;

	let erc1155balance = BigInt(receipt.balance);
	let readableAmountToRedeem: string = '0.0';
	let amountToRedeem = BigInt(0);
	let flrToReceive = BigInt(0);
	const readableBalance = Number(formatEther(receipt.balance));
	const tokenId = receipt.tokenId;

	const checkBalance = () => {
		if (readableAmountToRedeem === '' || readableAmountToRedeem === null) {
			readableAmountToRedeem = '0.0';
		}
		amountToRedeem = parseEther(readableAmountToRedeem.toString());
	};

	$: if (readableAmountToRedeem) {
		checkBalance();
	}

	$: maxRedeemable =
		$balancesStore?.cysFLRBalance < erc1155balance ? $balancesStore.cysFLRBalance : erc1155balance;

	$: if (amountToRedeem) {
		if (erc1155balance < amountToRedeem) {
			buttonStatus = ButtonStatus.INSUFFICIENT_RECEIPTS;
		} else if ($balancesStore.cysFLRBalance < amountToRedeem) {
			buttonStatus = ButtonStatus.INSUFFICIENT_cysFLR;
		} else {
			buttonStatus = ButtonStatus.READY;
		}
	}

	$: if (amountToRedeem > 0) {
		const _flrToReceive = (amountToRedeem * 10n ** 18n) / BigInt(receipt.tokenId);
		flrToReceive = _flrToReceive;
	} else {
		amountToRedeem = BigInt(0);
	}
</script>

<div class="flex w-full flex-col items-center justify-center gap-6 p-6" data-testId="receipt-modal">
	<div class="flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl">
		<span>NUMBER HELD</span>
		<div class="flex flex-row gap-4">
			{#key readableBalance}{#if readableBalance}
					<span in:fade={{ duration: 700 }} data-testid="balance"
						>{Number(readableBalance).toFixed(5)}</span
					>
				{/if}{/key}
		</div>
	</div>

	<div class="flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl">
		<span>LOCK-UP PRICE</span>

		<div class="flex flex-row items-center gap-2">
			<span data-testid="lock-up-price">{Number(formatEther(tokenId)).toFixed(4)}</span>
		</div>
	</div>

	<div
		class="flex w-full flex-row items-center justify-between text-lg font-semibold text-white md:text-2xl"
	>
		<span>REDEEM AMOUNT</span>
		<div class="flex flex-row items-center">
			<Input
				maxValue={maxRedeemable}
				bind:amount={readableAmountToRedeem}
				data-testid="redeem-input"
				on:input={checkBalance}
				on:setValueToMax={() => {
					amountToRedeem = maxRedeemable;
					readableAmountToRedeem = Number(formatEther(maxRedeemable.toString())).toFixed(5);
				}}
			/>
		</div>
	</div>

	<div
		class="flex w-full flex-col items-center justify-center text-lg font-semibold text-white md:text-2xl"
	>
		<div class="flex w-full flex-row justify-center gap-12 text-right">
			<span class="w-1/2 text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} RECEIPTS</span
			>
			<span class="w-1/2 text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} cysFLR</span
			>
		</div>
		<img src={burnDia} alt="diagram" class="w-1/2 py-4" />

		<div class="flex flex-row items-center gap-2 overflow-ellipsis">
			<span class="flex overflow-ellipsis" data-testid="flr-to-receive">
				{Number(formatEther(flrToReceive)).toFixed(5)} SFLR
			</span>
		</div>
	</div>

	<button
		data-testid="unlock-button"
		class="outset flex h-fit w-full items-center justify-center gap-2 border-4 border-white bg-primary px-4 py-2 text-lg font-bold text-white md:text-2xl"
		disabled={buttonStatus !== ButtonStatus.READY}
		on:click={() =>
			transactionStore.initiateUnlockTransaction({
				signerAddress: $signerAddress,
				config: $wagmiConfig,
				cysFlrAddress: $cysFlrAddress,
				sFlrAddress: $sFlrAddress,
				erc1155Address: $erc1155Address,
				tokenId: receipt.tokenId,
				assets: amountToRedeem
			})}
	>
		{buttonStatus}
	</button>
</div>
