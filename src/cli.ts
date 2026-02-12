#!/usr/bin/env node

import { existsSync } from 'node:fs'
import { access } from 'node:fs/promises'
import { resolve } from 'node:path'
import { Command } from 'commander'
import { buildSite, devServer } from './index.js'

const program = new Command()

program
	.name('ssg')
	.description('Opinionated static site generator for markdown content')
	.version('0.1.0')
	.argument('[directory]', 'Input directory containing markdown content', '.')
	.option('-w, --write', 'Enable convention enforcement (formatting, renaming)')
	.option('-o, --obsidian', 'Enable Obsidian compatibility mode')
	.option('-c, --config <path>', 'Path to custom config file')
	.option('-d, --dev', 'Start development server with live reload')
	.option('-p, --port <number>', 'Port for dev server', '4321')
	.action(async (directory, options) => {
		const inputPath = resolve(directory)

		// Validate input directory
		if (!existsSync(inputPath)) {
			console.error(`Error: Directory not found: ${inputPath}`)
			process.exit(1)
		}

		try {
			await access(inputPath)
		} catch {
			console.error(`Error: Cannot access directory: ${inputPath}`)
			process.exit(1)
		}

		const config = {
			inputDir: inputPath,
			write: options.write || false,
			obsidian: options.obsidian || false,
			configPath: options.config,
			dev: options.dev || false,
			port: parseInt(options.port, 10),
		}

		try {
			if (config.dev) {
				console.log(`🚀 Starting dev server on port ${config.port}...`)
				await devServer(config)
			} else {
				console.log('📦 Building site...')
				await buildSite(config)
				console.log('✅ Build complete!')
			}
		} catch (error) {
			console.error('❌ Error:', error instanceof Error ? error.message : error)
			process.exit(1)
		}
	})

program.parse()
