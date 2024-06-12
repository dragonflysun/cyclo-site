<script lang="ts">
	import { Card, type SizeType } from 'flowbite-svelte';
	export let size: SizeType = 'xl';
	export let customClass = '';
</script>

<Card {size} class={'card' + customClass}>
	<slot />
</Card>
