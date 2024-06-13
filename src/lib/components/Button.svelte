<script lang="ts">
	export let inset: boolean = false;
</script>

<button {...$$restProps} on:click class:inset> <slot></slot></button>

<style lang="postcss">
	button {
		@apply flex h-fit items-center justify-center gap-2 border-4 border-white bg-blue-500 px-4 py-2 font-bold text-white;
		border-style: outset;
	}
</style>
