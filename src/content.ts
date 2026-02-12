import { readdir, readFile } from 'node:fs/promises'
import { basename, extname, join } from 'node:path'
import matter from 'gray-matter'

export interface ContentPage {
	id: string
	filePath: string
	relativePath: string
	urlPath: string
	frontmatter: Record<string, unknown>
	content: string
	title: string
	isPublished: boolean
}

export interface ContentAsset {
	id: string
	filePath: string
	relativePath: string
	urlPath: string
	mimeType: string
}

export interface ContentDirectory {
	path: string
	relativePath: string
	urlPath: string
	readme?: ContentPage
	children: ContentDirectory[]
	pages: ContentPage[]
	assets: ContentAsset[]
}

export interface ContentTree {
	root: ContentDirectory
	allPages: Map<string, ContentPage>
	allAssets: Map<string, ContentAsset>
}

const IGNORE_PATTERNS = [
	'node_modules',
	'.git',
	'.gitignore',
	'dist',
	'.DS_Store',
	'Thumbs.db',
]

const MARKDOWN_EXTENSIONS = ['.md', '.mdx']
const ASSET_EXTENSIONS = [
	'.png',
	'.jpg',
	'.jpeg',
	'.gif',
	'.svg',
	'.webp',
	'.ico',
	'.pdf',
	'.mp4',
	'.webm',
	'.mov',
]

function normalizeToUrlPath(filePath: string): string {
	// Remove extension
	const withoutExt = filePath.replace(/\.mdx?$/, '')
	// Normalize to lowercase with dashes
	return withoutExt
		.toLowerCase()
		.replace(/[^a-z0-9/]+/g, '-')
		.replace(/^-|-$/g, '')
		.replace(/\/+/g, '/')
}

function getMimeType(ext: string): string {
	const mimeTypes: Record<string, string> = {
		'.png': 'image/png',
		'.jpg': 'image/jpeg',
		'.jpeg': 'image/jpeg',
		'.gif': 'image/gif',
		'.svg': 'image/svg+xml',
		'.webp': 'image/webp',
		'.ico': 'image/x-icon',
		'.pdf': 'application/pdf',
		'.mp4': 'video/mp4',
		'.webm': 'video/webm',
		'.mov': 'video/quicktime',
	}
	return mimeTypes[ext.toLowerCase()] || 'application/octet-stream'
}

function shouldIgnore(name: string): boolean {
	return IGNORE_PATTERNS.some(
		(pattern) => name === pattern || name.startsWith('.'),
	)
}

export async function discoverContent(inputDir: string): Promise<ContentTree> {
	const allPages = new Map<string, ContentPage>()
	const allAssets = new Map<string, ContentAsset>()

	async function scanDirectory(
		dirPath: string,
		relativeDir: string,
	): Promise<ContentDirectory> {
		const entries = await readdir(dirPath, { withFileTypes: true })
		const contentDir: ContentDirectory = {
			path: dirPath,
			relativePath: relativeDir,
			urlPath: relativeDir === '.' ? '' : normalizeToUrlPath(relativeDir),
			children: [],
			pages: [],
			assets: [],
		}

		for (const entry of entries) {
			if (shouldIgnore(entry.name)) continue

			const fullPath = join(dirPath, entry.name)
			const relPath =
				relativeDir === '.' ? entry.name : join(relativeDir, entry.name)

			if (entry.isDirectory()) {
				const childDir = await scanDirectory(fullPath, relPath)
				contentDir.children.push(childDir)
			} else if (entry.isFile()) {
				const ext = extname(entry.name)

				if (MARKDOWN_EXTENSIONS.includes(ext)) {
					const fileContent = await readFile(fullPath, 'utf-8')
					const { data: frontmatter, content } = matter(fileContent)

					const page: ContentPage = {
						id: relPath,
						filePath: fullPath,
						relativePath: relPath,
						urlPath: normalizeToUrlPath(relPath),
						frontmatter,
						content,
						title: (frontmatter.title as string) || basename(entry.name, ext),
						isPublished: frontmatter.publish !== false,
					}

					if (entry.name.toLowerCase() === 'readme.md') {
						contentDir.readme = page
					} else {
						contentDir.pages.push(page)
					}

					allPages.set(relPath, page)
				} else if (ASSET_EXTENSIONS.includes(ext)) {
					const asset: ContentAsset = {
						id: relPath,
						filePath: fullPath,
						relativePath: relPath,
						urlPath: `/assets/${relPath}`,
						mimeType: getMimeType(ext),
					}

					contentDir.assets.push(asset)
					allAssets.set(relPath, asset)
				}
			}
		}

		return contentDir
	}

	const root = await scanDirectory(inputDir, '.')

	return {
		root,
		allPages,
		allAssets,
	}
}

export function getPageByUrl(
	contentTree: ContentTree,
	urlPath: string,
): ContentPage | undefined {
	for (const page of contentTree.allPages.values()) {
		if (page.urlPath === urlPath) {
			return page
		}
	}
	return undefined
}

export function getAllPublishedPages(contentTree: ContentTree): ContentPage[] {
	return Array.from(contentTree.allPages.values()).filter(
		(page) => page.isPublished,
	)
}
