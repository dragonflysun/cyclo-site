<script lang="ts">
	import { signerAddress, wagmiConfig } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import transactionStore from '$lib/transactionStore';
	import balancesStore from '$lib/balancesStore';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { ethers, formatEther } from 'ethers';

	import { erc20PriceOracleReceiptVaultAddress, wrappedFlareAddress } from '$lib/stores';

	import { readErc20PriceOracleReceiptVaultPreviewDeposit } from '../../generated';

	export let amountToLock = 0.0;
	let priceRatio = BigInt(0);
	let assets = BigInt(0); // Initialize shares
	let balance = BigInt(0); // Initialize balance

	let intervalId: ReturnType<typeof setInterval>;

	$: if (amountToLock > 0) {
		const etherAmount = ethers.parseEther(amountToLock.toString()).toString();
		assets = BigInt(etherAmount);
	} else {
		assets = BigInt(0);
	}

	onMount(async () => {
		balancesStore.refreshWFlr($wagmiConfig, $wrappedFlareAddress, $signerAddress as string);
		await startGettingPriceRatio();
	});

	const getPriceRatio = async () => {
		priceRatio = await readErc20PriceOracleReceiptVaultPreviewDeposit($wagmiConfig, {
			address: $erc20PriceOracleReceiptVaultAddress,
			args: [BigInt(1e18)]
		});
	};

	const startGettingPriceRatio = async () => {
		intervalId = setInterval(getPriceRatio, 5000);
		priceRatio = await readErc20PriceOracleReceiptVaultPreviewDeposit($wagmiConfig, {
			address: $erc20PriceOracleReceiptVaultAddress,
			args: [BigInt(1e18)]
		});
	};

	function stopRandomizingPriceRatio() {
		clearInterval(intervalId);
	}

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
				{#key $balancesStore.wFlrBalance}{#if $balancesStore.wFlrBalance}<span
							in:fade={{ duration: 700 }}
							>{Number(formatEther($balancesStore.wFlrBalance)).toFixed(4)}</span
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
					>{Number(formatEther(priceRatio.toString())).toFixed(5)}

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
					<span in:fade={{ duration: 700 }}
						>{(amountToLock * Number(formatEther(priceRatio.toString()))).toFixed(3)}</span
					>
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
		animation: fillAnimation 5s ease-out infinite;
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
