# SSG Examples

This directory contains example sites built with SSG.

## Available Examples

### zanca.dev
A personal portfolio site demonstrating SSG capabilities.

**Source:** [github.com/metruzanca/metruzanca](https://github.com/metruzanca/metruzanca)

## Quick Start

### Clone with Submodules

If you haven't cloned the repository yet:

```bash
git clone --recursive https://github.com/metruzanca/ssg.git
```

### Initialize Submodules (if already cloned)

```bash
git submodule update --init --recursive
```

### Build an Example

Navigate to the SSG project root and build the example:

```bash
# Build zanca.dev example
bun dist/cli.js examples/zanca.dev

# Or run the dev server
bun dist/cli.js examples/zanca.dev --dev
```

### View the Result

After building, the static site will be generated in the `dist/` directory:

```bash
# Serve the built site
npx serve dist

# Or open directly
cd dist && python -m http.server 8080
```

Then open `http://localhost:8080` in your browser.

## Development Mode

Run the dev server for live reloading during development:

```bash
# Default port (4321)
bun dist/cli.js examples/zanca.dev --dev

# Custom port
bun dist/cli.js examples/zanca.dev --dev --port 3000
```

## Updating Examples

To update the example submodules to the latest version:

```bash
git submodule update --remote
```

## Troubleshooting

### Submodule not found

If you see errors about missing submodule content:

```bash
git submodule update --init --recursive
```

### Build errors

Make sure you've built SSG first:

```bash
cd /path/to/ssg
bun run build
```

### Permission denied

If you get permission errors, make sure the CLI is built:

```bash
bun run build
bun dist/cli.js examples/zanca.dev
```
