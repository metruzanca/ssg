# SSG Development Tasks

## Overview

SSG is an opinionated static site generator built on top of Astro's programmatic API. It processes markdown content directories and generates progressive-enhancement websites with features like search, image optimization, and RSS feeds.

### Design Decisions & Rationale

- **Astro as Core**: Uses Astro's programmatic `build()` API instead of CLI spawning for better control and error handling
- **Convention over Configuration**: Minimal configuration with sensible defaults, enforced through CLI flags when needed
- **Progressive Enhancement**: Static-first approach where JavaScript enhances but isn't required
- **Content Structure**: GitHub-repo-style organization with readme.md files and nested directories
- **Configuration Priority**: CLI flags > root readme.md frontmatter > built-in defaults
- **URL Structure**: Clean URLs (`/about/` → `/about/index.html`) for SEO and usability
- **Styling**: Tailwind CSS for utility-first styling with dark mode support

## Phase 1: Core Foundation

### CLI Setup

**Context**: The CLI interface is the primary entry point for SSG. Commander.js provides robust argument parsing and help generation. Optional path argument allows flexible usage patterns while maintaining simple defaults.

- [ ] Setup Commander.js with basic command structure
- [ ] Add optional directory path argument (defaults to current directory)
- [ ] Add `--write` flag for convention enforcement
- [ ] Add `--obsidian` flag for Obsidian compatibility  
- [ ] Add `--config` flag for custom config file path
- [ ] Add input directory validation with helpful error messages
- [ ] Setup proper error handling and logging with colored output

### Dev Server & Watch Mode

**Context**: A development server with live reload is essential for content authoring workflow. We leverage Astro's built-in dev server with file watching to provide instant feedback during development.

- [ ] Add `--dev` flag to CLI for development mode
- [ ] Implement file watcher for content and asset changes
- [ ] Setup Astro dev server integration with HMR
- [ ] Configure live reload for markdown content changes
- [ ] Add `--port` flag for custom dev server port (default 4321)
- [ ] Implement graceful shutdown and error recovery

### Content Discovery

**Context**: Content discovery builds an in-memory representation of the content structure. It needs to handle arbitrary nesting, identify markdown files vs media assets, and prepare data for Astro's content collections system.

- [ ] Implement recursive markdown file scanning with ignore patterns (.gitignore, node_modules)
- [ ] Create file structure analysis utilities for hierarchy building
- [ ] Handle media asset discovery (images, videos, documents)
- [ ] Build content tree representation with metadata
- [ ] Implement efficient change detection for potential future incremental builds

### Basic Astro Integration

**Context**: Astro provides the markdown processing, static asset handling, and build pipeline. We use the programmatic API to generate dynamic configurations and have fine-grained control over the build process.

- [ ] Install Astro and required dependencies (@astrojs/markdown-remark)
- [ ] Implement dynamic Astro configuration generation based on discovered content
- [ ] Setup programmatic build API integration with proper error handling
- [ ] Configure static output to `dist/` directory with clean URL structure
- [ ] Setup clean URLs (`/about/` → `/about/index.html`) for all pages
- [ ] Configure asset output organization (`/assets/`, `/images/`)
- [ ] Test basic build pipeline with simple markdown content

### Frontmatter System

**Context**: Frontmatter drives page metadata and site configuration. We use gray-matter for parsing and TypeScript for strict typing. The root readme.md serves dual purpose: content and site configuration.

- [ ] Implement frontmatter parsing with gray-matter and custom validation
- [ ] Validate frontmatter schema for pages (title, tags, publish, etc.)
- [ ] Handle site-wide config from root readme.md (domain, site settings)
- [ ] Create TypeScript types for configuration with proper inheritance
- [ ] Implement config priority system (CLI > root frontmatter > defaults)
- [ ] Add frontmatter normalization and default value injection

### Styling System

**Context**: Tailwind CSS provides a utility-first approach that keeps styling maintainable and consistent. We use CSS custom properties for theming, enabling dark mode and future customization while maintaining opinionated defaults.

