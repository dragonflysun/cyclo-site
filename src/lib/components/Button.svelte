<script lang="ts">
	export let inset: boolean = false;
</script>

<button {...$$restProps} on:click class:inset class:outset={!inset}><slot></slot></button>

<style lang="postcss">
	button {
		@apply flex items-center justify-center gap-2 border-4 border-white bg-primary px-4 py-2 font-bold text-white transition-all hover:bg-blue-700 disabled:bg-neutral-600;
	}

	.outset {
		border-style: outset;
	}

	.inset {
		border-style: inset;
	}

	button:disabled {
		@apply cursor-not-allowed;
		border-style: solid;
	}
</style>
