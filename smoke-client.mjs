/**
 * Smoke test for the built client bundle (lib/client.js).
 *
 * Simulates the dsh client-modules loader: installs `window.__ModuleLoader__`,
 * evaluates the bundle, captures its factory, and runs it with stub externals
 * (react, react/jsx-runtime, dsh-client-store, dsh-client-ui-primitives) and a
 * stubbed client ctx. Asserts:
 *   - the bundle registers id "@local/dsh-tool-imagegen" via __ModuleLoader__.load
 *   - the factory exports { apply, inject } (inject a string array)
 *   - apply() runs without throwing, and registers the settings card into the
 *     Plugins page's `plugins.item` list slot, gated by configForms.whileServed
 *   - the card honours the slot's `view: 'summary' | 'page'` owner contract
 *   - the generate_image toolview and the shadowed user bubble still register
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
  'react': {
    useState: (initial) => [initial, () => {}],
    useEffect: () => {},
    useCallback: (fn) => fn,
    useMemo: (fn) => fn(),
    useRef: () => ({ current: null }),
    useLayoutEffect: () => {},
    useSyncExternalStore: () => undefined,
    memo: (fn) => fn,
  },
  'react/jsx-runtime': {
    jsx: (type, props) => ({ type, props }),
    jsxs: (type, props) => ({ type, props }),
    Fragment: Symbol('Fragment'),
    jsxDEV: (type, props) => ({ type, props }),
  },
  '@deepseek-ai/dsh-client-store': { createSnapshotStore: snapshotStore },
  // The fullscreen viewers portal into document.body; the platform serves
  // react-dom the same way it serves react.
  'react-dom': { createPortal: (node) => node },
  // Only touched at component-render time; the current-build names are supplied
  // so the bubble's defensive lookups resolve to real components.
  '@deepseek-ai/dsh-client-ui-primitives': {
    IconCheckOutlineRegular: () => null,
    IconCopyOutlineRegular: () => null,
    JsonBlock: () => null,
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
const check = (label, ok, detail) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}${detail === undefined ? '' : ` — ${detail}`}`) }
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
check(
  'inject waits on slots/locale/connection/conversation/configForms',
  ['slots', 'locale', 'connection', 'conversation', 'configForms'].every((s) => exports?.inject.includes(s)),
)

// --- run apply() against a stubbed ctx --------------------------------------

const ENTRY_ID = 'dsh-imagegen'
const registrations = []
const whileServedCalls = []

/** The scope snapshot the stubbed configForms service answers with. */
const scopeSnapshot = {
  status: 'ready',
  value: { enabled: true, apiUrl: 'https://api.example/v1', model: 'gpt-image-2' },
  base: {},
  user: { enabled: true },
  revision: 7,
  writable: true,
  mode: 'host',
}

const namespaceRow = {
  ns: ENTRY_ID,
  value: scopeSnapshot.value,
  base: scopeSnapshot.base,
  user: scopeSnapshot.user,
  revision: scopeSnapshot.revision,
  secrets: [{ path: ['apiKey'], set: true }],
}

const mirror = {
  getSnapshot: () => ({ status: 'ready', view: { writable: true, namespaces: [namespaceRow] } }),
  subscribe: () => () => {},
  load: async () => {},
  namespace: (ns) => (ns === ENTRY_ID ? namespaceRow : undefined),
}

const writes = []
const configForms = {
  get: (entryId) => {
    if (entryId !== ENTRY_ID) throw new Error(`smoke: configForms.get("${entryId}") — unexpected entry id`)
    return {
      getSnapshot: () => scopeSnapshot,
      subscribe: () => () => {},
      set: async (field, value) => { writes.push({ field, value }); return true },
      unset: async (field) => { writes.push({ field, value: undefined }); return true },
    }
  },
  describe: () => mirror,
  whileServed: (namespaces, register) => {
    whileServedCalls.push([...namespaces])
    // The real service registers only while the Host serves the namespace.
    for (const ns of namespaces) {
      if (ns === ENTRY_ID) { register(new Set(namespaces)); break }
    }
    return () => {}
  },
}

const conversationStub = {
  async sendSession(session, text, attachmentIds, mode, signal) {
    conversationStub.calls.push({ session, text, attachmentIds, mode, signal })
    return { kind: 'success' }
  },
  calls: [],
}

// The conversation event registry: captures the Turn Definitions the plugin
// registers, so the fold can be driven directly with synthetic events.
const definitions = []
const uiConversation = {
  events: {
    register(definition) { definitions.push(definition); return () => {} },
  },
}