- [ ] Install and configure Tailwind CSS with Astro (@astrojs/tailwind)
- [ ] Define color palette using CSS custom properties for theming
- [ ] Create typography scale for readable prose content (@tailwindcss/typography)
- [ ] Implement dark mode with class-based toggle and system preference detection
- [ ] Configure responsive breakpoints (mobile-first approach)
- [ ] Create base layout template with header, main content, footer structure
- [ ] Style code blocks to complement Shiki syntax highlighting themes
- [ ] Add skip-link and basic accessibility styling

## Phase 2: Content Processing

### Markdown Rendering

**Context**: Markdown is the core content format. Astro handles basic rendering, but we need custom processing for syntax highlighting with Shiki, link handling, and potential transclusion support.

- [ ] Setup Shiki syntax highlighting with theme configuration
- [ ] Configure remark/rehype pipeline for custom transformations
- [ ] Implement code block processing with copy buttons and language labels
- [ ] Add custom remark plugins for internal link handling and validation
- [ ] Test markdown rendering output with various content types and edge cases

### File Naming System

**Context**: URL structure matters for SEO and user experience. We normalize filenames to lowercase-dashes while preserving readability. This ensures consistent URLs regardless of original file naming conventions.

- [ ] Implement filename normalization (lowercase-dashes) preserving readability
- [ ] Handle path sanitization for special characters and reserved names
- [ ] Create URL routing system that maps file paths to URLs
- [ ] Ensure proper file extension handling (.md → .html mapping)
- [ ] Test filename conversion edge cases (unicode, special chars, conflicts)

### Link Validation

**Context**: Broken links hurt user experience and SEO. We extract all internal links during processing and validate them against discovered content structure to catch issues before deployment.

- [ ] Extract internal links from markdown content using remark AST
- [ ] Build link validation system against discovered content tree
- [ ] Generate link validation reports with file paths and line numbers
- [ ] Handle external vs internal link distinction for different validation rules
- [ ] Implement dead link detection with helpful error messages

### Directory Listings

**Context**: Not every directory needs a readme.md. When missing, we generate automatic directory listings showing subdirectories and pages. This maintains navigation consistency across the site.

- [ ] Create directory listing template with Astro components
- [ ] Implement fallback logic for missing readme.md files
- [ ] Generate recursive or flat listings based on directory depth
- [ ] Style directory listings appropriately with proper navigation
- [ ] Test with various directory structures and edge cases

## Phase 3: Advanced Features

### Image Processing

**Context**: Images impact page load times significantly. We use fluent-ffmpeg to generate optimized formats (WebP, HEIC, AVIF) at multiple resolutions, ensuring fast loading across devices and browsers.

- [ ] Install and configure fluent-ffmpeg for Node.js image processing
- [ ] Implement image optimization pipeline with parallel processing
- [ ] Generate WebP and HEIC versions with quality settings
- [ ] Create responsive image generation with srcset support
- [ ] Add AVIF format support for modern browsers (if needed)
- [ ] Handle image metadata preservation (EXIF, orientation)

### Search Index Generation

**Context**: Users need to find content quickly. FlexSearch provides fast client-side search with small bundle size. We generate static search indexes during build time for instant results.

- [ ] Integrate FlexSearch for full-text search with custom tokenizer
- [ ] Build search index generation system from page content and metadata
- [ ] Create search UI components with keyboard navigation
- [ ] Implement search result ranking by relevance and recency
- [ ] Test search with various content types and edge cases

### RSS Generation

**Context**: RSS enables content syndication and RSS readers. We generate feeds for all published pages, requiring domain configuration for proper URLs and metadata.

- [ ] Install RSS generation library (rss package)
- [ ] Build RSS feed generation system with proper encoding
- [ ] Handle domain configuration requirement with validation
- [ ] Generate feeds for all published pages with proper timestamps
- [ ] Validate RSS output format against RSS 2.0 specification

### Navigation Structure

**Context**: Good navigation helps users discover content. We automatically build navigation trees from directory structure, create breadcrumbs for context, and implement menus with depth limits.

