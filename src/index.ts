import { copyFile, mkdir, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
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

// Inlined layout template
const LAYOUT_TEMPLATE = `---
import '../styles.css'

interface Props {
	title: string
	description?: string
}

const { title, description } = Astro.props
---

<!doctype html>
<html lang="en">
	<head>
		<meta charset="UTF-8" />
		<meta name="viewport" content="width=device-width, initial-scale=1.0" />
		<meta name="description" content={description || title} />
		<title>{title}</title>
	</head>
	<body class="min-h-screen bg-background text-foreground">
		<a href="#main-content" class="skip-link">Skip to main content</a>
		<div class="flex flex-col min-h-screen">
			<header class="border-b border-border">
				<div class="max-w-6xl mx-auto px-4 py-4">
					<nav class="flex items-center justify-between">
						<a href="/" class="text-xl font-semibold hover:opacity-80 transition-opacity">
							SSG
						</a>
						<button
							id="theme-toggle"
							class="p-2 rounded-lg bg-muted hover:bg-accent transition-colors"
							aria-label="Toggle dark mode"
						>
							<span id="theme-icon">🌙</span>
						</button>
					</nav>
				</div>
			</header>
			<main id="main-content" class="flex-1 max-w-6xl mx-auto px-4 py-8 w-full">
				<slot />
			</main>
			<footer class="border-t border-border mt-auto">
				<div class="max-w-6xl mx-auto px-4 py-6 text-center text-muted-foreground">
					<p>Built with SSG</p>
				</div>
			</footer>
		</div>

		<script>
			// Dark mode toggle
			const themeToggle = document.getElementById('theme-toggle')
			const themeIcon = document.getElementById('theme-icon')
			const html = document.documentElement

			// Check for saved theme preference or default to system preference
			const savedTheme = localStorage.getItem('theme')
			if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
				html.classList.add('dark')
				if (themeIcon) themeIcon.textContent = '☀️'
			}

			themeToggle?.addEventListener('click', () => {
				html.classList.toggle('dark')
				const isDark = html.classList.contains('dark')
				localStorage.setItem('theme', isDark ? 'dark' : 'light')
				if (themeIcon) themeIcon.textContent = isDark ? '☀️' : '🌙'
			})
		</script>
	</body>
</html>
`

// Inlined CSS template
const STYLES_TEMPLATE = `@import "tailwindcss";

@theme {
	--color-background: #ffffff;
	--color-foreground: #1a1a1a;
	--color-muted: #f5f5f5;
	--color-muted-foreground: #737373;
	--color-border: #e5e5e5;
	--color-primary: #0f0f0f;
	--color-primary-foreground: #fafafa;
	--color-accent: #f5f5f5;
	--color-accent-foreground: #0f0f0f;
	--color-ring: #a3a3a3;
}

.dark {
	--color-background: #0a0a0a;
	--color-foreground: #fafafa;
	--color-muted: #262626;
	--color-muted-foreground: #a3a3a3;
	--color-border: #404040;
	--color-primary: #fafafa;
	--color-primary-foreground: #0a0a0a;
	--color-accent: #262626;
	--color-accent-foreground: #fafafa;
	--color-ring: #525252;
}

html {
	scroll-behavior: smooth;
}

body {
	background-color: var(--color-background);
	color: var(--color-foreground);
}

.skip-link {
	position: absolute;
	top: -40px;
	left: 0;
	background: var(--color-primary);
	color: var(--color-primary-foreground);
	padding: 8px;
	text-decoration: none;
	z-index: 100;
}

.skip-link:focus {
	top: 0;
}

.prose {
	color: var(--color-foreground);
	line-height: 1.75;
}

.prose h1, .prose h2, .prose h3, .prose h4, .prose h5, .prose h6 {
	color: var(--color-foreground);
	font-weight: 600;
	margin-top: 2em;
	margin-bottom: 1em;
}

.prose h1 { font-size: 2.25rem; line-height: 1.2; }
.prose h2 { font-size: 1.75rem; line-height: 1.3; }
.prose h3 { font-size: 1.375rem; line-height: 1.4; }
.prose p { margin-bottom: 1.25em; }
.prose a {
	color: var(--color-primary);
	text-decoration: underline;
	text-underline-offset: 4px;
}
.dark .prose a { color: var(--color-primary-foreground); }
.prose a:hover { opacity: 0.8; }

.prose code {
	background-color: var(--color-muted);
	padding: 0.2em 0.4em;
	border-radius: 4px;
	font-size: 0.875em;
	font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
}

.prose pre {
	background-color: var(--color-muted);
	padding: 1em;
	border-radius: 8px;
	overflow-x: auto;
	margin: 1.5em 0;
}

.prose pre code { background-color: transparent; padding: 0; font-size: 0.875em; }
.prose ul, .prose ol { margin-bottom: 1.25em; padding-left: 1.5em; }
.prose li { margin-bottom: 0.5em; }

.prose blockquote {
	border-left: 4px solid var(--color-border);
	padding-left: 1em;
	margin: 1.5em 0;
	color: var(--color-muted-foreground);
}

.prose img { max-width: 100%; height: auto; border-radius: 8px; }
.prose hr { border: 0; border-top: 1px solid var(--color-border); margin: 2em 0; }

.prose table {
	width: 100%;
	border-collapse: collapse;
	margin: 1.5em 0;
}

.prose th, .prose td {
	border: 1px solid var(--color-border);
	padding: 0.75em;
	text-align: left;
}

.prose th { background-color: var(--color-muted); font-weight: 600; }
`

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

async function buildSite(config: SSGConfig): Promise<void> {
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

		// Create astro.config.mjs
		const astroConfig = `import { defineConfig } from 'astro/config'

export default defineConfig({
	output: 'static',
	outDir: '${outputDir.replace(/\\/g, '/')}',
	vite: {
		css: {
			transformer: 'lightningcss'
		}
	}
})
`
		await writeFile(join(tempDir, 'astro.config.mjs'), astroConfig, 'utf-8')

		// Create postcss.config.mjs
		const postcssConfig = `export default {
	plugins: {
		'@tailwindcss/postcss': {}
	}
}
`
		await writeFile(join(tempDir, 'postcss.config.mjs'), postcssConfig, 'utf-8')

		// Write layout file from template
		await writeFile(
			join(tempDir, 'src/layouts/Layout.astro'),
			LAYOUT_TEMPLATE,
			'utf-8',
		)

		// Write styles file from template
		await writeFile(join(tempDir, 'src/styles.css'), STYLES_TEMPLATE, 'utf-8')

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

async function devServer(config: SSGConfig): Promise<void> {
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

export default defineConfig({
	output: 'static',
	server: {
		port: ${config.port}
	},
	vite: {
		css: {
			transformer: 'lightningcss'
		}
	}
})
`
		await writeFile(join(tempDir, 'astro.config.mjs'), astroConfig, 'utf-8')

		// Create postcss.config.mjs
		const postcssConfig = `export default {
	plugins: {
		'@tailwindcss/postcss': {}
	}
}
`
		await writeFile(join(tempDir, 'postcss.config.mjs'), postcssConfig, 'utf-8')

		// Write layout file from template
		await writeFile(
			join(tempDir, 'src/layouts/Layout.astro'),
			LAYOUT_TEMPLATE,
			'utf-8',
		)

		// Write styles file from template
		await writeFile(join(tempDir, 'src/styles.css'), STYLES_TEMPLATE, 'utf-8')

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

export { buildSite, devServer }
