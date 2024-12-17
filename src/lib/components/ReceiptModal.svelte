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
	import Button from './Button.svelte';

	enum ButtonStatus {
		INSUFFICIENT_RECEIPTS = 'INSUFFICIENT RECEIPTS',
		INSUFFICIENT_cysFLR = 'INSUFFICIENT cysFLR',
		READY = 'UNLOCK'
	}
	export let receipt: Receipt;
	let buttonStatus: ButtonStatus = ButtonStatus.READY;

	let erc1155balance = BigInt(receipt.balance);
	let readableAmountToRedeem: string = '';
	let amountToRedeem = BigInt(0);
	let sFlrToReceive = BigInt(0);

	const readableBalance = Number(formatEther(receipt.balance));
	const tokenId = receipt.tokenId;

	const checkBalance = () => {
		if (readableAmountToRedeem) {
			const bigNumValue = BigInt(parseEther(readableAmountToRedeem.toString()).toString());
			amountToRedeem = bigNumValue;
		} else {
			amountToRedeem = BigInt(0);
		}
	};

	$: maxRedeemable =
		($balancesStore.cysFlrBalance ?? 0n) < (erc1155balance ?? 0n)
			? $balancesStore.cysFlrBalance ?? 0n
			: erc1155balance ?? 0n;

	$: insufficientReceipts = erc1155balance < amountToRedeem;
	$: insufficientcysFlr = $balancesStore.cysFlrBalance < amountToRedeem;

	$: buttonStatus = !readableAmountToRedeem
		? ButtonStatus.READY
		: insufficientReceipts
			? ButtonStatus.INSUFFICIENT_RECEIPTS
			: insufficientcysFlr
				? ButtonStatus.INSUFFICIENT_cysFLR
				: ButtonStatus.READY;

	$: if (amountToRedeem > 0) {
		const _sFlrToReceive = (amountToRedeem * 10n ** 18n) / BigInt(receipt.tokenId);
		sFlrToReceive = _sFlrToReceive;
	} else {
		sFlrToReceive = BigInt(0);
		amountToRedeem = BigInt(0);
	}
</script>

<div
	class="flex h-fit w-full flex-col items-center justify-center gap-4 overflow-y-scroll p-0 text-sm sm:gap-6 sm:p-6 sm:text-base"
	data-testId="receipt-modal"
>
	<div class="flex w-full flex-col justify-between font-semibold text-white sm:flex-row">
		<span>TOTAL sFLR LOCKED</span>
		<div class="flex flex-row gap-4">
			{#key readableBalance}{#if readableBalance}
					<span in:fade={{ duration: 700 }}>{formatEther(receipt.totalsFlr ?? 0n)}</span>
				{/if}{/key}
		</div>
	</div>
	<div class="flex w-full flex-col justify-between font-semibold text-white sm:flex-row">
		<span>TOTAL cysFLR MINTED</span>
		<div class="flex flex-row gap-4">
			{#key readableBalance}{#if readableBalance}
					<span in:fade={{ duration: 700 }} data-testid="balance">{Number(readableBalance)}</span>
				{/if}{/key}
		</div>
	</div>

	<div class="flex w-full flex-col justify-between font-semibold text-white sm:flex-row">
		<span>cysFLR PER LOCKED sFLR</span>
		<div class="flex flex-row gap-4">
			<span data-testid="lock-up-price">{Number(formatEther(tokenId))}</span>
		</div>
	</div>

	<div
		class="flex w-full flex-col items-start justify-between font-semibold text-white sm:flex-row"
	>
		<span>REDEEM AMOUNT</span>
		<div class="flex flex-col">
			<Input
				unit="cysFLR"
				bind:amount={readableAmountToRedeem}
				on:input={(event) => {
					readableAmountToRedeem = event.detail.value;
					checkBalance();
				}}
				data-testid="redeem-input"
				placeholder="0.0"
				on:setValueToMax={() => {
					amountToRedeem = maxRedeemable;
					readableAmountToRedeem = Number(formatEther(maxRedeemable)).toString();
				}}
			/>
			<p class="my-2 text-left text-xs font-light sm:text-right" data-testid="sflr-balance">
				cysFLR Balance: {Number(formatEther($balancesStore.cysFlrBalance.toString()))}
			</p>
		</div>
	</div>
	<!-- Burn diagram for desktop -->
	<div class="hidden w-full flex-col items-center justify-center font-semibold text-white sm:flex">
		<div class="flex w-full flex-row justify-center gap-12 text-right">
			<span class="w-1/2 text-center"
				>{!readableAmountToRedeem ? 0 : readableAmountToRedeem} RECEIPTS</span
			>
			<span class="w-1/2 text-center"
				>{!readableAmountToRedeem ? 0 : readableAmountToRedeem} cysFLR</span
			>
		</div>
		<img src={burnDia} alt="diagram" class="w-1/2 py-4" />

		<div class="flex flex-row items-center gap-2 overflow-ellipsis">
			<span class="flex overflow-ellipsis" data-testid="flr-to-receive">
				{formatEther(sFlrToReceive)} sFLR
			</span>
		</div>
	</div>
	<!-- Burn diagram for mobile -->
	<div
		class="flex w-full flex-col items-center justify-center text-sm font-semibold text-white sm:hidden sm:text-xl"
	>
		<div class="flex w-full flex-col items-center justify-center gap-1 text-right">
			<span class="w-full text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} cysFLR</span
			>
			<img src={mobileBurnLine} alt="diagram" class="h-6" />
			<span class="w-full text-center"
				>{readableAmountToRedeem === null ? 0 : readableAmountToRedeem} RECEIPTS</span
			>
			<img src={mobileBurnDia} alt="diagram" class="h-32" />
			<div class="flex flex-row items-center gap-2 overflow-ellipsis">
				<span class="flex overflow-ellipsis" data-testid="flr-to-receive-mobile">
					{formatEther(sFlrToReceive)} sFLR
				</span>
			</div>
		</div>
	</div>

	<Button
		data-testid="unlock-button"
		customClass="  w-full bg-white text-primary"
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
	</Button>
</div>
