/**
 * Check that the desktop profile is wired to THIS plugin directory, and that
 * the package the platform will load actually satisfies the two contracts DSH
 * validates at startup.
 *
 * Why a checker instead of a sync script: `dsh plugin add <abs path>` installs a
 * local directory as `link:`, so DSH loads the working copy directly and a host
 * edit needs only a restart. The old `sync-profile.mjs` existed because the
 * previous install flow used a `file:` dependency, which pnpm materializes as a
 * COPY that had to be re-synced after every edit — a step that no longer exists
 * and whose absence used to look like "my change did nothing". What still goes
 * wrong is subtler and silent, so this script asserts it out loud:
 *
 *   1. the profile manifest depends on this package, and how;
 *   2. the resolved package dir is a real directory with the entry points;
 *   3. `dsh.bundle.patch` resolves (the bundle-composition contract);
 *   4. `dsh.client.platform === 'web'` and `exports["./client"]` resolves to a
 *      file (the client-module contract — a package that declares `dsh.client`
 *      without a `./client` bundle fails the startup scan, and a missing built
 *      bundle fails activation);
 *   5. the row id in the patch equals the entry id the browser card binds to.
 *
 * Usage:
 *   node check-profile.mjs
 *   node check-profile.mjs --profile <profile dir>
 *   node check-profile.mjs --repair     # copy-based install: drop the copy and re-install
 */

import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync, statSync } from 'node:fs'
import { createRequire } from 'node:module'
import { join, resolve, dirname } from 'node:path'

const PACKAGE_NAME = '@local/dsh-tool-imagegen'
/** Entry id the client bundle binds its settings form to. */
const ENTRY_ID = 'dsh-imagegen'
/** Profile dir the plugin is installed into by default. */
const DEFAULT_PROFILE = join(process.env.DSH_HOME ?? join(process.env.USERPROFILE ?? '', '.dsh'), 'profiles', 'desktop')

const flagAt = process.argv.indexOf('--profile')
const profileArg = flagAt >= 0 ? process.argv[flagAt + 1] : undefined
const PROFILE = resolve(profileArg ?? DEFAULT_PROFILE)
const HERE = resolve(import.meta.dirname)
const REPAIR = process.argv.includes('--repair')

let failures = 0
const ok = (label, detail) => console.log(`  ok  ${label}${detail === undefined ? '' : ` — ${detail}`}`)
const bad = (label, detail) => { failures += 1; console.log(`FAIL  ${label}${detail === undefined ? '' : ` — ${detail}`}`) }
const say = (label, detail) => console.log(`      ${label}${detail === undefined ? '' : ` — ${detail}`}`)

console.log(`profile : ${PROFILE}`)
console.log(`plugin  : ${HERE}\n`)

const manifestPath = join(PROFILE, 'package.json')
if (!existsSync(manifestPath)) {
  bad('profile manifest exists', `${manifestPath} not found — open DSH Desktop once to initialize the profile`)
  process.exit(1)
}
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
const spec = manifest.dependencies?.[PACKAGE_NAME]

console.log('profile wiring:')
if (spec === undefined) {
  bad(`${PACKAGE_NAME} is a profile dependency`, 'install it: Plugins page → Add plugin → this directory')
  process.exit(1)
}
ok(`${PACKAGE_NAME} is a profile dependency`, spec)

const linked = typeof spec === 'string' && spec.startsWith('link:')
if (linked) {
  const target = resolve(PROFILE, spec.slice('link:'.length))
  const sameDir = target.toLowerCase() === HERE.toLowerCase()
  if (sameDir) ok('the dependency points at THIS directory (edits need only a restart)')
  else bad('the dependency points elsewhere', `${target} — not ${HERE}`)
} else {
  bad('the dependency is a copy, not a link', 'edits to this directory reach DSH only after a re-install')
  say('fix', 're-run: Plugins page → Add plugin → this directory (pnpm records it as link:)')
}

const bundles = manifest.dsh?.profile?.bundles ?? []
if (bundles.includes(PACKAGE_NAME)) ok('the package is an active profile bundle')
else bad('the package is an active profile bundle', `bundles: ${bundles.join(', ') || '(none)'}`)

