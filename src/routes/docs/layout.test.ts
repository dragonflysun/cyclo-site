import { test } from 'vitest';
import { expect } from '$lib/test/matchers';
import { render, screen } from '@testing-library/svelte';
import Layout from './+layout.svelte';
import { load as layoutLoad } from './+layout.server';

test('should retrieve layout data', async () => {
	let data = await layoutLoad();

	expect(data).toBeDefined();
	expect(data.categorisedArticles).toBeDefined();

	expect(data.categorisedArticles[0].category).equals('Introduction');
	expect(data.categorisedArticles[0].articles[0].title).equals('Introduction');
});

test('layout component should render', async () => {
	const data = await layoutLoad();

	render(Layout, { data });

	const sideMenu = screen.getByTestId('side-menu');
	expect(sideMenu).toBeInTheDocument();

	const publishedDocTitles = screen.getAllByTestId('doc-title');
	expect(publishedDocTitles).toHaveLength(1);
});
