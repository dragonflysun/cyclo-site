<script lang="ts">
	import type { Receipt } from '$lib/types';
	import Card from '$lib/components/Card.svelte';
	import { fade } from 'svelte/transition';
	import {
		wrappedFlareAddress,
		erc20PriceOracleReceiptVaultAddress,
		targetNetwork
	} from '$lib/stores';
	import transactionStore from '$lib/transactionStore';
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import { ethers, formatEther } from 'ethers';
	import truncateEthAddress from 'truncate-eth-address';

	export let receipt: Receipt;
	let assets = BigInt(0); // Initialize shares
	let balance = BigInt(0); // Initialize balance
	let amountToUnlock = 0.0;
	const readableBalance = Number(formatEther(receipt.balance)).toFixed(4);
	const tokenId = receipt.tokenId;
	const tokenAddress = receipt.tokenAddress;

	$: if (amountToUnlock > 0) {
		const etherAmount = ethers.parseEther(amountToUnlock.toString()).toString();
		assets = BigInt(etherAmount);
	} else {
		assets = BigInt(0);
	}
</script>

<Card size="lg">
	<div class="flex w-full flex-col items-center justify-center gap-6">
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span>BALANCE</span>
			<div class="flex flex-row gap-4">
				{#key readableBalance}{#if readableBalance}<span in:fade={{ duration: 700 }}
							>{readableBalance}</span
						>{/if}{/key}
				<span>WFLR</span>
			</div>
		</div>

		<!-- Show token ID -->
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span>LOCKED FLR PRICE</span>
			<!-- Indicator to show in +/- current flare price -->
			<div class="flex flex-row items-center gap-2">
				<span>{Number(formatEther(tokenId)).toFixed(4)}</span>
			</div>
		</div>

		<!-- Show token address -->
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span>TOKEN ADDRESS</span>
			<div class="flex flex-row items-center gap-2">
				<a
					target="blank"
					href={$targetNetwork.blockExplorers?.default.url + '/address/' + tokenAddress}
					>{truncateEthAddress(tokenAddress)}</a
				>
			</div>
		</div>

		<!-- If enough WFLR is approved, immediate Unlock, or else, approve -->

		<!-- How much you want to unlock -->
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span>UNLOCKING</span>
			<div class="flex flex-row items-center">
				<input
					placeholder="0.0"
					type="number"
					bind:value={amountToUnlock}
					class="h-full w-64 border-none bg-transparent text-end text-[56px] font-semibold text-white outline-none"
				/>
				<span class="ml-2"> FLR</span>
			</div>
		</div>
		<button
			disabled={balance < assets}
			on:click={() =>
				transactionStore.initiateUnlockTransaction({
					signerAddress: $signerAddress,
					config: $wagmiConfig,
					wrappedFlareAddress: $wrappedFlareAddress,
					vaultAddress: $erc20PriceOracleReceiptVaultAddress,
					assets: assets
				})}
			class="w-fit px-6 py-0 font-handjet text-[56px]"
			>{balance < assets ? 'INSUFFICIENT WFLR' : 'UNLOCK'}</button
		>
	</div>
</Card>

<style lang="postcss">
	/* Add your existing styles here */
</style>
