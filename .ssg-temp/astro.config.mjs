import { defineConfig } from 'astro/config'

export default defineConfig({
	output: 'static',
	outDir: '/Users/sentience/code/ssg/dist',
	vite: {
		css: {
			transformer: 'lightningcss'
		}
	}
})
