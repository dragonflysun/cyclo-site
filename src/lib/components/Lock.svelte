<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import transactionStore from '$lib/transactionStore';
	import balancesStore from '$lib/balancesStore';
	import Input from '$lib/components/Input.svelte';
	import { cysFlrAddress, erc1155Address, sFlrAddress } from '$lib/stores';
	import { base } from '$app/paths';
	import mintDia from '$lib/images/mint-dia.svg';
	import ftso from '$lib/images/ftso.svg';
	import Button from '$lib/components/Button.svelte';
	import { simulateErc20PriceOracleReceiptVaultPreviewDeposit } from '../../generated';
	import { signerAddress, wagmiConfig, web3Modal } from 'svelte-wagmi';
	import { onDestroy, onMount } from 'svelte';
	import { fade } from 'svelte/transition';
	import { formatEther, parseEther } from 'ethers';
	import { ZeroAddress } from 'ethers';

	export let amountToLock = '0.0';

	let priceRatio = BigInt(0);
	let assets = BigInt(0);
	let insufficientFunds = false;

	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		startGettingPriceRatio();
	});

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

	const getPriceRatio = async () => {
		const { result } = await simulateErc20PriceOracleReceiptVaultPreviewDeposit($wagmiConfig, {
			address: $cysFlrAddress,
			args: [BigInt(1e18), 0n],
			account: ZeroAddress as `0x${string}`
		});
		priceRatio = result;
	};

	const startGettingPriceRatio = async () => {
		intervalId = setInterval(getPriceRatio, 5000);
		getPriceRatio();
	};

	function stopGettingPriceRatio() {
		clearInterval(intervalId);
	}

	onDestroy(() => {
		stopGettingPriceRatio();
	});
</script>

<Card size="lg">
	<div class="flex w-full flex-col items-center justify-center gap-10" data-testid="lock-container">
		{#if $signerAddress}
			<div
				class="flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl"
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
					{#key $balancesStore.sFlrBalance}<span
							data-testid="sflr-balance"
							in:fade={{ duration: 700 }}
							>{Number(formatEther($balancesStore.sFlrBalance)).toFixed(4)}</span
						>{/key}
					<span>SFLR</span>
				</div>
			</div>
		{/if}

		<div class="flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl">
			<div class="flex flex-col">
				<span>SFLR/USD PRICE</span>
				<a
					href={base + '/docs/why-flare'}
					class="cursor-pointer text-xs font-light hover:underline"
					target="_blank"
					data-testid="price-ratio-link">How does Cyclo use the FTSO?</a
				>
			</div>
			{#key priceRatio}
				<span
					in:fade={{ duration: 700 }}
					class="flex flex-row items-center gap-2"
					data-testid="price-ratio"
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

		<div class="flex w-full flex-row justify-between text-lg font-semibold text-white md:text-2xl">
			<span>LOCK AMOUNT</span>
			<div class="flex flex-col">
				<Input
					data-testid="lock-input"
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
				{#if $signerAddress}
					<p class="my-2 text-right text-xs font-light" data-testid="your-balance">
						SFLR Balance: {Number(formatEther($balancesStore.sFlrBalance.toString())).toFixed(5)}
					</p>
				{:else}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						on:click={() => $web3Modal.open()}
						class="my-2 cursor-pointer text-right text-xs font-light hover:underline"
						data-testid="connect-message"
					>
						Connect a wallet to see SFLR balance
					</div>
				{/if}
			</div>
		</div>

		<div class="flex w-full flex-col gap-2">
			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white md:text-2xl"
			>
				<span>{amountToLock}</span>

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
					<span in:fade={{ duration: 700 }} data-testid="calculated-cyflr"
						>{(+amountToLock * Number(formatEther(priceRatio.toString()))).toFixed(3)}</span
					>
				{/key}
				<span>cysFLR</span>
			</div>
		</div>

		{#if $signerAddress}
			<Button
				disabled={insufficientFunds || !assets}
				customClass="md:text-2xl text-lg w-full bg-white text-primary"
				data-testid="lock-button"
				on:click={() =>
					transactionStore.initiateLockTransaction({
						signerAddress: $signerAddress,
						config: $wagmiConfig,
						cysFlrAddress: $cysFlrAddress,
						sFlrAddress: $sFlrAddress,
						erc1155Address: $erc1155Address,
						assets: assets
					})}>{insufficientFunds ? 'INSUFFICIENT SFLR' : 'LOCK'}</Button
			>
		{:else}
			<Button
				customClass="text-lg"
				data-testid="connect-wallet-button"
				on:click={() => $web3Modal.open()}>CONNECT WALLET</Button
			>
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
