export interface PageFrontmatter {
	title: string
	description?: string
	tags?: string[]
	publish?: boolean
	canonical_url?: string
	timestamp?: string
}

export interface SiteFrontmatter extends PageFrontmatter {
	domain?: string
}

export function validatePageFrontmatter(
	data: Record<string, unknown>,
): PageFrontmatter {
	const frontmatter: PageFrontmatter = {
		title: '',
	}

	if (typeof data.title === 'string') {
		frontmatter.title = data.title
	}

	if (typeof data.description === 'string') {
		frontmatter.description = data.description
	}

	if (Array.isArray(data.tags)) {
		frontmatter.tags = data.tags.filter(
			(tag): tag is string => typeof tag === 'string',
		)
	}

	if (typeof data.publish === 'boolean') {
		frontmatter.publish = data.publish
	}

	if (typeof data.canonical_url === 'string') {
		frontmatter.canonical_url = data.canonical_url
	}

	if (typeof data.timestamp === 'string') {
		frontmatter.timestamp = data.timestamp
	}

	return frontmatter
}

export function validateSiteFrontmatter(
	data: Record<string, unknown>,
): SiteFrontmatter {
	const base = validatePageFrontmatter(data)
	const site: SiteFrontmatter = { ...base }

	if (typeof data.domain === 'string') {
		site.domain = data.domain
	}

	return site
}

export function normalizeFrontmatter(
	frontmatter: PageFrontmatter,
	defaults?: Partial<PageFrontmatter>,
): PageFrontmatter {
	return {
		title: frontmatter.title || defaults?.title || 'Untitled',
		description: frontmatter.description || defaults?.description,
		tags: frontmatter.tags || defaults?.tags || [],
		publish: frontmatter.publish !== false,
		canonical_url: frontmatter.canonical_url || defaults?.canonical_url,
		timestamp:
			frontmatter.timestamp || defaults?.timestamp || new Date().toISOString(),
	}
}

export function getDefaultFrontmatter(fileName: string): PageFrontmatter {
	return {
		title: fileName.replace(/\.mdx?$/, '').replace(/[-_]/g, ' '),
		tags: [],
		publish: true,
		timestamp: new Date().toISOString(),
	}
}
