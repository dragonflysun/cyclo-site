<script lang="ts">
	import { base } from '$app/paths';
	import { goto } from '$app/navigation';
	import logo from '$lib/logo-white.svg';
	import Button from '$lib/components/Button.svelte';
	import { ArrowsRepeatCountOutline, LockOpenOutline, LockOutline } from 'flowbite-svelte-icons';

	let loadingDots = '.';

	function updateLoadingDots() {
		loadingDots = loadingDots.length >= 3 ? '.' : loadingDots + '.';
	}

	setInterval(updateLoadingDots, 500);
</script>

<style>
  .typing-animation {
    overflow: hidden;
    border-right: 2px solid rgba(255,255,255,.75);
    white-space: nowrap;
    margin: 0;
    animation: typing 3.5s steps(40, end),
               blink-caret .75s step-end infinite;
  }

  .typing-delay-1 {
    animation-delay: 0s;
    width: 0;
    animation: typing 1s steps(40, end) forwards,
               blink-caret .75s step-end infinite;
  }

  .typing-delay-2 {
    width: 0;
    animation: typing 2s steps(40, end) forwards,
               blink-caret .75s step-end infinite;
    animation-delay: 1s;
  }

  @keyframes typing {
    from { width: 0 }
    to { width: 100% }
  }

  @keyframes blink-caret {
    from, to { border-color: transparent }
    50% { border-color: rgba(255,255,255,.75) }
  }
</style>

<main class="min-h-screen bg-[#1C02B8] p-4 font-mono text-white mt-8 mb-8">
	<div class="mx-auto max-w-4xl border-2 border-white bg-primary p-8">
		<div class="mb-6 flex flex-col items-center justify-between gap-4">
			<img src={logo} alt="Cyclo logo" class="w-full max-w-[400px]" />
			<h1 class="text-lg text-white md:text-2xl">
				A new way to leverage FLR, coming soon.
			</h1>
		</div>
		<div class="gap-4">
			<p class="mb-4 text-xl">
				Access the power of leverage while keeping your FLR position completely safe from
				liquidations.
			</p>
			<Button
				class="bg-white px-4 py-2 text-primary"
				on:click={() => {
					goto('docs');
				}}>Learn More</Button
			>
		</div>
	</div>

	<div class="mx-auto max-w-4xl my-8">
		<div class="mt-4 text-sm opacity-90 gap-2 flex items-center w-fit">
			<span class="text-green-300">&gt;</span>
			<span class="typing-animation typing-delay-1 w-fit">EXECUTING "pure_defi_freedom.exe"</span>
		</div>
		<div class="mt-4 text-sm opacity-90 w-fit gap-2 flex items-center">
			<span class="text-green-300">SYSTEM_STATUS:</span> 
			<span class="typing-animation typing-delay-2">Powered by the Flare Time Series Oracle (FTSO)</span>
		</div>
	</div>

	<div class="mx-auto mb-8 grid max-w-4xl gap-6 md:grid-cols-2">
		<div class="group border-2 border-white bg-primary p-6 transition-colors hover:bg-blue-700">
			<h2 class="mb-4 flex items-center gap-2 text-2xl">
				[ WHAT YOU GET ]<span class="text-xs opacity-70 group-hover:opacity-100">{loadingDots}</span>
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
				[ HOW IT WORKS ] <span class="text-xs opacity-70 group-hover:opacity-100">{loadingDots}</span>
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

	<div class="mx-auto max-w-4xl text-center box-delay-4">
		<div class="border-2 border-white bg-primary p-8 flex flex-col">
			<h2 class="mb-6 text-3xl self-start">READY_PLAYER_ONE{loadingDots}</h2>
			<div class="flex justify-center gap-4">
				<Button class="w-32" on:click={() => goto(base + '/lock')}>LOCK</Button>
				<Button class="w-32" on:click={() => goto(base + '/unlock')}>UNLOCK</Button>
			</div>
		</div>
	</div>
</main>