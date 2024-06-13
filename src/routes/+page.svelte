<script lang="ts">
	import { goto } from '$app/navigation';
	import logo from '$lib/logo-white.svg';
	import Button from '$lib/components/Button.svelte';
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-y-8 bg-[#1C02B8] p-4">
	<img src={logo} alt="Cyclo logo" class="w-full max-w-[400px]" />
	<h1 class="text-center text-lg text-white md:text-2xl">A new way to leverage FLR, coming soon</h1>
	<Button
		class="bg-white px-4 py-2 text-primary"
		on:click={() => {
			goto('docs');
		}}>Learn More</Button
	>
</div>
