<script lang="ts">
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/images/logo-white.svg';
	import spiralLogo from '$lib/images/spiral-logo.svg';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import SocialLinks from './SocialLinks.svelte';

	export let launched: boolean;
</script>

<div class="flex h-16 w-screen items-center justify-between bg-[#1C02B8] px-4">
	<div class="flex items-center justify-center gap-6 pr-4">
		<button
			class="hidden sm:block"
			on:click={() => {
				goto(base + '/');
			}}
		>
			<img src={logo} alt="Cyclo logo" class="h-8 cursor-pointer" />
		</button>
			<button
			class="block sm:hidden"
			on:click={() => {
				goto(base + '/');
			}}
		>
			<img src={spiralLogo} alt="Cyclo logo" class="h-8 cursor-pointer" />
		</button>
		{#if launched}
			<button
				class="text-white md:ml-4 text-xl"
				class:underline={$page.url.pathname === '/lock' || $page.url.pathname === '/unlock'}
				on:click={() => {
					goto(base + '/lock');
				}}>App</button
			>
		{/if}
		<button
		class="text-white md:ml-4 text-xl"
		class:underline={$page.url.pathname.startsWith('/docs')}
		on:click={() => {
			goto(base + '/docs');
		}}>Docs</button
		>
	</div>
	<div class="flex gap-4 justify-center items-center">
		<SocialLinks />
		<WalletConnect />
	</div>
</div>
