<script>
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/logo-white.svg';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import Button from './Button.svelte';
</script>

<div class="flex h-16 w-screen items-center justify-between bg-[#1C02B8] px-4">
	<div class="flex items-center justify-center gap-6">
		<a
			href="/"
			on:keydown={(e) => {
				if (e.key !== 'Enter' && e.key !== ' ') return;
				e.preventDefault();
				e.currentTarget?.click();
			}}
			on:click={() => {
				goto(base + '/');
			}}
		>
			<img src={logo} alt="Cyclo logo" class="h-10 cursor-pointer" />
		</a>

		<Button
			inset={$page.url.pathname === '/lock' || $page.url.pathname === '/unlock'}
			on:click={() => {
				goto(base + '/lock');
			}}>App</Button
		>
		<Button
			inset={$page.url.pathname.startsWith('/docs')}
			on:click={() => {
				goto(base + '/docs');
			}}>Docs</Button
		>
	</div>
	<WalletConnect />
</div>
