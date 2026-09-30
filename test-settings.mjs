/**
 * Settings-contract test for the host half.
 *
 * DSH 0.2.0 replaced the old `installSettingsSection(ctx, namespace, Config, …)`
 * seam with a schema-driven one: a plugin's `Config` IS the registration, and
 * the platform builds the GUI form from the schema's `.volatile()` fields only
 * (`volatileForm`/`plainSchema`/`isVolatilePath` in @deepseek-ai/dsh-settings).
 * A field without `.volatile()` is silently invisible in the GUI and rejected by
 * a form write; a schema with NO volatile field drops the entry entirely, so the
 * plugin's page would simply not exist.
 *
 * That makes volatility a load-bearing property of every editable field, and it
 * is exactly the kind of thing a refactor loses silently. This test pins it:
 *
 *   1. the serialized Config carries exactly the fields the tool reads;
 *   2. every one of them is volatile (so the official form offers them all);
 *   3. a non-volatile control field is provably excluded by the same walk;
 *   4. the API key is a `role('secret')` field with no default (a default would
 *      make the Host report a key as configured before one ever was);
 *   5. a volatile field parses into a live reference that `liveValue` unwraps,
 *      and defaults/clamping still resolve through `resolveConfig`;
 *   6. `apply()` publishes the model-visible schema from that live config and
 *      rebuilds it when the loader commits a volatile update — the mechanism
 *      that makes a saved settings edit take effect without a restart.
 */

import z from '@deepseek-ai/schemastery'
import { Config, ConfigFields, ImageGenSettingsNamespace, apply, liveValue, resolveConfig } from './lib/index.js'

