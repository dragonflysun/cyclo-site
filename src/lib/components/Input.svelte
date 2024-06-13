<script lang="ts">
	export let amount: string = '0.0';
</script>

<div
	class="flex h-full w-fit items-center rounded-sm border-none bg-white p-1 text-end text-2xl font-semibold text-primary outline-none"
>
	<input
		class="bg-primary text-white"
		{...$$restProps}
		on:change
		min={0}
		placeholder="0.0"
		step="0.1"
		type="number"
		bind:value={amount}
	/>
	<span class="ml-2"> FLR</span>
</div>
