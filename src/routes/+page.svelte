<script lang="ts">
	import logo from '$lib/logo-white.svg';
	import { ArrowsRepeatCountOutline, LockOpenOutline, LockOutline } from 'flowbite-svelte-icons';
	import { fade } from 'svelte/transition';

	let loadingDots = '.';
	let showMainContent = true;
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
			<div class="mx-auto max-w-4xl border-2 border-white bg-primary p-8 pt-12">
				<div class="mb-8 flex flex-col gap-6">
					<img src={logo} alt="Cyclo logo" class="mb-4 w-full max-w-[400px]" />
					<h1 class="flex items-center gap-3 text-4xl font-bold tracking-wider">
						LEVERAGE WITHOUT FEAR_
					</h1>
					<p class="mb-4 text-xl">
						Access the power of leverage while keeping your FLR position completely safe from
						liquidations.
					</p>
				</div>
				<div class="mb-6">
					<div class="inline-block border border-dashed border-white p-3 text-lg opacity-80">
						<span class="text-green-400">&gt; EXECUTING</span> pure_defi_freedom.exe
					</div>
					<p class="mt-4 text-sm opacity-90">
						<span class="text-green-400">SYSTEM_STATUS:</span> Powered by the Flare Time Series Oracle
						(FTSO)
					</p>
				</div>
			</div>

			<div
				class="group mx-auto w-full max-w-4xl border-2 border-white bg-primary p-6 transition-colors hover:bg-blue-700"
			>
				<h2 class="mb-8 flex items-center gap-2 text-2xl">
					[ PURE DEFI FREEDOM ] <span class="text-xs opacity-70 group-hover:opacity-100"
						>loading{loadingDots}</span
					>
				</h2>
				<div class="grid gap-6 md:grid-cols-3">
					<div class="space-y-3">
						<p class="flex items-center gap-2">
							<span class="text-green-400">[✓]</span>
							<span>No Liquidations</span>
						</p>
						<p class="flex items-center gap-2">
							<span class="text-green-400">[✓]</span>
							<span>Always Solvent</span>
						</p>
					</div>
					<div class="space-y-3">
						<p class="flex items-center gap-2">
							<span class="text-green-400">[✓]</span>
							<span>Non-Custodial</span>
						</p>
						<p class="flex items-center gap-2">
							<span class="text-green-400">[✓]</span>
							<span>No Governance</span>
						</p>
					</div>
					<div class="space-y-3">
						<p class="flex items-center gap-2">
							<span class="text-green-400">[✓]</span>
							<span>Zero Fees</span>
						</p>
						<p class="flex items-center gap-2">
							<span class="text-green-400">[✓]</span>
							<span>Permissionless</span>
						</p>
					</div>
				</div>
			</div>

			<div class="mx-auto grid max-w-4xl gap-12 md:grid-cols-2">
				<div class="group border-2 border-white bg-primary p-6 transition-colors hover:bg-blue-700">
					<h2 class="mb-8 flex items-center gap-2 text-2xl">
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
					<h2 class="mb-8 flex items-center gap-2 text-2xl">
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
				<div class="col-span-2 flex flex-col gap-12">
					<div
						class="group mx-auto mb-8 max-w-4xl border-2 border-white bg-primary p-6 transition-colors hover:bg-blue-700"
					>
						<h2 class="mb-8 flex items-center gap-2 text-2xl">
							[ INTRODUCING cysFLR ] <span class="text-xs opacity-70 group-hover:opacity-100"
								>installing{loadingDots}</span
							>
						</h2>
						<div class="grid gap-6 md:grid-cols-2">
							<div class="space-y-4">
								<p class="flex items-start gap-3">
									<span class="text-xl text-green-400">►</span>
									<span>A new token backed by locked sFLR collateral</span>
								</p>
								<p class="flex items-start gap-3">
									<span class="text-xl text-green-400">►</span>
									<span>Freely tradeable in the open market</span>
								</p>
								<p class="flex items-start gap-3">
									<span class="text-xl text-green-400">►</span>
									<span>Price moves with market demand for leverage</span>
								</p>
							</div>
							<div class="space-y-4">
								<p class="flex items-start gap-3">
									<span class="text-xl text-green-400">►</span>
									<span>Natural price cycles create trading opportunities</span>
								</p>
								<p class="flex items-start gap-3">
									<span class="text-xl text-green-400">►</span>
									<span>Backed by real FLR value, not algorithmic</span>
								</p>
							</div>
						</div>
					</div>
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
