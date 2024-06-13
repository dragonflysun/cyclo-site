<script lang="ts">
	import { signerAddress, wagmiConfig, web3Modal } from 'svelte-wagmi';
	import Card from '$lib/components/Card.svelte';
	import transactionStore from '$lib/transactionStore';
	import balancesStore from '$lib/balancesStore';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { formatEther, parseEther } from 'ethers';

	import { erc20PriceOracleReceiptVaultAddress, wrappedFlareAddress } from '$lib/stores';
	import { readErc20PriceOracleReceiptVaultPreviewDeposit } from '../../generated';
	import Button from './Button.svelte';

	export let amountToLock = '0.0';
	let priceRatio = BigInt(0);
	let assets = BigInt(0);
	let insufficientFunds = false;

	let intervalId: ReturnType<typeof setInterval>;

	$: if ($signerAddress) {
		checkBalance();
	}

	const checkBalance = () => {
		const bigNumValue = BigInt(parseEther(amountToLock.toString()).toString());
		assets = bigNumValue;
		if ($balancesStore.wFlrBalance < assets) {
			insufficientFunds = true;
		} else {
			insufficientFunds = false;
		}
	};

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
		{#if $signerAddress}
			<div class=" flex w-full flex-row justify-between text-2xl font-semibold text-white">
				<span>BALANCE</span>
				<div class="flex flex-row gap-4">
					{#key $balancesStore.wFlrBalance}<span in:fade={{ duration: 700 }}
							>{Number(formatEther($balancesStore.wFlrBalance)).toFixed(4)}</span
						>{/key}
					<span>WFLR</span>
				</div>
			</div>
		{/if}

		<!-- How much you want to gild -->
		<div
			class=" itens-center flex w-full flex-row justify-between text-2xl font-semibold text-white"
		>
			<span class="align-center content-center">LOCKING</span>
			<div class="flex flex-row items-center">
				<input
					min={0}
					placeholder="0.0"
					step="0.1"
					on:change={checkBalance}
					type="number"
					bind:value={amountToLock}
					class="flex h-full w-fit rounded-sm border-none bg-white bg-opacity-90 p-0 text-end text-2xl font-semibold text-blue-500 outline-none"
				/>
				<span class="ml-2"> FLR</span>
				<Button
					on:click={() => {
						assets = $balancesStore.wFlrBalance;
						amountToLock = Number(formatEther($balancesStore.wFlrBalance.toString())).toFixed(5);
					}}
					class="ml-4 p-1 text-base">MAX</Button
				>
			</div>
		</div>
		<div class=" flex w-full flex-row justify-between text-2xl font-semibold text-white">
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
		<div class=" flex w-full flex-row justify-between text-2xl font-semibold text-white">
			<span>RECEIVING</span>
			<div class="flex flex-row items-center gap-2">
				{#key priceRatio}
					<span in:fade={{ duration: 700 }}
						>{(+amountToLock * Number(formatEther(priceRatio.toString()))).toFixed(3)}</span
					>
				{/key}
				<span>cyFLR</span>
			</div>
		</div>
		{#if $signerAddress}
			<Button
				disabled={insufficientFunds || !assets}
				customClass="text-xl"
				on:click={() =>
					transactionStore.initiateTransaction({
						signerAddress: $signerAddress,
						config: $wagmiConfig,
						wrappedFlareAddress: $wrappedFlareAddress,
						vaultAddress: $erc20PriceOracleReceiptVaultAddress,
						assets: assets
					})}>{insufficientFunds ? 'INSUFFICIENT WFLR' : 'LOCK'}</Button
			>
		{:else}
			<Button customClass="text-xl" on:click={() => $web3Modal.open()}>CONNECT WALLET</Button>
		{/if}
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
