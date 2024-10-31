<script lang="ts">
	import { goto } from '$app/navigation';
	import logo from '$lib/logo-white.svg';
	import { ArrowsRepeatCountOutline, LockOpenOutline, LockOutline } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';

	let loadingDots = '.';
	let showMainContent = false;
	let hideTerminal = false;

	function updateLoadingDots() {
		loadingDots = loadingDots.length >= 3 ? '.' : loadingDots + '.';
	}

	setInterval(updateLoadingDots, 500);

	setTimeout(() => {
		hideTerminal = true;
	}, 4500); 
	setTimeout(() => {
		showMainContent = true;
	}, 5000); 
</script>

<main class="min-h-screen bg-[#1C02B8] p-4 font-mono text-white">
	{#if !hideTerminal}
		<div
			out:fade
			class="mx-auto flex max-h-screen max-w-4xl flex-col items-start justify-center pt-36 text-left"
		>
			<div class="flex w-fit items-center gap-2 text-sm opacity-90">
				<span class="text-green-300">&gt;</span>
				<span class="typing-animation typing-with-cursor w-fit">INITIALIZING CYCLO PROTOCOL</span>
			</div>
			<div class="mt-4 flex w-fit items-center gap-2 text-sm opacity-90">
				<span class="typing-animation typing-no-cursor">
					<span class="text-green-300">VERIFYING_FTSO_CONNECTION:</span> Signature verified...
				</span>
			</div>
			<div class="mt-1 flex w-fit items-center gap-2 text-sm opacity-90">
				<span class="typing-animation typing-final">
					<span class="text-green-300">SYSTEM_STATUS:</span> Protocol ready for deployment...
				</span>
			</div>
		</div>
	{/if}

	{#if showMainContent}
		<div in:fade class="main-content flex flex-col gap-12">
			<div class="mx-auto flex max-w-4xl flex-col gap-6">
				<div class="flex flex-col items-center justify-between gap-12">
					<img src={logo} alt="Cyclo logo" class="w-full max-w-[400px]" />
					<h1 class="text-lg text-white md:text-2xl">A new way to leverage FLR, coming soon.</h1>
				</div>
				<div class="flex flex-col items-center justify-between gap-6 text-center">
					<p class="text-xl">
						Access the power of leverage while keeping your FLR position completely safe from
						liquidations.
					</p>
					<button
						class="flex items-center justify-center gap-2 border-4 border-white bg-primary px-6 py-4 text-xl font-semibold text-white transition-all hover:bg-blue-700 disabled:bg-neutral-600"
						on:click={() => {
							goto('docs');
						}}>Learn More</button
					>
				</div>
			</div>

			<div class="mx-auto mb-8 grid max-w-4xl gap-6 md:grid-cols-2">
				<div class="group border-2 border-white bg-primary p-6 transition-colors hover:bg-blue-700">
					<h2 class="mb-4 flex items-center gap-2 text-2xl">
						[ WHAT YOU GET ]<span class="text-xs opacity-70 group-hover:opacity-100"
							>{loadingDots}</span
						>
					</h2>
					<ul class="space-y-4">
						<li class="flex items-start gap-3">
							<span class="text-xl text-green-400">►</span>
							<span>Keep earning staking rewards while accessing leverage</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-xl text-green-300">►</span>
							<span>Trade and invest with more capital, completely liquidation-free</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-xl text-green-300">►</span>
							<span>Unwind positions at your pace - no forced sells, ever</span>
						</li>
						<li class="flex items-start gap-3">
							<span class="text-xl text-green-300">►</span>
							<span>Zero fees on minting or burning</span>
						</li>
					</ul>
				</div>

				<div class="group border-2 border-white bg-primary p-6 transition-colors hover:bg-blue-700">
					<h2 class="mb-4 flex items-center gap-2 text-2xl">
						[ HOW IT WORKS ] <span class="text-xs opacity-70 group-hover:opacity-100"
							>{loadingDots}</span
						>
					</h2>
					<ul class="space-y-4">
						<li class="flex items-start gap-3">
							<LockOutline size="lg" class="mt-1 text-green-300" />
							<span>Lock your sFLR to mint cysFLR tokens</span>
						</li>
						<li class="flex items-start gap-3">
							<ArrowsRepeatCountOutline size="lg" class="mt-1 text-green-300" />
							<span>Trade cysFLR for any asset you want</span>
						</li>
						<li class="flex items-start gap-3">
							<LockOpenOutline size="lg" class="mt-1 text-green-300" />
							<span>When ready, buy cysFLR and burn to unlock your sFLR</span>
						</li>
					</ul>
				</div>
			</div>
		</div>
	{/if}
</main>

<style>
	.typing-animation {
		overflow: hidden;
		white-space: nowrap;
		margin: 0;
		width: 0;
	}

	.typing-with-cursor {
		border-right: 2px solid rgba(255, 255, 255, 0.75);
		animation:
			typing 1s steps(40, end) forwards,
			blink-caret 0.75s step-end infinite;
		animation-delay: 0.5s;
	}

	.typing-no-cursor {
		animation: typing 1.5s steps(40, end) forwards;
		animation-delay: 1.2s;
	}

	.typing-final {
		animation: typing 1s steps(40, end) forwards;
		animation-delay: 2.4s;
	}

	@keyframes typing {
		from {
			width: 0;
		}
		to {
			width: 100%;
		}
	}

	@keyframes blink-caret {
		from,
		to {
			border-color: transparent;
		}
		50% {
			border-color: rgba(255, 255, 255, 0.75);
		}
	}
</style>
