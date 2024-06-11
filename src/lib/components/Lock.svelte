<script>
	import Card from '$lib/components/Card.svelte';
	import { onDestroy } from 'svelte';
	import { fade } from 'svelte/transition';

	export let amountToLock = 0.0;
	export let priceRatio = 1.04;

	let intervalId;

	function randomizePriceRatio() {
		priceRatio = Math.random() * 0.4 + 0.8; // Generates a value between 0.8 and 1.2
	}
	function startRandomizingPriceRatio() {
		intervalId = setInterval(randomizePriceRatio, 2000);
	}

	function stopRandomizingPriceRatio() {
		clearInterval(intervalId);
	}

	startRandomizingPriceRatio();

	onDestroy(() => {
		stopRandomizingPriceRatio();
	});
</script>

<Card size="lg">
	<div class="flex w-full flex-col items-center justify-center gap-6">
		<div class="font-handjet font-semi flex w-full flex-row justify-between text-[56px] text-white">
			<span>BALANCE</span><span>{2300.0} FLR</span>
		</div>

		<!-- How much you want to gild -->
		<div class="font-handjet font-semi flex w-full flex-row justify-between text-[56px] text-white">
			<span>LOCKING</span>
			<div class="flex flex-row items-center">
				<input
					placeholder="0.0"
					type="number"
					bind:value={amountToLock}
					class="h-full w-64 border-none bg-transparent text-end text-[56px] text-white outline-none"
				/>
				<span class="ml-2"> FLR</span>
			</div>
			<!-- Countdown polling of the price -->
			<!-- Countdown spinner that updates it every 3s -->
		</div>
		<div class="font-handjet font-semi flex w-full flex-row justify-between text-[56px] text-white">
			<span class="flex flex-row items-center gap-1"> RATIO</span>
			{#key priceRatio}
				<span in:fade={{ duration: 700 }} class="flex flex-row items-center gap-2"
					>{priceRatio.toFixed(3)}

					<svg width="20" height="20" viewBox="0 0 100 100">
						<circle cx="50" cy="50" r="45" stroke="none" stroke-width="10" fill="none" />
						<circle
							class="fill-circle"
							cx="50"
							cy="50"
							r="45"
							stroke="white"
							stroke-width="10"
							fill="none"
							stroke-dasharray="282 282"
						/>
					</svg></span
				>
			{/key}
		</div>
		<div class="font-handjet font-semi flex w-full flex-row justify-between text-[56px] text-white">
			<span>RECEIVING</span>
			<div class="flex flex-row items-center gap-2">
				{#key priceRatio}
					<span in:fade={{ duration: 700 }}>{(amountToLock * priceRatio).toFixed(3)}</span>
				{/key}
				<span>cyFLR</span>
			</div>
		</div>
		<button class="font-handjet w-fit px-6 py-0 text-[56px]">LOCK</button>
	</div>
</Card>
