<script lang="ts">
	import { Modal, Spinner } from 'flowbite-svelte';
	import Button from '$lib/components/Button.svelte';

	import transactionStore from '$lib/transactionStore';
	import { TransactionStatus } from '$lib/transactionStore';

	const handleClose = () => {
		return transactionStore.reset();
	};
</script>

<Modal
	size="sm"
	defaultClass="rounded-none border-4 inset"
	class="bg-opacity-90 backdrop-blur-sm"
	open={$transactionStore.status !== TransactionStatus.IDLE}
	on:close={() => handleClose()}
>
	{#if $transactionStore.status !== TransactionStatus.IDLE}
		<div class="flex flex-col items-center justify-center gap-2 p-4">
			{#if $transactionStore.status === TransactionStatus.ERROR}
				<div
					class="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-red-400 bg-red-100 dark:bg-red-900"
				>
					<h1 class="text-2xl">❌</h1>
				</div>
				<p class="text-lg font-semibold text-gray-900 dark:text-white">
					{$transactionStore.status}
				</p>
				<p class="text-sm font-normal text-gray-900 dark:text-white">
					{$transactionStore.error}
				</p>
				<Button on:click={() => handleClose()} class="mt-4">DISMISS</Button>
			{:else if $transactionStore.status === TransactionStatus.SUCCESS}
				<div
					class="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900"
				>
					<h1 class="text-2xl">✅</h1>
				</div>
				<div class="flex flex-col gap-2 text-left">
					<p class="text-lg font-semibold text-gray-900 dark:text-white">
						{$transactionStore.status}
					</p>
				</div>

				{#if $transactionStore.hash}
					<a class="hover:underline" href={`https://flarescan.com/tx/${$transactionStore.hash}`}
						>View transaction on Flarescan</a
					>
				{/if}

				<Button on:click={() => handleClose()} class="mt-4">DISMISS</Button>
			{:else if $transactionStore.status === TransactionStatus.CHECKING_ALLOWANCE || $transactionStore.status === TransactionStatus.PENDING_WALLET || $transactionStore.status === TransactionStatus.PENDING_LOCK || $transactionStore.status === TransactionStatus.PENDING_UNLOCK || $transactionStore.status === TransactionStatus.PENDING_APPROVAL}
				<div
					class="bg-primary-100 dark:bg-primary-900 mb-4 flex h-16 w-16 items-center justify-center rounded-full"
				>
					<Spinner color="blue" size={15} />
				</div>
				<p class="text-lg font-semibold text-gray-900 dark:text-white">
					{$transactionStore.message || $transactionStore.status}
				</p>
			{/if}
		</div>
	{/if}
</Modal>
