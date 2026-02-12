import { expect, test, describe } from 'bun:test'
import { discoverContent } from '../src/content'
import { validatePageFrontmatter, normalizeFrontmatter } from '../src/frontmatter'
import { mkdir, writeFile, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { existsSync } from 'node:fs'

describe('Content Discovery', () => {
	test('should discover markdown files', async () => {
		const testDir = join(process.cwd(), 'test-content-temp')
		
		// Setup test directory
		await mkdir(testDir, { recursive: true })
		await writeFile(
			join(testDir, 'readme.md'),
			'---\ntitle: Test\n---\n# Test',
			'utf-8'
		)
		await writeFile(
			join(testDir, 'page.md'),
			'---\ntitle: Page\n---\n# Page',
			'utf-8'
		)

		const tree = await discoverContent(testDir)

		expect(tree.allPages.size).toBe(2)
		expect(tree.allPages.has('readme.md')).toBe(true)
		expect(tree.allPages.has('page.md')).toBe(true)

		// Cleanup
		await rm(testDir, { recursive: true })
	})
})

describe('Frontmatter', () => {
	test('should validate page frontmatter', () => {
		const data = {
			title: 'Test Page',
			description: 'A test page',
			tags: ['test', 'demo'],
			publish: true
		}

		const result = validatePageFrontmatter(data)

		expect(result.title).toBe('Test Page')
		expect(result.description).toBe('A test page')
		expect(result.tags).toEqual(['test', 'demo'])
		expect(result.publish).toBe(true)
	})

	test('should normalize frontmatter with defaults', () => {
		const frontmatter = validatePageFrontmatter({ title: 'Test' })
		const normalized = normalizeFrontmatter(frontmatter)

		expect(normalized.title).toBe('Test')
		expect(normalized.publish).toBe(true)
		expect(normalized.tags).toEqual([])
		expect(normalized.timestamp).toBeDefined()
	})
})
