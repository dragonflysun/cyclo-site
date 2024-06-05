<script lang="ts">
	import { goto } from '$app/navigation';
	import logo from '$lib/logo-white.svg';
</script>

<div class="bg-primary flex h-screen w-screen flex-col items-center justify-center gap-y-8">
	<img src={logo} alt="Cyclo logo" class="w-1/5" />
	<h1 class="text-center text-2xl text-white">A new way to leverage FLR, coming soon</h1>
	<button
		class="text-primary bg-white px-4 py-2"
		on:click={() => {
			goto('docs');
		}}>Learn More</button
	>
</div>
