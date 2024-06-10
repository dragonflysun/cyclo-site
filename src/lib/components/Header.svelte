<script>
	import WalletConnect from './WalletConnect.svelte';
	import logo from '$lib/logo-white.svg';
</script>

<div class="fixed flex h-16 w-screen items-center justify-between bg-primary px-4">
	<img src={logo} alt="Cyclo logo" class="h-8" />
	<WalletConnect />
</div>
