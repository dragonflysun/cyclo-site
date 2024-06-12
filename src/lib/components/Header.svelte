<script>
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/logo-white.svg';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { base } from '$app/paths';

	console.log(base);
</script>

<div class="flex h-16 w-screen items-center justify-between bg-primary px-4">
	<div class="flex items-center justify-center gap-4">
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

		<button
			class="w-24"
			class:inset={$page.url.pathname === '/lock' || $page.url.pathname === '/unlock'}
			on:click={() => {
				goto(base + '/lock');
			}}>App</button
		>
		<button
			class="w-24"
			class:inset={$page.url.pathname.startsWith('/docs')}
			on:click={() => {
				goto(base + '/docs');
			}}>Docs</button
		>
	</div>
	<WalletConnect />
</div>
