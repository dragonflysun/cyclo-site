<script lang="ts">
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/images/logo-white.svg';
	import spiralLogo from '$lib/images/spiral-logo.svg';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { base } from '$app/paths';
	import SocialLinks from './SocialLinks.svelte';
	import NavButtons from './NavButtons.svelte';

	export let launched: boolean;
</script>

<div class="flex h-16 w-screen items-center justify-between bg-[#1C02B8] px-4">
	<div class="mr-4 flex items-center justify-center gap-4">
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
			<img src={spiralLogo} alt="Cyclo spiral logo" class="h-8 cursor-pointer" />
		</button>
		<NavButtons {launched} />
	</div>
	<div class="flex items-center justify-center gap-4">
		<SocialLinks />
		<WalletConnect />
	</div>
</div>
