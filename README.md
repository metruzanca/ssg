# ssg

SSG is my personal static site generator. Used to build my new version of my personal website. Its heavily opinionated. Convention over configuration. SSG ships as a CLI and is used in a separate repository holding all my content.

## Installation

SSG is not published to npm. Install it directly from GitHub:

```bash
# Install globally
bun add -g github:metruzanca/ssg

# Or add to your project
bun add github:metruzanca/ssg
```

## Quick Start

```bash
# Run ssg in current directory
ssg

# Run ssg on specific directory
ssg path/to/content

# Build with additional options
ssg --write    # Enforce formatting conventions
ssg --obsidian # Enable Obsidian compatibility
ssg path/to/content --write --obsidian
```
