<script>
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/logo-white.svg';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
</script>

<div class="flex h-16 w-screen items-center justify-between bg-primary px-4">
	<div class="flex items-center justify-center gap-6">
		<button
			on:click={() => {
				goto(base + '/');
			}}
		>
			<img src={logo} alt="Cyclo logo" class="h-10 cursor-pointer" />
		</button>

		<button
			class="ml-4 text-white"
			class:underline={$page.url.pathname === '/lock' || $page.url.pathname === '/unlock'}
			on:click={() => {
				goto(base + '/lock');
			}}>App</button
		>
		<button
			class="text-white"
			class:underline={$page.url.pathname.startsWith('/docs')}
			on:click={() => {
				goto(base + '/docs');
			}}>Docs</button
		>
	</div>
	<WalletConnect />
</div>
