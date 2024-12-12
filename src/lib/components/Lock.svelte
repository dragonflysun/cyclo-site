<script lang="ts">
	import Card from '$lib/components/Card.svelte';
	import transactionStore from '$lib/transactionStore';
	import balancesStore from '$lib/balancesStore';
	import Input from '$lib/components/Input.svelte';
	import { cysFlrAddress, erc1155Address, sFlrAddress } from '$lib/stores';
	import { base } from '$app/paths';
	import mintDia from '$lib/images/mint-dia.svg';
	import mintMobile from '$lib/images/mint-mobile.svg';
	import mintMobileSquiggle from '$lib/images/mint-mobile-squiggle.svg';
	import ftso from '$lib/images/ftso.svg';
	import Button from '$lib/components/Button.svelte';
	import { signerAddress, wagmiConfig, web3Modal } from 'svelte-wagmi';
	import { fade } from 'svelte/transition';
	import { formatEther, formatUnits, parseEther } from 'ethers';

	export let amountToLock = '';

	$: assets = BigInt(0);

	$: if ($signerAddress) {
		checkBalance();
	}

	$: insufficientFunds = $balancesStore.sFlrBalance < assets;

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
</script>

<Card size="lg">
	<div class="flex w-full flex-col items-center justify-center gap-10" data-testid="lock-container">
		{#if $signerAddress}
			<div
				class="flex w-full flex-col justify-between text-lg font-semibold text-white sm:flex-row sm:text-xl"
			>
				<span>sFLR BALANCE</span>

				<div class="flex flex-row gap-4">
					<span data-testid="your-balance">
						{Number(formatEther($balancesStore.sFlrBalance.toString()))}
					</span>
				</div>
			</div>
		{/if}

		<div
			class="flex w-full flex-col justify-between text-lg font-semibold text-white sm:flex-row sm:text-xl"
		>
			<div class="flex flex-col gap-0">
				<span>sFLR/USD PRICE</span>
				<a
					href={base + '/docs/why-flare'}
					class="cursor-pointer text-xs font-light hover:underline"
					target="_blank"
					data-testid="price-ratio-link">How does Cyclo use the FTSO?</a
				>
			</div>
			{#if $balancesStore.lockPrice}
				<div in:fade>
					{#key $balancesStore.lockPrice}
						<span
							in:fade={{ duration: 700 }}
							class="flex flex-row items-center gap-2"
							data-testid="price-ratio"
							>{Number(formatEther($balancesStore.lockPrice.toString()))}

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
			{/if}
		</div>

		<div
			class="flex w-full flex-col justify-between text-lg font-semibold text-white sm:flex-row sm:text-xl"
		>
			<span>LOCK AMOUNT</span>
			<div class="flex flex-col">
				<Input
					data-testid="lock-input"
					on:input={(event) => {
						amountToLock = event.detail.value;
						checkBalance();
					}}
					on:setValueToMax={() => {
						assets = $balancesStore.sFlrBalance;
						amountToLock = Number(formatEther($balancesStore.sFlrBalance.toString())).toString();
					}}
					bind:amount={amountToLock}
					maxValue={$balancesStore.sFlrBalance}
					unit={'sFLR'}
				/>
				{#if $signerAddress}
					<p class="my-2 text-left text-xs font-light sm:text-right" data-testid="sflr-balance">
						sFLR Balance: {Number(formatEther($balancesStore.sFlrBalance.toString()))}
					</p>
				{:else}
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<!-- svelte-ignore a11y-no-static-element-interactions -->
					<div
						on:click={() => $web3Modal.open()}
						class="my-2 cursor-pointer text-right text-xs font-light hover:underline"
						data-testid="connect-message"
					>
						Connect a wallet to see sFLR balance
					</div>
				{/if}
			</div>
		</div>

		<!-- Mint diagram for desktop -->
		<div class="hidden w-full flex-col gap-2 sm:flex">
			<div
				class="flex w-full flex-row items-center justify-center gap-2 text-center text-lg font-semibold text-white sm:flex-col sm:text-xl"
			>
				<span>{amountToLock}</span>

				<span>sFLR</span>
			</div>

			<div class="flex w-full">
				<div
					class="flex w-1/4 flex-col items-center justify-center pb-12 pr-2 text-center text-white"
				>
					<img src={ftso} alt="ftso" class="w-1/2" />
					{Number(formatEther($balancesStore.lockPrice.toString()))}
				</div>
				<img src={mintDia} alt="diagram" class="w-1/2" />
				<div class="w-1/4"></div>
			</div>

			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white sm:text-xl"
			>
				{#key $balancesStore.lockPrice}
					<span in:fade={{ duration: 700 }} data-testid="calculated-cysflr"
						>{+amountToLock * Number(formatEther($balancesStore.lockPrice.toString()))}</span
					>
				{/key}
				<span>cysFLR</span>
			</div>
			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white sm:text-xl"
			>
				{#key $balancesStore.lockPrice}
					<span in:fade={{ duration: 700 }} class="text-sm" data-testid="calculated-cysflr-usd"
						>Current market value ~$ {(
							+amountToLock * Number(formatUnits($balancesStore.cysFlrUsdPrice.toString(), 6))
						).toFixed(2)}</span
					>
				{/key}
			</div>
		</div>

		<!-- Mint diagram for mobile -->
		<div class="flex w-full flex-col items-center gap-2 sm:hidden">
			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white md:text-2xl"
			>
				<span>{amountToLock}</span>

				<span>sFLR</span>
			</div>
			<img src={mintMobileSquiggle} alt="diagram" class="h-12" />
			<div class="flex w-1/4 flex-col items-center justify-center text-center text-white">
				<img src={ftso} alt="ftso" class="" />
				{Number(formatEther($balancesStore.lockPrice.toString()))}
			</div>
			<img src={mintMobile} alt="diagram" class="h-60" />
			<div
				class="flex w-full items-center justify-center gap-2 text-center text-lg font-semibold text-white md:text-2xl"
			>
				{#key $balancesStore.lockPrice}
					<span in:fade={{ duration: 700 }} data-testid="calculated-cysflr-mobile"
						>{+amountToLock * Number(formatEther($balancesStore.lockPrice.toString()))}</span
					>
				{/key}
				<span>cysFLR</span>
			</div>
		</div>

		{#if $signerAddress}
			<Button
				disabled={insufficientFunds || !assets}
				customClass="sm:text-xl text-lg w-full bg-white text-primary"
				data-testid="lock-button"
				on:click={() =>
					transactionStore.handleLockTransaction({
						signerAddress: $signerAddress,
						config: $wagmiConfig,
						cysFlrAddress: $cysFlrAddress,
						sFlrAddress: $sFlrAddress,
						erc1155Address: $erc1155Address,
						assets: assets
					})}>{insufficientFunds ? 'INSUFFICIENT sFLR' : 'LOCK'}</Button
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
