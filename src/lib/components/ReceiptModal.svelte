<script lang="ts">
	import balancesStore from '$lib/balancesStore';
	import type { Receipt } from '$lib/types';
	import { fade } from 'svelte/transition';
	import { cysFlrAddress, erc1155Address, sFlrAddress } from '$lib/stores';
	import transactionStore from '$lib/transactionStore';
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { formatEther, parseEther } from 'ethers';
	import burnDia from '$lib/images/burn-dia.svg';
	import mobileBurnLine from '$lib/images/mobile-burn-line.svg';
	import mobileBurnDia from '$lib/images/mobile-burn.svg';
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
	let sFlrToReceive = BigInt(0);

	const readableBalance = Number(formatEther(receipt.balance));
	const tokenId = receipt.tokenId;

	let isMaxSelected = false;

	const checkBalance = () => {
		if (isMaxSelected) return;

		if (readableAmountToRedeem === '' || readableAmountToRedeem === null) {
			readableAmountToRedeem = '0.0';
		}
		amountToRedeem = parseEther(readableAmountToRedeem.toString());
	};

	const handleInput = (event: { detail: { value: string } }) => {
		isMaxSelected = false;
		readableAmountToRedeem = event.detail.value;
		checkBalance();
	};

	$: maxRedeemable =
		($balancesStore.cysFlrBalance ?? 0n) < (erc1155balance ?? 0n)
			? ($balancesStore.cysFlrBalance ?? 0n)
			: (erc1155balance ?? 0n);

	$: if (amountToRedeem) {
		readableAmountToRedeem = Number(formatEther(amountToRedeem)).toString();
		if (erc1155balance < amountToRedeem) {
			buttonStatus = ButtonStatus.INSUFFICIENT_RECEIPTS;
		} else if ($balancesStore.cysFlrBalance < amountToRedeem) {
			buttonStatus = ButtonStatus.INSUFFICIENT_cysFLR;
		} else {
			buttonStatus = ButtonStatus.READY;
		}
	}

	$: if (amountToRedeem > 0) {
		const _sFlrToReceive = (amountToRedeem * 10n ** 18n) / BigInt(receipt.tokenId);
		sFlrToReceive = _sFlrToReceive;
	} else {
		sFlrToReceive = BigInt(0);
		amountToRedeem = BigInt(0);
	}
</script>

<div
	class="flex w-full flex-col items-center justify-center gap-6 p-2 lg:p-6"
	data-testId="receipt-modal"
>
	<div
		class="flex w-full flex-col justify-between text-lg font-semibold text-white sm:flex-row sm:text-xl"
	>
		<span>NUMBER HELD</span>
		<div class="flex flex-row gap-4">
			{#key readableBalance}{#if readableBalance}
					<span in:fade={{ duration: 700 }} data-testid="balance">{Number(readableBalance)}</span>
				{/if}{/key}
		</div>
	</div>

	<div
		class="flex w-full flex-col justify-between text-lg font-semibold text-white sm:flex-row sm:text-xl"
	>
		<span>LOCK-UP PRICE</span>

		<div class="flex flex-row gap-4">
			<span data-testid="lock-up-price">{'$'}{Number(formatEther(tokenId))}</span>
		</div>
	</div>

	<div
		class="flex w-full flex-col items-start justify-between text-lg font-semibold text-white sm:flex-row sm:text-xl"
	>
		<span>REDEEM AMOUNT</span>
		<div class="flex flex-row items-center">
			<Input
				bind:amount={readableAmountToRedeem}
				on:input={handleInput}
				data-testid="redeem-input"
				on:setValueToMax={() => {
					isMaxSelected = true;
					amountToRedeem = maxRedeemable;
					readableAmountToRedeem = Number(formatEther(maxRedeemable)).toString();
				}}
			/>
		</div>
	</div>
	<!-- Burn diagram for desktop -->
	<div
		class="hidden w-full flex-col items-center justify-center text-lg font-semibold text-white sm:flex sm:text-xl"
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
				{Number(formatEther(sFlrToReceive))} sFLR
			</span>
		</div>
	</div>
	<!-- Burn diagram for mobile -->
	<div
		class="flex w-full flex-col items-center justify-center text-lg font-semibold text-white sm:hidden sm:text-xl"
	>
		<div class="flex w-full flex-col items-center justify-center gap-1 text-right">
			<span class="w-1/2 text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} cysFLR</span
			>
			<img src={mobileBurnLine} alt="diagram" class="" />
			<span class="w-1/2 text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} RECEIPTS</span
			>
			<img src={mobileBurnDia} alt="diagram" class="" />
			<div class="flex flex-row items-center gap-2 overflow-ellipsis">
				<span class="flex overflow-ellipsis" data-testid="flr-to-receive-mobile">
					{Number(formatEther(sFlrToReceive))} sFLR
				</span>
			</div>
		</div>
	</div>

	<button
		data-testid="unlock-button"
		class="outset flex h-fit w-full items-center justify-center gap-2 border-4 border-white bg-primary px-4 py-2 text-lg font-bold text-white sm:text-xl"
		disabled={buttonStatus !== ButtonStatus.READY || amountToRedeem === BigInt(0)}
		on:click={() =>
			transactionStore.handleUnlockTransaction({
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
