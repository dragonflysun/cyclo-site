<script lang="ts">
	import '../app.css';
	import { defaultConfig, wagmiConfig } from 'svelte-wagmi';
	import { injected, walletConnect } from '@wagmi/connectors';
	import Header from '$lib/components/Header.svelte';
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';
	import { browser } from '$app/environment';
	import { PUBLIC_LAUNCHED } from '$env/static/public';
	import { flare } from '@wagmi/core/chains';
	import Footer from '$lib/components/Footer.svelte';
	import { ZeroAddress } from 'ethers';
	import { cysFlrAddress } from '$lib/stores';
	import { simulateErc20PriceOracleReceiptVaultPreviewDeposit } from '../generated';
	import balancesStore from '$lib/balancesStore';
	import { onDestroy, onMount } from 'svelte';

	const initWallet = async () => {
		const erckit = defaultConfig({
			autoConnect: true,
			appName: 'cyclo',
			walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
			chains: [flare],
			connectors: [injected(), walletConnect({ projectId: PUBLIC_WALLETCONNECT_ID })]
		});
		await erckit.init();
	};

	$: if (browser && window.navigator) {
		initWallet();
	}

	let intervalId: ReturnType<typeof setInterval>;

	onMount(() => {
		startGettingPriceRatio();
	});

	const getPriceRatio = async () => {
		const { result } = await simulateErc20PriceOracleReceiptVaultPreviewDeposit($wagmiConfig, {
			address: $cysFlrAddress,
			args: [BigInt(1e18), 0n],
			account: ZeroAddress as `0x${string}`
		});
		balancesStore.updateLockPrice(result);
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

{#if $wagmiConfig}
	<div class="flex min-h-screen flex-col">
		<Header launched={PUBLIC_LAUNCHED === 'true'} />
		<main class="flex-grow bg-[#1C02B8]">
			<slot></slot>
		</main>
		<Footer />
	</div>
{/if}
