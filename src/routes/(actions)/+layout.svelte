<script>
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
</script>

<div class="flex min-h-screen flex-col items-center gap-6 bg-primary">
	<div class="flex h-fit max-w-prose gap-6">
		<button
			class=" w-32"
			class:inset={$page.url.pathname === '/lock'}
			on:click={() => goto('/lock')}>Lock</button
		>
		<button
			class="w-32"
			class:inset={$page.url.pathname === '/unlock'}
			on:click={() => goto('/unlock')}>Unlock</button
		>
	</div>
	<slot />
</div>