let failures = 0
const check = (label, ok, detail) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}${detail === undefined ? '' : ` — ${detail}`}`) }
}

/** The symbol the loader uses to rewrite one volatile reference in place. */
const VOLATILE_WRITE = Symbol.for('cosmokit.volatile.write')

// --- 1/2. the serialized schema and its volatile fields ----------------------

/**
 * Re-implement the platform's `volatileForm` selection over a serialized Config.
 * Mirrors @deepseek-ai/dsh-settings: the root is rehydrated with `new z(json)`,
 * then an object root keeps only the children carrying `meta.volatile`; a root
 * with none yields undefined, which makes `describe()` drop the entry entirely.
 * @param json - a serialized schemastery schema.
 * @returns the field names the GUI form would offer.
 */
function volatileFieldsOf(json) {
  const schema = new z(json)
  if (schema.meta?.volatile === true) return Object.keys(schema.dict ?? {})
  if (schema.type !== 'object') return []
  return Object.entries(schema.dict ?? {})
    .filter(([, child]) => child.meta?.volatile === true)
    .map(([key]) => key)
}

console.log('schema:')
const json = Config.toJSON()
const rehydrated = new z(json)
const formFields = volatileFieldsOf(json)

check('Config root is an object schema', rehydrated.type === 'object')
check('the form offers every field the tool reads',
  JSON.stringify([...formFields].sort()) === JSON.stringify([...ConfigFields].sort()),
  `form=[${[...formFields].sort().join(',')}] read=[${[...ConfigFields].sort().join(',')}]`)
check('no field the tool reads is absent from the form', ConfigFields.every((field) => formFields.includes(field)))
check('the form offers nothing beyond the fields the tool reads', formFields.length === ConfigFields.length)

// 3. Negative control: prove the volatility walk is what decides membership, so
// a future edit that drops `.volatile()` from one field fails this test loudly
// instead of silently hiding the control.
const controlJson = z.object({
  kept: z.string().default('').volatile(),
  dropped: z.string().default(''),
}).toJSON()
const controlFields = volatileFieldsOf(controlJson)
check('negative control: a non-volatile field is NOT offered by the form',
  controlFields.includes('kept') && !controlFields.includes('dropped'),
  `control=[${controlFields.join(',')}]`)

// 4. the secret field ---------------------------------------------------------

const apiKeyNode = rehydrated.dict.apiKey
check('apiKey is declared role("secret")', apiKeyNode?.meta?.role === 'secret')
check('apiKey carries no schema default (a default would report a key as set)',
  apiKeyNode !== undefined && !('default' in apiKeyNode.meta),
  `meta=${JSON.stringify(apiKeyNode?.meta)}`)
check('apiKey is volatile so the card can write it', apiKeyNode?.meta?.volatile === true)

// --- 5. live reads -----------------------------------------------------------

console.log('\nlive config:')
const config = new Config({ apiUrl: 'https://api.example/v1', quality_enabled: false })

check('a volatile field parses into a reference, not a plain value',
  typeof config.apiUrl === 'object' && typeof config.apiUrl.get === 'function')
check('liveValue unwraps a volatile reference', liveValue(config.apiUrl) === 'https://api.example/v1')
check('liveValue passes a plain value through unchanged', liveValue('plain') === 'plain')
check('liveValue passes undefined through unchanged', liveValue(undefined) === undefined)

const resolved = resolveConfig({
  apiUrl: liveValue(config.apiUrl),
  apiKey: liveValue(config.apiKey),
  n: 9,
  model: liveValue(config.model),
})
check('resolveConfig applies the model default', resolved.model === 'gpt-image-2')
check('resolveConfig reports an unset secret as the empty string', resolved.apiKey === '')
check('resolveConfig clamps the image count into 1-4', resolved.n === 4)
check('resolveConfig keeps a set apiUrl', resolved.apiUrl === 'https://api.example/v1')

// The loader rewrites a volatile reference in place; the plugin must observe the
// new value on its next read (this is what makes a saved edit take effect).
config.apiUrl[VOLATILE_WRITE]('https://api.changed/v2')
check('a committed volatile update is visible on the next read',
  liveValue(config.apiUrl) === 'https://api.changed/v2')

// --- 6. apply() publishes and refreshes the model-visible schema -------------

console.log('\napply:')
const registered = []
const sections = []
const routes = []
let volatileListener = null
let presentationConfigured = false

const childCtx = {
  effect(fn) { fn(); return () => {} },
  settings: {
    configure(presentation, owner) {
      presentationConfigured = presentation?.auto === false && owner === ctx.fiber
      return () => {}
    },
  },
}
const ctx = {
  fiber: { id: 'test-fiber' },
  effect(fn) { fn() },
  inject(services, callback) { callback(childCtx) },
  on(event, listener) { if (event === 'loader/volatile-update') volatileListener = listener; return () => {} },
  get() { return undefined },
  systemPrompt: {
    section(spec) { sections.push(spec); return () => {} },
  },
  tools: {
    register(definition) { registered.push(definition); return () => {} },
  },
  webServer: { register(route) { routes.push(route); return () => {} } },
}

let applyError = null
try {
  apply(ctx, config)
} catch (error) {
  applyError = error
}
check('apply() runs without throwing', applyError === null, applyError?.stack)
check('apply() opts out of the schema-generated settings page',
  presentationConfigured)
check('apply() announces the plugin in the system prompt',
  sections.length === 1 && sections[0].name === 'plugin:dsh-tool-imagegen')
check('apply() registers the generate_image tool', registered.length === 1 && registered[0].name === 'generate_image')
check('apply() mounts the loopback bridges', routes.length >= 4, `routes=${routes.length}`)
check('apply() never mounts a settings bridge route',
  routes.every((route) => !String(route.path).includes('/settings/')))

const first = registered[0]
check('a disabled optional parameter is not advertised to the model',
  first.parameters.properties.quality === undefined)
check('the always-on parameters are advertised',
  ['prompt', 'image', 'size', 'n'].every((name) => first.parameters.properties[name] !== undefined))
check('parameters is a full object-rooted JSON Schema',
  first.parameters.type === 'object' && Array.isArray(first.parameters.required))

// The bug this pins: the tool used to render plugin-private `generated-image`
// blocks. A block type outside DSH's ContentBlockMap is not skipped by every
// adapter — the DeepSeek Messages route failed the whole turn with
// `UNSUPPORTED_CONTENT: cannot represent user/tool-result content
// generated-image`. The result must therefore carry only text and the
// platform's own `image` blocks, with the client-only facts in presentationMeta.
{
  const value = {
    prompt: '一只猫',
    model: 'gpt-image-2',
    size: '1024x1024',
    images: [{
      attachmentId: 'sha256:deadbeef',
      mediaType: 'image/png',
      bytes: 12,
      width: 4,
      height: 4,
      name: 'generated-1.png',
      path: 'C:\\work\\generated-1.png',
    }],
  }
  const content = first.output.render({}, value)
  const types = content.map((block) => block.type)
  check('render() emits no plugin-private content block',
    types.every((type) => type === 'text' || type === 'image'), `types=${types.join(',')}`)
  check('render() emits the picture as a native image block',
    types.filter((type) => type === 'image').length === 1)
  const image = content.find((block) => block.type === 'image')
  check('the image block carries the durable attachment reference',
    image.attachment.attachmentId === 'sha256:deadbeef'
      && image.attachment.bytes === 12
      && image.attachment.width === 4)
  check('the text envelope still names the work-dir edit handle',
    content.some((block) => block.type === 'text' && block.text.includes('generated-1.png')))
  check('presentationMeta publishes the client-only facts',
    typeof first.output.presentationMeta === 'function')
  const meta = first.output.presentationMeta({}, value)
  check('presentationMeta carries the captions and the work-dir path',
    meta.prompt === '一只猫'
      && meta.model === 'gpt-image-2'
      && meta.size === '1024x1024'
      && meta.images[0].path === 'C:\\work\\generated-1.png')
  check('presentationMeta stays model-invisible (not part of the content)',
    content.every((block) => block.path === undefined && block.prompt === undefined))
}

// Turn the quality switch on the way the settings form does, then let the loader
// commit the volatile update: the schema must be rebuilt with the new parameter.
config.quality_enabled[VOLATILE_WRITE](true)
check('the loader volatile-update listener was registered', typeof volatileListener === 'function')
volatileListener([['quality_enabled']])
check('a committed switch rebuilds the model-visible schema',
  registered.length === 2 && registered[1].parameters.properties.quality !== undefined,
  `registered=${registered.length}`)

// An unrelated save must not churn the tool layer (the signature guard).
const before = registered.length
volatileListener([['apiUrl']])
check('an unrelated settings change does not re-register the tool', registered.length === before)

// The prompt announcement has constant text, so a save that does not change the
// enabled/announce pair must not re-insert it.
const sectionsBeforeUnrelatedSave = sections.length
volatileListener([['apiUrl']])
check('an unrelated settings change does not churn the prompt layer',
  sections.length === sectionsBeforeUnrelatedSave,
  `${sectionsBeforeUnrelatedSave} -> ${sections.length}`)

// Disabling the plugin retires the announcement without touching the routes.
const routesBeforeDisable = routes.length
config.enabled[VOLATILE_WRITE](false)
volatileListener([['enabled']])
check('disabling the plugin retires the prompt announcement', sections.length === 1)
check('disabling the plugin leaves the bridge routes mounted', routes.length === routesBeforeDisable)

console.log('')
if (failures > 0) {
  console.error(`SETTINGS FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log(`SETTINGS PASSED (namespace ${ImageGenSettingsNamespace})`)
