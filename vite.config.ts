/// <reference types="vitest" /> 
import { svelteTesting } from '@testing-library/svelte/vite';
import { defineConfig } from 'vite';
import { svelte } from '@sveltejs/vite-plugin-svelte';

export default defineConfig({
	plugins: [svelte()],
	resolve: process.env.VITEST ? { conditions: ['browser'] } : undefined,
	test: {
		env:{
			"STL_SKIP_AUTO_CLEANUP": "true"
		},
		projects: [
			{
				extends: './vite.config.ts',
				plugins: [svelteTesting()],
				test: {
					name: 'client',
					environment: 'jsdom',
					clearMocks: true,
					include: ['src/**/*.svelte.{test,spec}.{js,ts}'],
					exclude: ['src/lib/server/**'],
					setupFiles: ['./vitest-setup-client.ts'],
					isolate: false,
					pool: undefined
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					globals: true,
					name: 'server',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}']
				}
			}
		]
	}
});
