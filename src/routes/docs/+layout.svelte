<script lang="ts">
	import logo from '$lib/logo.svg';
	import type { LayoutData } from './$types';

	export let data: LayoutData;
</script>

<div class="sticky top-0 z-[999] h-[var(--header-height)] border-b bg-white p-4">
	<a href="/">
		<img src={logo} alt="Cyclo logo" class="max-h-full" data-testid="logo" />
	</a>
</div>
<div class="z-0 flex">
	<div
		class="sticky top-[var(--header-height)] h-[calc(100vh-var(--header-height))] min-w-80 overflow-auto border-r p-4"
	>
		<ul class="container mx-auto flex flex-col gap-y-8" data-testid="side-menu">
			{#each data.categorisedArticles as { articles }}
				<li class="flex flex-col gap-y-2">
					{#each articles as { slug, title }}
						<a data-testid="doc-title" href={`${slug}`}>{title}</a>
					{/each}
				</li>
			{/each}
		</ul>
	</div>
	<div>
		<div class="prose prose-neutral max-w-[100ch] p-8">
			<slot></slot>
		</div>
	</div>
</div>

<style>
	:root {
		--header-height: 64px; /* Set this to the actual height of your header */
	}
</style>