- [ ] Build site navigation tree from content hierarchy
- [ ] Create breadcrumb generation with proper linking
- [ ] Implement automatic menu creation with sorting options
- [ ] Handle navigation depth limits to prevent menu overflow
- [ ] Style navigation components with responsive design

## Phase 4: Progressive Enhancement

### Link Previews

**Context**: Link previews improve navigation by showing content context before clicking. We generate static previews during build and display them on hover, providing rich context without additional page loads.

- [ ] Implement hover preview system for internal links with debouncing
- [ ] Create preview content generation from page excerpts
- [ ] Add preview styling and positioning with proper z-index handling
- [ ] Handle preview caching with localStorage for repeated visits
- [ ] Test preview performance with large sites and complex layouts

### View Transitions

**Context**: View Transitions API provides smooth, app-like navigation between pages. We implement this for supported browsers with graceful fallbacks to maintain usability everywhere.

- [ ] Implement View Transitions API with proper semantic naming
- [ ] Create transition animations that enhance rather than distract
- [ ] Handle browser compatibility with feature detection
- [ ] Add fallback for unsupported browsers (traditional page loads)
- [ ] Test transition smoothness across different content types and devices

### Client-side Enhancement

**Context**: JavaScript should enhance, not replace, core functionality. We implement prefetching for instant navigation, loading states for feedback, and client-side routing for smooth experiences.

- [ ] Implement prefetching for internal links with IntersectionObserver
- [ ] Create instant navigation experience with proper history handling
- [ ] Add loading states and indicators for perceived performance
- [ ] Implement client-side routing that works with View Transitions
- [ ] Optimize JavaScript bundle size with tree-shaking and code splitting

## Phase 5: Convention Features

### Content Formatting

**Context**: Consistent formatting reduces noise in version control and improves readability. The `--write` flag enforces markdown formatting standards that match rendered output and common best practices.

- [ ] Implement `--write` flag functionality with backup creation
- [ ] Create markdown formatting rules (line breaks, list spacing, code formatting)
- [ ] Add best practices enforcement (heading levels, link formatting)
- [ ] Handle code block formatting with proper indentation
- [ ] Test formatting with various content types and edge cases
- [ ] Ensure formatting preserves meaning and doesn't break custom syntax

### Obsidian Support

**Context**: Many users maintain content in Obsidian for personal knowledge management. The `--obsidian` flag enables bidirectional compatibility between Obsidian vaults and published sites.

- [ ] Implement `--obsidian` flag functionality with title swapping
- [ ] Create title swapping logic (file ↔ frontmatter title preferences)
- [ ] Handle Obsidian-style wiki links with proper conversion
- [ ] Ensure Obsidian search compatibility with metadata preservation
- [ ] Test with Obsidian export workflows and various linking patterns
- [ ] Document Obsidian-specific considerations and limitations

### File Convention Enforcement

**Context**: Consistent file naming prevents URL conflicts and improves SEO. We automatically rename non-compliant files while preserving important metadata like original titles.

- [ ] Create file naming convention validation with detailed reports
- [ ] Implement automatic file renaming with collision detection
- [ ] Handle title preservation for missing frontmatter from filenames
- [ ] Create convention violation reports with suggested fixes
- [ ] Test with various file naming patterns and edge cases
- [ ] Ensure renaming doesn't break existing links or references

## Additional Tasks

### Documentation

**Context**: Good documentation is crucial for adoption. We need comprehensive guides covering installation, configuration, and usage patterns. The documentation itself should be built with SSG to dogfood the tool.

- [ ] Update README with installation instructions (GitHub:metruzanca/ssg)
- [ ] Create usage examples and guides for common workflows
- [ ] Document configuration options with examples
- [ ] Add troubleshooting section for common issues
- [ ] Create migration guides if needed (from other static site generators)
- [ ] Build documentation site using SSG itself

### Testing

**Context**: Reliable software requires comprehensive testing. We need unit tests for core functionality, integration tests for end-to-end workflows, and performance tests for large sites.

- [ ] Setup unit test framework (Bun test) with mocking
- [ ] Create integration test suite for complete build workflows
- [ ] Test with various content structures and edge cases
- [ ] Performance testing with large sites (1000+ pages)
- [ ] Cross-platform compatibility testing (Windows, macOS, Linux)
- [ ] Setup automated testing in CI/CD pipeline

