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
  'react': { useState: () => {}, useEffect: () => {}, useCallback: () => {}, useSyncExternalStore: () => undefined, memo: (fn) => fn },
  'react/jsx-runtime': { jsx: () => {}, jsxs: () => {}, Fragment: Symbol('Fragment'), jsxDEV: () => {} },
  '@deepseek-ai/dsh-client-runtime/client': { createSnapshotStore: snapshotStore },
  // Only imported at component-render time (never rendered in the smoke run);
  // the specifiers must simply resolve.
  '@deepseek-ai/dsh-client-ui-attachment': { ImageGallery: () => null },
  '@deepseek-ai/dsh-client-ui-primitives': {
    IconCheckOutline16: () => null,
    IconCopyOutline16: () => null,
    JsonBlock: () => null,
    MessageText: () => null,
    Tooltip: ({ children }) => children,
    writeClipboard: async () => true,
  },
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
check('inject waits on slots/locale/connection/conversation', ['slots', 'locale', 'connection', 'conversation'].every((s) => exports?.inject.includes(s)))

// --- run apply() against a stubbed ctx --------------------------------------

const registrations = []
let wrappedSend = null
const conversationStub = {
  async sendSession(session, text, imageIds, mode) {
    conversationStub.calls.push({ session, text, imageIds, mode })
    return { ok: true }
  },
  calls: [],
}
const ctx = {
  effect(fn) { fn() },
  locale: { register() {} },
  get(name) {
    if (name === 'connection') return { isLoopback: true }
    if (name === 'conversation') return conversationStub
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
  const cards = registrations.filter((r) => r.name === 'settings.plugin.item')
  const card = cards.find((r) => r.id === 'imagegen')
  const maintenance = cards.find((r) => r.id === 'imagegen-maintenance')
  const toolview = registrations.find((r) => r.name === 'tool.call.toolview')
  const upload = registrations.find((r) => r.name === 'conversation.input.left')
  const bubble = registrations.find((r) => r.name === 'conversation.chat.node')
  check('settings.plugin.item card registered', card !== undefined)
  check('settings card locale is dsh-imagegen', card?.locale === 'dsh-imagegen')
  check('maintenance settings card registered', maintenance !== undefined && maintenance.locale === 'dsh-imagegen')
  check('maintenance card inject returns a fetchFn', typeof maintenance?.inject?.()?.fetchFn === 'function')
  check('tool.call.toolview registered keyed by generate_image', toolview !== undefined && toolview.key === 'generate_image')
  check('toolview inject returns a loadImage face', typeof toolview?.inject?.()?.loadImage === 'function')
  const toolFace = toolview?.inject?.('session-1')
  const bridge = toolFace?.loadImage?.({ attachmentId: 'att-42' })
  check('loadImage returns a thenable bridge URL', typeof bridge?.then === 'function')
  check('bridge URL carries session and id', source.includes('dsh-tool-imagegen/attachment') && source.includes('encodeURIComponent(attachment.attachmentId)'))
  check('toolview face carries openLocally', typeof toolFace?.openLocally === 'function')
  check('openLocally posts to the local-open bridge', source.includes('dsh-tool-imagegen/open'))
  check('toolview face carries stageEdit (modify button)', typeof toolFace?.stageEdit === 'function')
  check('stageEdit readiness copy is in the bundle', source.includes('已加入待发送'))
  check('conversation.input.left upload button registered', upload !== undefined && upload.id === 'imagegen-upload')
  check('upload button locale is dsh-imagegen', upload?.locale === 'dsh-imagegen')
  const uploadFace = upload?.inject?.()
  check('upload inject returns fetchFn + connection', typeof uploadFace?.fetchFn === 'function' && uploadFace?.connection?.isLoopback === true)
  check('conversation.sendSession was wrapped (instance method patched)', typeof conversationStub.sendSession === 'function' && conversationStub.calls.length === 0)
  wrappedSend = conversationStub.sendSession
  check('conversation.chat.node user shadow at priority -1', bubble !== undefined && bubble.key === 'user' && bubble.priority === -1)
  check('user shadow locale is dsh-imagegen', bubble?.locale === 'dsh-imagegen')
  // The sendSession wrapper must be a pass-through without a pending draft:
  // the drafts-less branch executes synchronously, so the forward (recorded
  // on the stub) is observable right after the call.
  const before = conversationStub.calls.length
  const resultPromise = wrappedSend({ sessionId: 'session-no-draft' }, 'hello', [], 'queue')
  check('sendSession wrapper forwards drafts-less sends', typeof resultPromise?.then === 'function' && conversationStub.calls.length === before + 1)
  const forwarded = conversationStub.calls[conversationStub.calls.length - 1]
  check('forwarded call preserves args', forwarded?.session?.sessionId === 'session-no-draft' && forwarded?.text === 'hello' && forwarded?.mode === 'queue')
  check('sendSession wrapper carries upload-bridge interception (pending draft path)', source.includes('dsh-tool-imagegen/upload'))
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
