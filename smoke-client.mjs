/**
 * Smoke test for the built client bundle (lib/client.js).
 *
 * Simulates the dsh client-modules loader: installs `window.__ModuleLoader__`,
 * evaluates the bundle, captures its factory, and runs it with stub externals
 * (react, react/jsx-runtime, dsh-client-runtime/client). Asserts:
 *   - the bundle registers id "@local/dsh-tool-imagegen" via __ModuleLoader__.load
 *   - the factory exports { apply, inject } (inject a string array)
 *   - apply() runs without throwing against a stubbed client ctx, and
 *     registers both the settings card and the generate_image toolview
 *   - react is required, not bundled inline
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = dirname(fileURLToPath(import.meta.url))
const bundlePath = resolve(ROOT, 'lib/client.js')
const source = readFileSync(bundlePath, 'utf8')

// --- loader simulation -------------------------------------------------------

let captured = null
globalThis.window = {
  __ModuleLoader__: {
    load(registration) {
      captured = registration
    },
  },
}

// --- externals ---------------------------------------------------------------

function snapshotStore(initial) {
  let value = initial
  const listeners = new Set()
  return {
    getSnapshot: () => value,
    set(next) { value = next; for (const l of [...listeners]) l() },
    update(mutate) { mutate(value); for (const l of [...listeners]) l() },
    subscribe(listener) { listeners.add(listener); return () => listeners.delete(listener) },
  }
}

const externals = {
  'react': { useState: () => {}, useEffect: () => {}, useCallback: () => {} },
  'react/jsx-runtime': { jsx: () => {}, jsxs: () => {}, Fragment: Symbol('Fragment'), jsxDEV: () => {} },
  '@deepseek-ai/dsh-client-runtime/client': { createSnapshotStore: snapshotStore },
}

const require = (spec) => {
  const mod = externals[spec]
  if (mod === undefined) throw new Error(`smoke: unexpected external require("${spec}")`)
  return mod
}

// --- evaluate ----------------------------------------------------------------

// The bundle references `window` at eval time (top-level load call).
const moduleSrc = `
(function () {
  ${source}
})()
`
const moduleFn = new Function('window', 'require', moduleSrc)
moduleFn(globalThis.window, require)

// --- assertions --------------------------------------------------------------

let failures = 0
const check = (label, ok) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}`) }
}

console.log('contract:')
check('bundle called __ModuleLoader__.load once with id', captured !== null && captured.id === '@local/dsh-tool-imagegen')
check('registration carries a factory function', captured !== null && typeof captured.factory === 'function')

const factory = captured.factory
let exports
try {
  exports = factory(require)
} catch (error) {
  failures += 1
  console.log(`FAIL  factory threw: ${error instanceof Error ? error.stack : String(error)}`)
}
check('factory returned an object', typeof exports === 'object' && exports !== null)
check('exports.apply is a function', typeof exports?.apply === 'function')
check('exports.inject is a string array', Array.isArray(exports?.inject) && exports.inject.every((s) => typeof s === 'string'))
check('inject waits on slots/locale/connection', ['slots', 'locale', 'connection'].every((s) => exports?.inject.includes(s)))

// --- run apply() against a stubbed ctx --------------------------------------

const registrations = []
const ctx = {
  effect(fn) { fn() },
  locale: { register() {} },
  get(name) {
    if (name === 'connection') return { isLoopback: true }
    return undefined
  },
  on() { return () => {} },
  slots: {
    inject(_slot, register) { register() },
    register(opts, component) { registrations.push({ ...opts, component }); return () => {} },
  },
}
const originalWarn = console.warn
const warnings = []
console.warn = (...args) => { warnings.push(args.join(' ')) }
try {
  exports.apply(ctx)
  console.log('\napply:')
  check('apply() ran without throwing', true)
  check('no console.warn from apply (no registration failures)', warnings.length === 0)
  const card = registrations.find((r) => r.name === 'settings.plugin.item')
  const toolview = registrations.find((r) => r.name === 'tool.call.toolview')
  check('settings.plugin.item card registered', card !== undefined)
  check('settings card locale is dsh-imagegen', card?.locale === 'dsh-imagegen')
  check('tool.call.toolview registered keyed by generate_image', toolview !== undefined && toolview.key === 'generate_image')
  check('toolview inject returns a loadImage face', typeof toolview?.inject?.()?.loadImage === 'function')
  const bridge = toolview?.inject?.('session-1')?.loadImage?.({ attachmentId: 'att-42' })
  check('loadImage returns a thenable bridge URL', typeof bridge?.then === 'function')
  check('bridge URL carries session and id', source.includes('dsh-tool-imagegen/attachment') && source.includes('encodeURIComponent(attachment.attachmentId)'))
} catch (error) {
  failures += 1
  console.log(`FAIL  apply threw: ${error instanceof Error ? error.stack : String(error)}`)
} finally {
  console.warn = originalWarn
}

// --- inline checks -----------------------------------------------------------

console.log('\nbundle shape:')
check('react is external (required, not bundled)', /\n\s*let react = require\("react"\);/.test(source))
check('no inlined react createElement implementation', !/\bcreateElement:\s*function/.test(source))
check('no NUL-byte virtual ids leak into the bundle', !source.includes('\u0000'))
check('style-injection guard present (document-safe)', source.includes('typeof document !== "undefined"'))

console.log('')
if (failures > 0) {
  console.error(`SMOKE FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('SMOKE PASSED')
