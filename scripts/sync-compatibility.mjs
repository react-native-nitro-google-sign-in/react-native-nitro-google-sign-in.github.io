#!/usr/bin/env node
/**
 * Copy compatibility.json from the package repo into docs/ before build.
 *
 * Monorepo (submodule): node docs/scripts/sync-compatibility.mjs
 * Docs-only clone: PACKAGE_REPO_ROOT=/path/to/google-signin node scripts/sync-compatibility.mjs
 */
import { copyFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const docsRoot = join(dirname(fileURLToPath(import.meta.url)), '..')
const packageRoot = process.env.PACKAGE_REPO_ROOT ?? join(docsRoot, '..')
const src = join(packageRoot, 'compatibility.json')
const dest = join(docsRoot, 'compatibility.json')

if (!existsSync(src)) {
  if (existsSync(dest)) {
    console.log('sync-compatibility: using existing docs/compatibility.json')
    process.exit(0)
  }
  console.error(
    `sync-compatibility: missing ${src}\n` +
      'Set PACKAGE_REPO_ROOT to the google-signin repo when working in a docs-only clone.',
  )
  process.exit(1)
}

copyFileSync(src, dest)
console.log('sync-compatibility: compatibility.json → docs/compatibility.json')
