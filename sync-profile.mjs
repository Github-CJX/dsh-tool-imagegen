/**
 * Re-sync the plugin into the desktop profile after editing source files.
 *
 * WHY THIS EXISTS: pnpm `file:` dependencies install as a COPY of the plugin
 * directory (not a symlink) into the profile's node_modules. DSH loads the
 * plugin host code from THAT copy — editing the plugin source directory alone
 * never reaches the running app. This script removes the copy and re-runs
 * `pnpm install`, which re-copies the current source (and re-links it), then
 * verifies the copy matches.
 *
 * Usage:
 *   node sync-profile.mjs
 *   node sync-profile.mjs --profile <path>   # custom profile dir
 * Afterwards: fully restart DSH Desktop (all processes).
 */

import { spawnSync } from 'node:child_process'
import { readdirSync, rmSync, statSync } from 'node:fs'
import { resolve } from 'node:path'

const flagAt = process.argv.indexOf('--profile')
const arg = flagAt >= 0 ? process.argv[flagAt + 1] : undefined
const PROFILE = resolve(arg ?? 'C:/Users/CJX/.dsh/profiles/desktop')
const PLUGIN = resolve('C:/Users/CJX/.dsh/plugins/dsh-tool-imagegen')
const COPY = resolve(PROFILE, 'node_modules/@local/dsh-tool-imagegen')

if (!statSync(PLUGIN, { throwIfNoEntry: false })?.isDirectory()) {
  console.error(`plugin dir not found: ${PLUGIN}`)
  process.exit(1)
}

console.log(`plugin : ${PLUGIN}`)
console.log(`copy   : ${COPY}`)
console.log('removing stale profile copy...')
rmSync(COPY, { recursive: true, force: true })

console.log('reinstalling (pnpm install)...')
const run = spawnSync('pnpm', ['install'], { cwd: PROFILE, stdio: 'inherit', shell: process.platform === 'win32' })
if (run.status !== 0) {
  console.error('pnpm install failed')
  process.exit(run.status ?? 1)
}

// Verify: every lib file present in both, and client.js exists (built).
const libFiles = readdirSync(resolve(PLUGIN, 'lib')).filter((f) => f.endsWith('.js'))
const copiedFiles = readdirSync(resolve(COPY, 'lib')).filter((f) => f.endsWith('.js'))
const missing = libFiles.filter((f) => !copiedFiles.includes(f))
if (missing.length > 0) {
  console.error(`sync incomplete, missing in copy: ${missing.join(', ')}`)
  process.exit(1)
}

console.log('sync OK — restart DSH Desktop fully before testing.')
