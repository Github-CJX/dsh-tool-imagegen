/**
 * Build the dsh-tool-imagegen client bundle to lib/client.js.
 *
 * The bundle must satisfy the dsh client-modules contract (mirrored from the
 * platform bundles): call `window.__ModuleLoader__.load({ id, factory })`, and
 * inside the factory use the `var module = {exports:{}}` / `var exports =
 * module.exports` / `return module.exports` shape so the loader can read the
 * plugin's `{ apply, inject }`.
 *
 * externals: `react` / `react/jsx-runtime` and every `@deepseek-ai/*` specifier
 * stay as `require(...)` calls — the loader resolves them (platform seed words
 * or registered factories). CSS Modules are intercepted by a custom plugin and
 * compiled to scoped class maps + a self-injecting <style> tag, exactly the
 * platform's inline-CSS pattern — rolldown's native CSS pipeline is never
 * touched (its virtual ids end in `.css` and broke the loader).
 */

import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'rolldown'

const ROOT = dirname(fileURLToPath(import.meta.url))
const PLUGIN_ID = '@local/dsh-tool-imagegen'

/** Deterministic short hash for scoped class names. */
function shortHash(input) {
  let hash = 0x811c9dc5
  for (let i = 0; i < input.length; i += 1) {
    hash ^= input.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(36)
}

/** Every `.identifier` class token in a stylesheet, in first-appearance order. */
function classTokens(css) {
  const classes = []
  const seen = new Set()
  const pattern = /\.[_a-zA-Z][_a-zA-Z0-9-]*/g
  let match
  while ((match = pattern.exec(css)) !== null) {
    const name = match[0].slice(1)
    if (!seen.has(name)) {
      seen.add(name)
      classes.push(name)
    }
  }
  return classes
}

/** Scope every occurrence of a known class token, leaving unknown tokens alone. */
function scopeCss(css, scoped) {
  let out = css
  for (const [name, scopedName] of scoped) {
    const pattern = new RegExp('\\.' + name + '(?![_a-zA-Z0-9-])', 'g')
    out = out.replace(pattern, '.' + scopedName)
  }
  return out
}

/**
 * The `\0` prefix marks the id virtual (rolldown skips file-based handling);
 * the `.js` suffix keeps the id out of the (now-removed) CSS pipeline, which
 * keys the module type on the id extension and hard-errors on `.css`.
 */
const VIRTUAL_PREFIX = '\0cssm:'
const JS_SUFFIX = '.js'

/** Intercept `*.module.css` imports and compile them to inline-JS modules. */
function cssModulePlugin() {
  return {
    name: 'dsh-tool-imagegen:css-modules-inline',
    resolveId(source, importer) {
      if (!source.endsWith('.module.css')) return null
      const base = importer === undefined ? ROOT : dirname(importer)
      return VIRTUAL_PREFIX + resolve(base, source) + JS_SUFFIX
    },
    load(id) {
      if (!id.startsWith(VIRTUAL_PREFIX)) return null
      const realPath = id.slice(VIRTUAL_PREFIX.length, -JS_SUFFIX.length)
      const raw = readFileSync(realPath, 'utf8')
      const classes = classTokens(raw)
      const hash = shortHash(realPath)
      const scoped = new Map(classes.map((name) => [name, `dsh-tig_${name}_${hash}`]))
      const scopedCss = scopeCss(raw, scoped)
      const classMap = Object.fromEntries(scoped)
      const tagId = `${PLUGIN_ID}/${realPath.slice(ROOT.length + 1).replace(/\\/g, '/')}`
      const code = [
        `const css = ${JSON.stringify(scopedCss)};`,
        `const tagId = ${JSON.stringify(tagId)};`,
        `if (typeof document !== "undefined" && document.querySelector("style[data-plugin-css=" + JSON.stringify(tagId) + "]") === null) {`,
        `  const tag = document.createElement("style");`,
        `  tag.dataset.pluginCss = tagId;`,
        `  tag.textContent = css;`,
        `  document.head.appendChild(tag);`,
        `}`,
        `export default ${JSON.stringify(classMap)};`,
      ].join('\n')
      return { code, moduleSideEffects: true }
    },
  }
}

const buildResult = await build({
  input: resolve(ROOT, 'src/client/index.ts'),
  plugins: [cssModulePlugin()],
  external(id) {
    return id === 'react' || id === 'react/jsx-runtime' || id.startsWith('@deepseek-ai/')
  },
  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.jsx'],
  },
  output: {
    format: 'cjs',
    exports: 'named',
    esModule: true,
    sourcemap: false,
  },
  // The client bundle never touches node APIs; keep the transform surface
  // minimal (oxc handles TSX natively).
  moduleTypes: undefined,
})

const chunk = buildResult.output[0]
if (chunk === undefined || chunk.code === undefined || buildResult.output.length !== 1) {
  throw new Error(`build-client: expected exactly one output chunk, got ${buildResult.output.length}`)
}

// rolldown's `//#region` comments carry the virtual id verbatim; drop the NUL
// byte so no control character survives into the shipped bundle.
const bundleCode = chunk.code.replaceAll('\0cssm:', 'cssm:')

const wrapped = `window.__ModuleLoader__.load({
	id: ${JSON.stringify(PLUGIN_ID)},
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
${bundleCode.split('\n').map((line) => '\t' + line).join('\n')}
		return module.exports;
	}
});
`

const outFile = resolve(ROOT, 'lib/client.js')
await import('node:fs/promises').then(async (fs) => {
  await fs.writeFile(outFile, wrapped, 'utf8')
  const bytes = Buffer.byteLength(wrapped, 'utf8')
  console.log(`[build-client] wrote ${outFile} (${bytes} bytes)`)
})
