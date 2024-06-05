import type { Config } from 'tailwindcss';

export default {
	content: ['./src/**/*.{html,js,svelte,ts}'],

	theme: {
		extend: {
			colors: {
				primary: '#1E26E8'
			}
		}
	},

	plugins: [require('@tailwindcss/typography')]
} as Config;
