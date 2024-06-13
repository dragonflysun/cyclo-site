<script lang="ts">
	export let inset: boolean = false;
</script>

<button {...$$restProps} on:click class:inset class:outset={!inset}> <slot></slot></button>

<style lang="postcss">
	button {
		@apply flex h-fit items-center justify-center gap-2 border-4 border-white bg-primary px-4 py-2 font-bold text-white;
	}

	.outset {
		border-style: outset;
	}

	.inset {
		border-style: inset;
	}
</style>