// --- resolve what the platform will actually load ---------------------------

console.log('\npackage contracts:')
const require = createRequire(join(PROFILE, 'package.json'))
let pkgDir
let pkgJsonPath
try {
  pkgJsonPath = resolve(require.resolve(`${PACKAGE_NAME}/package.json`))
  pkgDir = dirname(pkgJsonPath)
} catch (error) {
  bad('the package resolves from the profile', String(error.message))
  process.exit(1)
}
const pkg = JSON.parse(readFileSync(pkgJsonPath, 'utf8'))
ok('package.json resolves', pkgJsonPath)
if (!linked) say('note', 'this is the COPY the platform loads, not your working tree')

const clientRel = typeof pkg.exports?.['./client'] === 'string'
  ? pkg.exports['./client']
  : pkg.exports?.['./client']?.default
if (typeof pkg.dsh?.client?.platform !== 'string') {
  bad('declares dsh.client.platform (client-modules rejects a non-string)')
} else if (pkg.dsh.client.platform !== 'web') {
  bad('dsh.client.platform is "web"', `got ${JSON.stringify(pkg.dsh.client.platform)} — the package is treated as having no client half`)
} else if (typeof clientRel !== 'string') {
  bad('exports a "./client" bundle (declaring dsh.client without one aborts the startup scan)')
} else {
  const clientPath = join(pkgDir, clientRel)
  if (existsSync(clientPath)) ok('exports a built "./client" bundle', clientPath)
  else bad('exports a built "./client" bundle', `${clientPath} does not exist — run: node build-client.mjs`)
}

const registered = (() => {
  try {
    const text = readFileSync(join(pkgDir, clientRel ?? 'lib/client.js'), 'utf8')
    return text.includes(`id: ${JSON.stringify(pkg.name)}`) || text.includes(`id: "${pkg.name}/client"`)
  } catch { return false }
})()
if (registered) ok('the bundle registers under the package name (module id == graph row id)')
else bad('the bundle registers under the package name', 'the bundle id must equal package.json name, else the module system rejects it')

const patchRel = pkg.dsh?.bundle?.patch
const patchPath = typeof patchRel === 'string' ? join(pkgDir, patchRel) : undefined
if (patchPath !== undefined && existsSync(patchPath)) {
  ok('declares a bundle patch that exists', patchPath)
  const patch = readFileSync(patchPath, 'utf8')
  if (new RegExp(`id:\\s*${ENTRY_ID}\\b`).test(patch)) {
    ok(`the patch registers the row id the client card binds to`, ENTRY_ID)
  } else {
    bad('the patch row id matches the client ENTRY_ID', `${ENTRY_ID} not found in ${patchPath}`)
  }
} else {
  bad('declares a bundle patch that exists', String(patchPath))
}

for (const entry of ['lib/index.js', 'lib/client.js']) {
  const path = join(pkgDir, entry)
  if (existsSync(path) && statSync(path).isFile()) ok(`${entry} present`)
  else bad(`${entry} present`, path)
}

// --- repair a copy-based install -------------------------------------------

if (REPAIR) {
  if (linked) {
    console.log('\n--repair: nothing to do, the install is already a link.')
  } else {
    console.log('\n--repair: removing the copy and re-installing as a link…')
    const node = process.execPath
    const pnpm = process.env.DSH_DESKTOP_PNPM
    if (pnpm === undefined) {
      bad('repair needs the DSH-bundled pnpm', 'set DSH_DESKTOP_PNPM to <runtime>/pnpm/bin/pnpm.mjs, or re-add the plugin from the Plugins page')
    } else {
      const run = spawnSync(node, ['--expose-internals', pnpm, 'add', HERE], { cwd: PROFILE, stdio: 'inherit' })
      if (run.status === 0) ok('re-installed')
      else bad('re-install failed', `pnpm exited ${String(run.status)}`)
    }
  }
}

console.log('')
if (failures > 0) {
  console.error(`PROFILE CHECK FAILED: ${failures} problem(s)`)
  process.exit(1)
}
console.log('PROFILE CHECK PASSED')