const ctx = {
  effect(fn) { const dispose = fn(); return typeof dispose === 'function' ? dispose : () => {} },
  locale: {
    register() {},
    bind: () => (key) => `t:${key}`,
  },
  get(name) {
    if (name === 'connection') return { isLoopback: true }
    if (name === 'conversation') return conversationStub
    if (name === 'configForms') return configForms
    if (name === 'uiConversation') return uiConversation
    return undefined
  },
  on() { return () => {} },
  slots: {
    inject(_slot, register) { register() },
    register(opts, component) { registrations.push({ ...opts, component }); return () => {} },
  },
}

/** Map an injected face's `hooks` onto the `useXxx` props the renderer supplies. */
function propsOf(view, face) {
  const props = { view, t: (key) => `t:${key}`, ...face }
  for (const [name, store] of Object.entries(face.hooks ?? {})) {
    const hook = `use${name[0].toUpperCase()}${name.slice(1)}`
    props[hook] = (selector) => selector(store.getSnapshot())
  }
  return props
}

const originalWarn = console.warn
const warnings = []
console.warn = (...args) => { warnings.push(args.join(' ')) }
try {
  exports.apply(ctx)
  console.log('\napply:')
  check('apply() ran without throwing', true)
  check('no console.warn from apply (no registration failures)', warnings.length === 0, warnings.join(' | '))

  const cards = registrations.filter((r) => r.name === 'plugins.item')
  const card = cards.find((r) => r.id === ENTRY_ID)
  const toolview = registrations.find((r) => r.name === 'tool.call.toolview')
  const bubble = registrations.find((r) => r.name === 'conversation.chat.node')

  check('plugins.item card registered with the entry id', card !== undefined, `ids: ${cards.map((c) => c.id).join(', ')}`)
  check('exactly one settings card (one entry per list id)', cards.length === 1)
  check('settings card carries a label thunk', typeof card?.label === 'function' && card.label() === 't:cardTitle')
  check('settings card locale is dsh-imagegen', card?.locale === 'dsh-imagegen')
  check('settings card registration is gated by whileServed([dsh-imagegen])',
    whileServedCalls.length === 1 && whileServedCalls[0].length === 1 && whileServedCalls[0][0] === ENTRY_ID)

  const face = card?.inject?.()
  check('settings card inject carries maintenance fetchFn (storage section)', typeof face?.maintenance?.fetchFn === 'function')
  check('settings card inject carries the form actions', typeof face?.edit === 'function' && typeof face?.save === 'function')
  check('settings card inject carries its snapshot hooks', face?.hooks?.imageGenSettingsCard !== undefined && face?.hooks?.imageGenKeySet !== undefined)
  check('key-set hook reports a stored apiKey (read from the mirror secrets sidecar)',
    typeof face?.hooks?.imageGenKeySet?.getSnapshot === 'function' && face.hooks.imageGenKeySet.getSnapshot() === true)

  // The slot's owner contract: the page renders the entry once as the card's
  // one-liner and once as the page body. Returning the form for the summary
  // would nest the whole card inside its own list row, so this is asserted by
  // actually calling the component through its injected face.
  const cardProps = propsOf('summary', face)
  const summary = card.component(cardProps)
  check('card renders the one-liner for view: "summary"', summary === 't:cardDescription', `got ${JSON.stringify(summary)}`)
  const page = card.component({ ...propsOf('page', face) })
  check('card renders a form for view: "page"', page !== null && page !== undefined && page !== 't:cardDescription')
  check('page exposes save/discard through the injected actions', cardProps.save !== undefined && cardProps.discard !== undefined)

  check('tool.call.toolview registered keyed by generate_image', toolview !== undefined && toolview.key === 'generate_image')
  const toolFace = toolview?.inject?.('session-1')
  // The pictures are the platform's own `image` blocks, so the view resolves
  // them through the OWNER's session-authorized `loadImage`. Injecting a face
  // field of that name would be shadowed by the owner prop (spread last) and
  // silently redirect every image through the plugin — so the face must not
  // declare it, and must not ship image bytes itself.
  check('toolview face does not shadow the owner loadImage prop', toolFace?.loadImage === undefined)
  check('toolview face carries openLocally', typeof toolFace?.openLocally === 'function')
  check('openLocally posts to the local-open bridge', source.includes('dsh-tool-imagegen/open'))
  check('toolview face carries stageEdit (modify button)', typeof toolFace?.stageEdit === 'function')
  check('toolview face carries the manifest fallbacks (loadImagesMeta + loadEditBytes)',
    typeof toolFace?.loadImagesMeta === 'function' && typeof toolFace?.loadEditBytes === 'function')
  check('the manifest route replaces the retired byte bridge',
    source.includes('dsh-tool-imagegen/images') && !source.includes('dsh-tool-imagegen/attachment'))
  // Fullscreen viewer: portaled to document.body. An in-place `position: fixed`
  // overlay can be trapped by an ancestor's containing/stacking block (the
  // transcript's process disclosure + scroll container), which is why the
  // 全屏查看 button appeared to do nothing.
  check('the fullscreen viewer portals into document.body',
    source.includes('createPortal') && source.includes('react-dom'))

  // --- Turn-level card (the picture must survive the collapsed tool group) ---
  //
  // The default compact transcript folds a closed Turn's tool calls into a
  // collapsible process group, so a picture rendered only inside the tool card
  // disappears from the reading flow. The shipped answer is a Turn Definition
  // (ctx.uiConversation.events) plus ui-chat's `conversation.chat.turnTail`
  // list seat, which renders beneath the closing prose and outside that group
  // — the same two registrations ui-schedule's `schedule_create` card and
  // ui-deliverables' changed-files card use.
  const turnTail = registrations.find((r) => r.name === 'conversation.chat.turnTail')
  check('conversation.chat.turnTail entry registered', turnTail !== undefined)
  check('the Turn-tail entry is keyed by the definition kind',
    turnTail?.id === 'imagegen-generated')
  check('the Turn-tail entry is a list entry with an order',
    typeof turnTail?.order === 'number')
  check('the Turn-tail entry injects the shared per-session face',
    typeof turnTail?.inject?.('session-1')?.loadImagesMeta === 'function')
  check('the definition registers under its kind',
    definitions.length === 1 && definitions[0]?.kind === 'imagegen-generated')

  // Drive the fold the way the registry does: turn/start opens the state, and
  // the call's own tool/call + tool/result settle it.
  const definition = definitions[0]
  const ATTACHMENT = { attachmentId: 'sha256:aa11', mediaType: 'image/png', bytes: 4, width: 2, height: 2, name: 'generated-1.png' }
  const events = [
    { type: 'turn/start', seq: 10, data: { turn: 3 } },
    { type: 'tool/call', seq: 11, data: { turn: 3, callId: 'call_1', name: 'generate_image', arguments: '{"prompt":"一只猫"}' } },
    {
      type: 'tool/result',
      seq: 12,
      data: {
        turn: 3,
        message: {
          toolCallId: 'call_1',
          content: [
            { type: 'text', text: '已生成 1 张图片' },
            { type: 'image', attachment: ATTACHMENT },
          ],
        },
      },
    },
  ]
  let state
  for (const event of events) {
    const match = definition.match(event)
    if (match === null) continue
    state = match.role === 'start'
      ? definition.start({}, match)
      : definition.update({ state }, match)
  }
  check('the fold keeps one settled call for the Turn',
    state?.calls?.length === 1 && state.calls[0].callId === 'call_1')
  check('the fold keeps the picture with its durable reference',
    state?.calls?.[0]?.images?.[0]?.attachmentId === 'sha256:aa11')
  check('the fold reads the prompt off the call arguments',
    state?.calls?.[0]?.prompt === '一只猫')
  check('the fold records the settlement sequence',
    state?.calls?.[0]?.seq === 12)

  // A Turn that generated nothing must contribute nothing: the seat is shared
  // with the platform's other Turn-level artifacts.
  const quiet = definition.match({ type: 'tool/result', seq: 20, data: { turn: 4, message: { toolCallId: 'call_2', content: [{ type: 'text', text: 'no picture' }] } } })
  const quietState = definition.update(
    { state: { turn: 4, calls: [], callsByName: new Map() } },
    quiet,
  )
  check('a result without picture blocks folds to no call', quietState.calls.length === 0)
  check('an unrelated event is not matched',
    definition.match({ type: 'session/meta', seq: 21, data: { turn: 4 } }) === null)

  // Render the seat the way ui-chat does: the closing Turn's folded data plus
  // the injected face. A Turn that generated nothing MUST return null — the
  // seat is shared with the platform's other Turn-level artifacts, so an empty
  // contribution would add a blank row beneath every reply.
  const tailFace = turnTail.inject('session-1')
  const ownerOf = (data, endSeq) => ({
    turn: { data: { get: (kind) => (kind === 'imagegen-generated' ? data : undefined) }, end: { seq: endSeq } },
    seq: endSeq,
    sessionId: 'session-1',
    t: (key) => `t:${key}`,
    ...tailFace,
  })
  const tree = turnTail.component(ownerOf(state, 12))
  check('the Turn-tail card renders the picture rows', tree !== null && tree !== undefined)
  // The stub jsx does not recurse into child function components, so render the
  // gallery one level deeper and assert its own wrapper.
  const gallery = typeof tree?.type === 'function' ? tree.type(tree.props) : undefined
  check('the rendered rows carry the plugin-owned gallery class',
    String(gallery?.props?.className ?? '').includes('turnTail'))
  check('the gallery renders one row per settled picture',
    Array.isArray(gallery?.props?.children) && gallery.props.children.length >= 1)
  check('a Turn that generated nothing renders nothing',
    turnTail.component(ownerOf({ turn: 4, calls: [], callsByName: new Map() }, 20)) === null)
  check('a Turn whose settlement lands after its end renders nothing',
    turnTail.component(ownerOf(state, 11)) === null)
  check('a missing session id declines the card',
    turnTail.component({ ...ownerOf(state, 12), sessionId: undefined }) === null)
  check('an unexpected Turn shape declines instead of throwing',
    turnTail.component({ ...tailFace, t: (key) => `t:${key}`, turn: undefined }) === null)
  // The tail has no session-authorized loader among its owner props, so its
  // pictures must come from the plugin's own authorized byte route.
  check('the tail card reads bytes from the plugin route (index mode)',
    source.includes('index=') && source.includes('dsh-tool-imagegen/images'))
  // Two data sources: the client-side fold, and the host's per-Turn projection
  // for Turns that fold cannot cover. The stub's noop useEffect cannot drive an
  // async fallback, so this pins the wiring instead of the transition.
  check('the tail card can fall back to the host per-Turn projection',
    source.includes('loadTurnImages') && source.includes('generatedTurnsUrl'))
  check('the shared face carries the per-Turn projection loader',
    typeof toolFace?.loadTurnImages === 'function')
  // Primitive drift guard: DSH 2.0.10 dropped `MessageText` from
  // @deepseek-ai/dsh-client-ui-primitives. Importing it by name yields
  // `undefined`, rendering it throws React error #130, and that crash ABDICATES
  // the shadowed user-bubble entry — every user bubble then falls back to the
  // shipped renderer and leaks the raw model-facing envelope.
  // (the docstring may mention the name; what must not exist is the ACCESS)
  check('no removed MessageText primitive is accessed', !source.includes('.MessageText'))
  check('user bubble resolves primitives defensively',
    source.includes('PlainJsonBlock') && source.includes('fallbackWriteClipboard'))
  // The settings card owns its chevron: no Harness Client icon export is
  // accessed, so a renamed icon cannot crash the card out of its slot.
  check('settings card draws its own chevron instead of a primitives icon',
    source.includes('M4 6.5 8 10.5 12 6.5') && !/\w*primitives\w*\s*(as unknown as[^)]*)?\)?\.\s*IconChevron/.test(source))
  // The plugin's own upload button is gone: the composer's native attachment
  // button owns reference uploads now. Re-adding conversation.input.left would
  // put a second, duplicate button in the composer.
  check('no custom composer upload button registered', registrations.every((r) => r.name !== 'conversation.input.left'))
  check('conversation.sendSession was wrapped (instance method patched)', typeof conversationStub.sendSession === 'function' && conversationStub.calls.length === 0)
  const wrappedSend = conversationStub.sendSession
  check('conversation.chat.node user shadow at priority -1', bubble !== undefined && bubble.key === 'user' && bubble.priority === -1)
  check('user shadow locale is dsh-imagegen', bubble?.locale === 'dsh-imagegen')
  // The sendSession wrapper must be a pass-through without a pending draft:
  // the drafts-less branch executes synchronously, so the forward (recorded
  // on the stub) is observable right after the call.
  const before = conversationStub.calls.length
  const signal = { aborted: false }
  const resultPromise = wrappedSend({ sessionId: 'session-no-draft' }, 'hello', [], 'queue', signal)
  check('sendSession wrapper forwards drafts-less sends', typeof resultPromise?.then === 'function' && conversationStub.calls.length === before + 1)
  const forwarded = conversationStub.calls[conversationStub.calls.length - 1]
  check('forwarded call preserves args', forwarded?.session?.sessionId === 'session-no-draft' && forwarded?.text === 'hello' && forwarded?.mode === 'queue')
  check('forwarded call passes the AbortSignal through (5-arg platform signature)', forwarded?.signal === signal)
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
check('the dead settings bridge route is not referenced', !source.includes('settings/describe') && !source.includes('settings/mutate'))

console.log('')
if (failures > 0) {
  console.error(`SMOKE FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('SMOKE PASSED')
