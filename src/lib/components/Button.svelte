<script lang="ts">
	export let inset: boolean = false;
</script>

<button
	class="flex items-center justify-center gap-2 border-4 border-white bg-primary px-4 py-2 font-bold text-white transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:border-solid disabled:bg-neutral-600"
	{...$$restProps}
	on:click
	class:inset
	class:outset={!inset}><slot></slot></button
>

<style lang="postcss">
	.outset {
		border-style: outset;
	}

	.inset {
		border-style: inset;
	}
</style>