### Self-hosting (SSG for SSG docs)

**Context**: Dogfooding our own tool ensures it meets real-world needs. Building SSG's documentation with SSG validates the core workflow and provides a reference implementation.

- [ ] Create documentation structure in docs/ directory
- [ ] Setup SSG to build its own documentation with proper configuration
- [ ] Configure GitHub Pages deployment for docs site
- [ ] Test documentation generation and deployment workflow
- [ ] Setup CI/CD for documentation updates on main branch
- [ ] Use docs site as reference for best practices

## Technical Debt & Optimization

### Performance

**Context**: Build performance affects developer experience, especially for large sites. We need to profile bottlenecks, optimize memory usage, and implement parallel processing where beneficial.

- [ ] Profile build times for large sites (1000+ pages) with detailed metrics
- [ ] Optimize memory usage during builds by processing in streams
- [ ] Implement parallel processing for independent tasks (image processing, file scanning)
- [ ] Optimize asset bundling and minification for smaller output
- [ ] Review and optimize search index generation for faster builds
- [ ] Add build performance metrics and reporting

### Code Quality

**Context**: Maintainable code requires consistent quality standards. TypeScript strict compliance, comprehensive error handling, and proper documentation are essential for long-term sustainability.

- [ ] Ensure TypeScript strict compliance with no any types
- [ ] Add comprehensive error handling with user-friendly messages
- [ ] Implement proper logging system with different verbosity levels
- [ ] Add code documentation and comments for complex logic
- [ ] Setup code formatting and linting with automated enforcement
- [ ] Add type guards and runtime validation for external inputs

### Deployment

**Context**: Easy installation and deployment are crucial for adoption. We need to test various installation methods and ensure cross-platform compatibility.

- [ ] Test CLI installation from GitHub (bun add github:metruzanca/ssg)
- [ ] Verify cross-platform compatibility (Windows, macOS, Linux)
- [ ] Test with various Node.js versions (current LTS and previous)
- [ ] Create release process documentation with versioning strategy
- [ ] Setup automated testing pipeline with GitHub Actions
- [ ] Create package publishing workflow for future npm publishing

## Future Considerations (Post v0)

### MDX Support

**Context**: MDX enables rich interactive components within markdown. This requires careful integration with Astro's content collections and a component system design.

- [ ] Research MDX integration requirements with Astro content collections
- [ ] Plan MDX component system architecture (islands vs hydration)
- [ ] Design MDX workflow integration with build process
- [ ] Consider React/Preact component support with proper bundling
- [ ] Evaluate MDX parser options and security considerations

### Plugin System

**Context**: While SSG is opinionated, some users may need custom functionality. A plugin system could allow extending core functionality without compromising the opinionated nature.

- [ ] Design plugin architecture with clear boundaries and API contracts
- [ ] Create plugin API specification with hooks for different build phases
- [ ] Implement plugin loading system with validation and security
- [ ] Document plugin development guide with examples
- [ ] Consider plugin marketplace or registry for community contributions

### Embeds and Transclusion

**Context**: Embedding other pages statically within content enables wiki-style knowledge bases. This requires careful handling of recursive embeds and proper link attribution.

- [ ] Implement page transclusion syntax detection in markdown
- [ ] Create static page embedding during build (with link to original)
- [ ] Handle recursive transclusion with depth limits
- [ ] Style embedded content distinctly from inline content
- [ ] Add transclusion caching to avoid duplicate processing

### Advanced Features

**Context**: Future features could enhance the static site experience with modern web capabilities. These should be carefully evaluated against the core mission of simplicity and convention.

- [ ] Consider multi-language support with i18n routing
- [ ] Plan for theme customization while maintaining opinionated defaults
- [ ] Research advanced SEO features (structured data, social cards)
- [ ] Consider API endpoint generation for dynamic content
- [ ] Evaluate Web Components for enhanced interactive features
- [ ] Investigate edge deployment options for improved performance