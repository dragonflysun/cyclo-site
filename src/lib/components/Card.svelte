<script lang="ts">
	import { Card, type SizeType } from 'flowbite-svelte';
	export let size: SizeType = 'xl';
	export let customClass = '';
</script>

<Card
	{size}
	class={'border-outset flex flex-col items-center gap-6 rounded-none border-4 border-white bg-blue-500 p-4 shadow-md' +
		customClass}
>
	<slot />
</Card>
