<script>
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/logo-white.svg';
	import { goto } from '$app/navigation';
</script>

<div class=" flex h-16 w-screen items-center justify-between bg-primary px-4">
	<img
		src={logo}
		on:click={() => {
			goto('/');
		}}
		alt="Cyclo logo"
		class="h-8 cursor-pointer"
	/>
	<div class="flex gap-4">
		<button class="bg-white px-4 py-2 text-primary">Lock</button>
		<button class="bg-white px-4 py-2 text-primary">Unlock</button>
	</div>
	<WalletConnect />
</div>
