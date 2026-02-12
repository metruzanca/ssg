#!/usr/bin/env node
import { readFile, writeFile } from 'node:fs/promises'

const content = await readFile('dist/index.js', 'utf-8')

// Remove duplicate exports
const fixed = content.replace(
  /export\s*{\s*devServer,\s*buildSite\s*};\s*export\s*{\s*__toESM,\s*__commonJS,\s*__require,\s*buildSite,\s*devServer\s*};/,
  'export { __toESM, __commonJS, __require, buildSite, devServer };'
)

if (content !== fixed) {
  await writeFile('dist/index.js', fixed, 'utf-8')
  console.log('✅ Fixed duplicate exports in dist/index.js')
} else {
  console.log('ℹ️  No duplicate exports found')
}
