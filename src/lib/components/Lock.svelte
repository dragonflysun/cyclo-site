<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import transactionStore from '$lib/transactionStore';
	import balancesStore from '$lib/balancesStore';
	import Input from '$lib/components/Input.svelte';
	import { cyFlareAddress, wrappedFlareAddress } from '$lib/stores';
	import { base } from '$app/paths';
	import mintDia from '$lib/images/mint-dia.svg';
	import ftso from '$lib/images/ftso.svg';
	import Button from '$lib/components/Button.svelte';

	import { readErc20PriceOracleReceiptVaultPreviewDeposit } from '../../generated';
	import { signerAddress, wagmiConfig, web3Modal } from 'svelte-wagmi';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { formatEther, parseEther } from 'ethers';

	export let amountToLock = '0.0';

	let priceRatio = BigInt(0);
	let assets = BigInt(0);
	let insufficientFunds = false;

	let intervalId: ReturnType<typeof setInterval>;

	$: if ($signerAddress) {
		checkBalance();
	}

	const checkBalance = () => {
		if (amountToLock) {
			const bigNumValue = BigInt(parseEther(amountToLock.toString()).toString());
			assets = bigNumValue;
			if ($balancesStore.sFlrBalance < assets) {
				insufficientFunds = true;
			} else {
				insufficientFunds = false;
			}
		}
	};

	onMount(() => {
		startGettingPriceRatio();
	});

	const getPriceRatio = async () => {
		priceRatio = await readErc20PriceOracleReceiptVaultPreviewDeposit($wagmiConfig, {
			address: $cyFlareAddress,
			args: [BigInt(1e18)]
		});
	};

	const startGettingPriceRatio = async () => {
		intervalId = setInterval(getPriceRatio, 5000);
		priceRatio = await readErc20PriceOracleReceiptVaultPreviewDeposit($wagmiConfig, {
			address: $cyFlareAddress,
			args: [BigInt(1e18)]
		});
	};

	function stopGettingPriceRatio() {
		clearInterval(intervalId);
	}

	onDestroy(() => {
		stopGettingPriceRatio();
	});
</script>

<Card size="lg">
	<div class="flex w-full flex-col items-center justify-center gap-10">
		{#if $signerAddress}
			<div
				class=" flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl"
			>
				<div class="flex flex-col">
					<span>SFLR BALANCE</span>
					<a
						target="_blank"
						href={'https://portal.flare.network'}
						class="cursor-pointer text-xs font-light hover:underline">How do I get SFLR?</a
					>
				</div>
				<div class="flex flex-row gap-4">
					{#key $balancesStore.sFlrBalance}<span in:fade={{ duration: 700 }}
							>{Number(formatEther($balancesStore.sFlrBalance)).toFixed(4)}</span
						>{/key}
					<span>SFLR</span>
				</div>
			</div>
		{/if}

		<div class=" flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl">
			<div class="flex flex-col">
				<span>SFLR/USD PRICE</span>
				<a
					href={base + '/docs/why-flare'}
					class="cursor-pointer text-xs font-light hover:underline"
					target="_blank">How does Cyclo use the FTSO?</a
				>
			</div>
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
			class=" itens-center flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl"
		>
			<span class="align-center content-center">LOCK AMOUNT</span>

			<Input
				on:change={(event) => {
					amountToLock = event.detail.value;
					checkBalance();
				}}
				on:setValueToMax={() => {
					assets = $balancesStore.sFlrBalance;
					amountToLock = Number(formatEther($balancesStore.sFlrBalance.toString())).toFixed(5);
				}}
				bind:amount={amountToLock}
				maxValue={$balancesStore.sFlrBalance}
				unit={'SFLR'}
			/>
		</div>

		<div class="flex w-full flex-col gap-2">
			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white md:text-2xl"
			>
				<span>{amountToLock === null ? 0 : amountToLock}</span>

				<span>SFLR</span>
			</div>

			<div class="flex w-full">
				<div
					class="flex w-1/4 flex-col items-center justify-center pb-12 pr-2 text-center text-white"
				>
					<img src={ftso} alt="ftso" class="w-1/2" />
					{Number(formatEther(priceRatio.toString())).toFixed(5)}
				</div>
				<img src={mintDia} alt="diagram" class="w-1/2" />
				<div class="w-1/4"></div>
			</div>

			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white md:text-2xl"
			>
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
				customClass="md:text-2xl text-lg w-full bg-white text-primary"
				on:click={() =>
					transactionStore.initiateLockTransaction({
						signerAddress: $signerAddress,
						config: $wagmiConfig,
						wrappedFlareAddress: $wrappedFlareAddress,
						vaultAddress: $cyFlareAddress,
						assets: assets
					})}>{insufficientFunds ? 'INSUFFICIENT SFLR' : 'LOCK'}</Button
			>
		{:else}
			<Button customClass="text-lg" on:click={() => $web3Modal.open()}>CONNECT WALLET</Button>
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
