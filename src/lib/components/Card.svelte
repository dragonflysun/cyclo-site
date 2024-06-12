<script lang="ts">
	import { Card, type SizeType } from 'flowbite-svelte';
	export let size: SizeType = 'xl';
</script>

<Card {size} class="card">
	<slot />
</Card>
