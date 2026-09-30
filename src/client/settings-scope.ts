/**
 * Browser-side settings scope for the plugin's `dsh-imagegen` entry.
 *
 * The plugin used to serve its own namespace over a loopback HTTP bridge
 * (`/api/dsh-tool-imagegen/settings/{describe,mutate}`) because the older
 * client's settings scope refused every third-party namespace. That is no
 * longer the case: the current client exposes the platform's own configuration
 * forms through the `configForms` service, which owns the transport, revision
 * fencing, conflict detection, schema validation and secret redaction.
 *
 * This module is a thin adapter: it binds `configForms.get(namespace)` — the
 * same object the shipped settings pages consume — onto the small structural
 * face the plugin's own `CardForm` is written against, and it derives the
 * "a key is configured" flag from the shared mirror. `ConfigForm`'s own
 * snapshot deliberately does NOT carry the `secrets` sidecar, so that flag can
 * only be read from `configForms.describe()`.
 *
 * Types are declared locally rather than imported from
 * `@deepseek-ai/dsh-client-store`: the platform no longer ships type
 * declarations, and the plugin's build is transpile-only, so a local structural
 * face is both honest and sufficient.
 */

import { createSnapshotStore, type SnapshotStore } from '@deepseek-ai/dsh-client-store'

/** The fields this plugin's settings card edits. */
export interface ImageGenConfig {
  enabled?: boolean
  announceToAgent?: boolean
  apiUrl?: string
  apiKey?: string
  model?: string
  size?: string
  n?: number
  quality?: string
  output_format?: string
  background?: string
  style?: string
  moderation?: string
  watermark?: string
  quality_enabled?: boolean
  output_format_enabled?: boolean
  background_enabled?: boolean
  style_enabled?: boolean
  moderation_enabled?: boolean
  watermark_enabled?: boolean
}

/** One namespace's shared configuration form, as this card reads it. */
export interface ScopeSnapshot<T> {
  /** `loading` until the mirror answers; `unavailable` when the entry is not served. */
  status: 'loading' | 'ready' | 'unavailable'
  /** The effective section: user layer over composition layer over schema default. */
  value: T | undefined
  /** The composition/inherited layer, for "reset to default" drafts. */
  base: unknown
  /** The user layer alone: presence of a key here is what marks a field overridden. */
  user: unknown
  /** Revision the next write is fenced against. */
  revision: number | undefined
  /** Whether the deployment accepts writes at all. */
  writable: boolean
  /** `memory` means the page is not loopback, so nothing crosses the wire. */
  mode?: 'host' | 'memory'
}

/** The read/write face one namespace's shared form exposes. */
export interface Scope<T> {
  getSnapshot(): ScopeSnapshot<T>
  subscribe(listener: () => void): () => void
  /** Write one field; resolves false when the Host refused (conflict or validation). */
  set(field: string, value: unknown): Promise<boolean>
  /** Clear one field so it re-inherits the layer beneath; false when refused. */
  unset(field: string): Promise<boolean>
}

/** One secret position the Host reports for a namespace. */
export interface SecretView {
  /** Field path inside the section, e.g. `['apiKey']`. */
  path: string[]
  /** Whether a value is currently stored at that path. */
  set: boolean
}

/** One namespace row of the shared settings document. */
export interface NamespaceView {
  ns: string
  value?: unknown
  base?: unknown
  user?: unknown
  revision?: number
  secrets?: SecretView[]
}

/** The shared settings mirror's snapshot. */
export interface MirrorSnapshot {
  status?: string
  view?: { writable?: boolean; namespaces?: NamespaceView[] }
  error?: unknown
}

/** The platform's shared settings mirror, as this adapter reads it. */
export interface SettingsMirror {
  getSnapshot(): MirrorSnapshot
  subscribe(listener: () => void): () => void
  load(): Promise<void>
  /** Row lookup by namespace; absent on older mirrors, so callers fall back. */
  namespace?(ns: string): NamespaceView | undefined
}

/** The subset of the platform's `configForms` service this adapter uses. */
export interface ConfigFormsLike {
  /** The shared form for one Host plugin entry id. */
  get(entryId: string): Scope<ImageGenConfig>
  /** The one describe mirror every settings consumer derives from. */
  describe(): SettingsMirror
  /** Keep `register` alive while the Host serves at least one of `namespaces`. */
  whileServed(namespaces: string[], register: (served: Set<string>) => () => void): () => void
}

