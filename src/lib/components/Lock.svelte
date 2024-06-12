<script lang="ts">
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import transactionStore from '$lib/transactionStore';

	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ethers } from 'ethers';
	import type { Hex } from 'viem';

	import { erc20PriceOracleReceiptVaultAddress, wrappedFlareAddress } from '$lib/stores';

	import { readErc20BalanceOf } from '../../generated';

	export let amountToLock = 0.0;
	export let priceRatio = 1.04;
	let assets = BigInt(0); // Initialize shares
	let balance = BigInt(0); // Initialize balance
	let readableBalance: string = '';

	let intervalId: ReturnType<typeof setInterval>;

	$: if (amountToLock > 0) {
		const etherAmount = ethers.parseEther(amountToLock.toString()).toString();
		assets = BigInt(etherAmount);
	} else {
		assets = BigInt(0);
	}

	$: if ($signerAddress) {
		getBalance();
	}

	const getBalance = async () => {
		const _balance = await readErc20BalanceOf($wagmiConfig, {
			address: $wrappedFlareAddress,
			args: [$signerAddress as Hex]
		});
		balance = _balance;
		readableBalance = Number(ethers.formatEther(_balance.toString())).toFixed(4);
	};

	function randomizePriceRatio() {
		priceRatio = Math.random() * 0.4 + 0.8; // Generates a value between 0.8 and 1.2
	}
	function startRandomizingPriceRatio() {
		intervalId = setInterval(randomizePriceRatio, 2000);
	}

	function stopRandomizingPriceRatio() {
		clearInterval(intervalId);
	}

	startRandomizingPriceRatio();

	onDestroy(() => {
		stopRandomizingPriceRatio();
	});
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

		<!-- How much you want to gild -->
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span>LOCKING</span>
			<div class="flex flex-row items-center">
				<input
					placeholder="0.0"
					type="number"
					bind:value={amountToLock}
					class="h-full w-64 border-none bg-transparent text-end text-[56px] font-semibold text-white outline-none"
				/>
				<span class="ml-2"> FLR</span>
			</div>
			<!-- Countdown polling of the price -->
			<!-- Countdown spinner that updates it every 3s -->
		</div>
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span class="flex flex-row items-center gap-1"> RATIO</span>
			{#key priceRatio}
				<span in:fade={{ duration: 700 }} class="flex flex-row items-center gap-2"
					>{priceRatio.toFixed(3)}

					<svg width="20" height="20" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="45" stroke="none" stroke-width="10" fill="none" />
						<circle
							class="fill-circle"
							cx="50"
							cy="50"
							r="45"
							stroke="white"
							stroke-width="10"
							fill="none"
							stroke-dasharray="282 282"
						/>
					</svg></span
				>
			{/key}
		</div>
		<div
			class="flex w-full flex-row justify-between font-handjet text-[56px] font-semibold text-white"
		>
			<span>RECEIVING</span>
			<div class="flex flex-row items-center gap-2">
				{#key priceRatio}
					<span in:fade={{ duration: 700 }}>{(amountToLock * priceRatio).toFixed(3)}</span>
				{/key}
				<span>cyFLR</span>
			</div>
		</div>
		<!-- If enough WFLR is approved, immediate Lock, or else, approve -->
		<button
			disabled={balance < assets}
			on:click={() =>
				transactionStore.initiateTransaction({
					signerAddress: $signerAddress,
					config: $wagmiConfig,
					wrappedFlareAddress: $wrappedFlareAddress,
					vaultAddress: $erc20PriceOracleReceiptVaultAddress,
					assets: assets
				})}
			class="w-fit px-6 py-0 font-handjet text-[56px]"
			>{balance < assets ? 'INSUFFICIENT WFLR' : 'LOCK'}</button
		>
	</div>
</Card>

<style lang="postcss">
	.fill-circle {
		animation: fillAnimation 2s ease-out infinite;
		transform: rotate(-90deg);
		transform-origin: 50% 50%;
	}
	@keyframes fillAnimation {
		0% {
			stroke-dasharray: 0 282;
		}
		100% {
			stroke-dasharray: 282 0;
		}
	}
</style>
