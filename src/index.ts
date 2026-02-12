export interface SSGConfig {
	inputDir: string
	write: boolean
	obsidian: boolean
	configPath?: string
	dev: boolean
	port: number
}

export async function buildSite(config: SSGConfig): Promise<void> {
	console.log('Building site with config:', config)
	// TODO: Implement build logic
}

export async function devServer(config: SSGConfig): Promise<void> {
	console.log('Starting dev server with config:', config)
	// TODO: Implement dev server
	// Keep process alive
	await new Promise(() => {})
}