/** The bound scope plus the secret-presence flag, as the card consumes it. */
export interface ImageGenScope extends Scope<ImageGenConfig> {
  /** Queue a settings re-read (the invalidation path re-reads the namespace). */
  load(): Promise<void>
  /** Whether the namespace currently holds a stored secret (the API key). */
  getKeySetSnapshot(): boolean
  /** Observe the secret-presence flag. */
  subscribeKeySet(listener: () => void): () => void
  /** Release the mirror subscription this scope owns. */
  dispose(): void
}

/** Field path this plugin stores its API key under. */
const API_KEY_FIELD = 'apiKey'

/**
 * Read one namespace row out of a mirror snapshot. Prefers the mirror's own
 * `namespace()` helper and falls back to scanning the snapshot, so a mirror
 * that stops shipping the helper degrades instead of throwing.
 * @param mirror - the shared settings mirror.
 * @param namespace - the entry id to look up.
 * @returns the row, or undefined while the namespace is not served.
 */
function namespaceRow(mirror: SettingsMirror, namespace: string): NamespaceView | undefined {
  try {
    const direct = mirror.namespace?.(namespace)
    if (direct !== undefined) return direct
  } catch {
    // Fall through to the snapshot scan.
  }
  return mirror.getSnapshot().view?.namespaces?.find(row => row.ns === namespace)
}

/**
 * Whether one field of a namespace currently holds a stored secret. The Host
 * strips `role('secret')` values from every response and reports only presence,
 * so this sidecar — not the section value — is the card's evidence.
 * @param mirror - the shared settings mirror.
 * @param namespace - the entry id to inspect.
 * @param field - the top-level field name to test.
 * @returns true when the Host reports a stored value at that path.
 */
function secretIsSet(mirror: SettingsMirror, namespace: string, field: string): boolean {
  const secrets = namespaceRow(mirror, namespace)?.secrets
  if (!Array.isArray(secrets)) return false
  return secrets.some(secret => secret.set === true && secret.path?.join('.') === field)
}

/**
 * A scope for a deployment that composed no configuration-form service. The
 * card renders its "not offered here" state instead of controls, and every
 * write is a refusal — a missing optional service must never take the GUI down.
 * @returns a permanently unavailable scope.
 */
export function unavailableScope(): ImageGenScope {
  const store: SnapshotStore<ScopeSnapshot<ImageGenConfig>> = createSnapshotStore({
    status: 'unavailable',
    value: undefined,
    base: undefined,
    user: undefined,
    revision: undefined,
    writable: false,
    mode: 'memory',
  })
  const keySet: SnapshotStore<boolean> = createSnapshotStore(false)
  return {
    getSnapshot: () => store.getSnapshot(),
    subscribe: listener => store.subscribe(listener),
    set: () => Promise.resolve(false),
    unset: () => Promise.resolve(false),
    load: () => Promise.resolve(),
    getKeySetSnapshot: () => keySet.getSnapshot(),
    subscribeKeySet: listener => keySet.subscribe(listener),
    dispose: () => {},
  }
}

/**
 * Bind the plugin's settings scope onto the platform's configuration-form
 * service.
 * @param forms - the client's `configForms` service.
 * @param namespace - the plugin's profile entry id (`dsh-imagegen`).
 * @returns the bound scope; `unavailable` until (or unless) the Host serves the
 *   namespace, which the card renders as "current environment does not offer
 *   this setting" rather than as an error.
 */
export function bindImageGenScope(forms: ConfigFormsLike, namespace: string): ImageGenScope {
  const scope = forms.get(namespace)
  const mirror = forms.describe()
  const keySet: SnapshotStore<boolean> = createSnapshotStore(secretIsSet(mirror, namespace, API_KEY_FIELD))

  // The key-set flag follows the shared mirror, which is the only place the
  // secrets sidecar appears, and it must be re-read after every write: a save
  // that stores a key updates the sidecar through the mirror.
  const syncKeySet = () => {
    const next = secretIsSet(mirror, namespace, API_KEY_FIELD)
    if (keySet.getSnapshot() !== next) keySet.set(next)
  }
  const unsubscribeMirror = mirror.subscribe(syncKeySet)
  void mirror.load().then(syncKeySet, syncKeySet)

  return {
    getSnapshot: () => scope.getSnapshot(),
    subscribe: listener => scope.subscribe(listener),
    set: (field, value) => scope.set(field, value),
    unset: field => scope.unset(field),
    load: () => mirror.load().then(syncKeySet, syncKeySet),
    getKeySetSnapshot: () => keySet.getSnapshot(),
    subscribeKeySet: listener => keySet.subscribe(listener),
    dispose: () => { unsubscribeMirror() },
  }
}
