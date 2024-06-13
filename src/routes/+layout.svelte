<script lang="ts">
	import '../app.css';
	import { defaultConfig, wagmiConfig } from 'svelte-wagmi';
	import { injected, walletConnect } from '@wagmi/connectors';
	import Header from '$lib/components/Header.svelte';
	import { PUBLIC_WALLETCONNECT_ID } from '$env/static/public';

	import { onMount } from 'svelte';
	import { browser } from '$app/environment';

	import { flare } from '@wagmi/core/chains';

	onMount(async () => {
		if (browser && window.navigator) {
			const erckit = defaultConfig({
				appName: 'cyclo',
				walletConnectProjectId: PUBLIC_WALLETCONNECT_ID,
				chains: [flare],
				connectors: [injected(), walletConnect({ projectId: PUBLIC_WALLETCONNECT_ID })]
			});
			await erckit.init();
		}
	});
</script>

{#if $wagmiConfig}
	<main>
		<Header />
		<slot></slot>
	</main>
{/if}
