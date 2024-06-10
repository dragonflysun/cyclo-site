<script lang="ts">
	import '../app.css';
	import { signerAddress, defaultConfig } from 'svelte-wagmi';
	import { injected, walletConnect } from '@wagmi/connectors';
	import Header from '$lib/components/Header.svelte';
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';
	import { onMount } from 'svelte';
	import { browser } from '$app/environment';
	import { targetNetwork } from '$lib/stores';
	import { page } from '$app/stores';
	import { sepolia, flare } from '@wagmi/core/chains';

	onMount(async () => {
		$targetNetwork = $page.url.searchParams.get('testnet') ? sepolia : flare;
		if (browser && window.navigator) {
			const erckit = defaultConfig({
				appName: 'cyclo',
				walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
				chains: [$targetNetwork],
				connectors: [injected(), walletConnect({ projectId: PUBLIC_WALLETCONNECT_ID })]
			});

			await erckit.init();
		}
	});
</script>

<main>
	<Header />
	<slot></slot>
</main>
