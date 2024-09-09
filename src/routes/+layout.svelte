<script lang="ts">
	import '../app.css';
	import { defaultConfig, wagmiConfig } from 'svelte-wagmi';
	import { injected, walletConnect } from '@wagmi/connectors';
	import Header from '$lib/components/Header.svelte';
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';
	import { browser } from '$app/environment';

	import { flare } from '@wagmi/core/chains';

	const initWagmiConfig = async () => {
		const erckit = defaultConfig({
			appName: 'cyclo',
			walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
			chains: [flare],
			connectors: [injected(), walletConnect({ projectId: PUBLIC_WALLETCONNECT_ID })]
		});
		await erckit.init();
	};

	$: if (browser && window.navigator) {
		initWagmiConfig();
	}
</script>

{#if $wagmiConfig}
	<div class="flex min-h-screen flex-col">
		<Header />
		<main class="flex-grow bg-[#1C02B8]">
			<slot></slot>
		</main>
		<!-- <Footer /> -->
	</div>
{/if}
