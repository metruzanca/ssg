# ssg

SSG is my personal static site generator. Used to build my new version of my personal website. Its heavily opinionated. Convention over configuration. SSG ships as a CLI and is used in a separate repository holding all my content.

## Basic usage

Run `ssg` without arguments, expects a directory tree of mostly markdown files and media assets. (Akin to what you'd find in a github repo with multiple readme files e.g. https://github.com/metruzanca/metruzanca)

- ssg will expect a readme.md in every directory, if one is not present it will fallback to rendering a list of all `pages` in the repo.
- it will then render all pages recursively.
- while rendering pages it will collect links at the end it will make sure all internal links link to a valid page.

## Rendering a page

All content should be rendered in a progressive enhancement way where if the user disables javascript the site is still usable and all links work as expected. Any content using JavaScript for interactivity must be rendered statically and hydrated.

Each page is a markdown file, so rendering it should be fairly simple and straightforward with some additions:

- code blocks rendered with shiki or similar.
- hovering internal links shows a small preview of the page.

A rendered page's filename will always be normalized to be lowercase alphanumeric, separated by dashes.

## Navigation

Navigation with JavaScript disabled, should still work and ideally use view transitions api for when available.

Navigating with JavaScript enabled should enhance the experience, perfecting content eagerly to make clicking internal links instant.

## Fulltext search

ssg should create a static full-text search index to allow quick navigation.

## Image processing

ssg should preprocess images creating lower resolution versions in formats like webp or heic. Ffmpeg is a reasonable dependency for this.

## Embeds and Transclusion

Markdown link embeds (`![text](link) `) with media file paths will of course be embedded into the page, however if the file is another page, that page should be embedded statically into the current page. (With a link to the original of course)

## RSS

RSS should be generated for all pages of the site. (Might require making ssg aware of the final domain name of the site.)

## Frontmatter

| Tag           | Value        | Derscription                                                                       |
| ------------- | ------------ | ---------------------------------------------------------------------------------- |
| tags          | string array | Tags used for searching but also SEO categories                                    |
| title         | string       | The page's document title                                                          |
| publish       | boolean      | Unless set, the page will not be rendered.                                         |
| description   | string       | SEO description and social preview                                                 |
| canonical_url | string       | Initial url the the page was published as. Useful if you want to create redirects. |
| timestamp     | string       | When the post was published.                                                       |

## Configuration

This is an opinionated tool. With good defaults and convention over configuration.

There are undoubtedly going to be some things that need configuration however.

Ideally if possible, the site index's Frontmatter should be used for basic configuration. Alternatively, a flat `toml` of absolutely needed.

---

## Optional features

All these options can be passed as flags or via the config file with flags taking priority.

### Convention Enforcement

ssg with the `--write` flag will do a few extra things.

- Firstly all markdown will be formatted closely to how it renders and best practices. This should help reduce noise in gif diffs.
- If a file name isn't following conventions, it will be changed. If a `title` in the Frontmatter doesn't exist, the original title will be preserved here to be used for the page name.

### Obsidian style

If the `--obsidian` flag is set, file titles and frontmatter titles will be swapped. This is to allow obsidian full text search to work properly and as expected.
