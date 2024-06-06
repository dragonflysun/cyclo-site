<script lang="ts">
	import { goto } from '$app/navigation';
	import logo from '$lib/logo-white.svg';
</script>

<div class="flex h-screen w-screen flex-col items-center justify-center gap-y-8 bg-primary p-4">
	<img src={logo} alt="Cyclo logo" class="w-full max-w-[400px]" />
	<h1 class="text-center text-2xl text-white">A new way to leverage FLR, coming soon</h1>
	<button
		class="bg-white px-4 py-2 text-primary"
		on:click={() => {
			goto('docs');
		}}>Learn More</button
	>
</div>
