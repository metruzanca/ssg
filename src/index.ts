import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { type AstroInlineConfig, build, dev } from 'astro'
import {
	type ContentPage,
	type ContentTree,
	discoverContent,
} from './content.js'

export interface SSGConfig {
	inputDir: string
	write: boolean
	obsidian: boolean
	configPath?: string
	dev: boolean
	port: number
}

const __dirname = dirname(fileURLToPath(import.meta.url))

async function generateAstroPages(
	contentTree: ContentTree,
	tempDir: string,
): Promise<void> {
	const pagesToGenerate: Array<{ page: ContentPage; outputPath: string }> = []

	// Collect all published pages
	for (const page of contentTree.allPages.values()) {
		if (!page.isPublished) continue

		// Generate clean URL path
		let outputPath = page.urlPath
		if (outputPath === '' || outputPath === 'index') {
			outputPath = 'index'
		}

		pagesToGenerate.push({ page, outputPath })
	}

	// Generate each page
	for (const { page, outputPath } of pagesToGenerate) {
		const astroContent = generatePageContent(page)
		const fileName =
			outputPath === 'index' ? 'index.astro' : `${outputPath}/index.astro`
		const filePath = join(tempDir, 'src/pages', fileName)

		await mkdir(dirname(filePath), { recursive: true })
		await writeFile(filePath, astroContent, 'utf-8')
	}
}

function generatePageContent(page: ContentPage): string {
	return `---
import Layout from '../../layouts/Layout.astro'

const title = ${JSON.stringify(page.title)}
const description = ${JSON.stringify(page.frontmatter.description || '')}
---

<Layout title={title} description={description}>
	<article class="prose max-w-none">
		<h1>{title}</h1>
		<div>${page.content}</div>
	</article>
</Layout>
`
}

async function copyAssets(
	contentTree: ContentTree,
	outputDir: string,
): Promise<void> {
	for (const asset of contentTree.allAssets.values()) {
		const outputPath = join(outputDir, asset.urlPath)
		await mkdir(dirname(outputPath), { recursive: true })
		await copyFile(asset.filePath, outputPath)
	}
}

export async function buildSite(config: SSGConfig): Promise<void> {
	console.log('🔍 Discovering content...')
	const contentTree = await discoverContent(config.inputDir)
	console.log(
		`📄 Found ${contentTree.allPages.size} pages, ${contentTree.allAssets.size} assets`,
	)

	const tempDir = join(process.cwd(), '.ssg-temp')
	const outputDir = join(process.cwd(), 'dist')

	try {
		// Create temp directory structure
		await mkdir(join(tempDir, 'src/pages'), { recursive: true })
		await mkdir(join(tempDir, 'src/layouts'), { recursive: true })
		await mkdir(join(tempDir, 'src/components'), { recursive: true })

		// Copy our source files to temp directory
		const srcDir = join(__dirname)

		// Create astro.config.mjs
		const astroConfig = `import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
	output: 'static',
	outDir: '${outputDir.replace(/\\/g, '/')}',
	integrations: [tailwind()],
	vite: {
		css: {
			transformer: 'lightningcss'
		}
	}
})
`
		await writeFile(join(tempDir, 'astro.config.mjs'), astroConfig, 'utf-8')

		// Copy layout files
		const layoutContent = await import('node:fs/promises').then((fs) =>
			fs.readFile(join(srcDir, 'layouts/Layout.astro'), 'utf-8'),
		)
		await writeFile(
			join(tempDir, 'src/layouts/Layout.astro'),
			layoutContent,
			'utf-8',
		)

		// Copy styles
		const stylesContent = await import('node:fs/promises').then((fs) =>
			fs.readFile(join(srcDir, 'styles.css'), 'utf-8'),
		)
		await writeFile(join(tempDir, 'src/styles.css'), stylesContent, 'utf-8')

		// Generate pages from content
		console.log('📝 Generating pages...')
		await generateAstroPages(contentTree, tempDir)

		// Create package.json for temp directory
		const packageJson = JSON.stringify(
			{
				name: 'ssg-temp',
				type: 'module',
				dependencies: {},
			},
			null,
			2,
		)
		await writeFile(join(tempDir, 'package.json'), packageJson, 'utf-8')

		// Build with Astro
		console.log('🏗️  Building with Astro...')
		await build({
			root: tempDir,
			outDir: outputDir,
			output: 'static',
			integrations: [],
		} as AstroInlineConfig)

		// Copy assets to dist
		console.log('📦 Copying assets...')
		await copyAssets(contentTree, outputDir)

		console.log(`✅ Build complete! Output: ${outputDir}`)
	} catch (error) {
		console.error('❌ Build failed:', error)
		throw error
	}
}

export async function devServer(config: SSGConfig): Promise<void> {
	console.log('🔍 Discovering content...')
	const contentTree = await discoverContent(config.inputDir)
	console.log(
		`📄 Found ${contentTree.allPages.size} pages, ${contentTree.allAssets.size} assets`,
	)

	const tempDir = join(process.cwd(), '.ssg-temp')

	try {
		// Create temp directory structure
		await mkdir(join(tempDir, 'src/pages'), { recursive: true })
		await mkdir(join(tempDir, 'src/layouts'), { recursive: true })

		// Create astro.config.mjs
		const astroConfig = `import { defineConfig } from 'astro/config'
import tailwind from '@astrojs/tailwind'

export default defineConfig({
	output: 'static',
	server: {
		port: ${config.port}
	},
	integrations: [tailwind()],
	vite: {
		css: {
			transformer: 'lightningcss'
		}
	}
})
`
		await writeFile(join(tempDir, 'astro.config.mjs'), astroConfig, 'utf-8')

		const srcDir = join(__dirname)

		// Copy layout files
		const layoutContent = await import('node:fs/promises').then((fs) =>
			fs.readFile(join(srcDir, 'layouts/Layout.astro'), 'utf-8'),
		)
		await writeFile(
			join(tempDir, 'src/layouts/Layout.astro'),
			layoutContent,
			'utf-8',
		)

		// Copy styles
		const stylesContent = await import('node:fs/promises').then((fs) =>
			fs.readFile(join(srcDir, 'styles.css'), 'utf-8'),
		)
		await writeFile(join(tempDir, 'src/styles.css'), stylesContent, 'utf-8')

		// Generate pages from content
		console.log('📝 Generating pages...')
		await generateAstroPages(contentTree, tempDir)

		// Create package.json for temp directory
		const packageJson = JSON.stringify(
			{
				name: 'ssg-temp',
				type: 'module',
				dependencies: {},
			},
			null,
			2,
		)
		await writeFile(join(tempDir, 'package.json'), packageJson, 'utf-8')

		// Start dev server
		console.log(`🚀 Starting dev server on http://localhost:${config.port}`)
		await dev({
			root: tempDir,
			server: {
				port: config.port,
			},
			output: 'static',
			integrations: [],
		} as AstroInlineConfig)

		// Keep process alive
		await new Promise(() => {})
	} catch (error) {
		console.error('❌ Dev server failed:', error)
		throw error
	}
}
