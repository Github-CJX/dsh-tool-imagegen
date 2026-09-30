/**
 * Wire contract shared by the host and client halves of dsh-tool-imagegen: the
 * settings namespace and the loopback bridge route paths.
 *
 * The namespace is `dsh-imagegen`, which is both this plugin's profile entry id
 * and the key its settings form is addressed by. Configuration itself does NOT
 * travel over a plugin route: the browser card writes through the platform's
 * own configuration-form service, so no settings path is declared here.
 *
 * The remaining route paths are this plugin's own (/api/dsh-tool-imagegen/*) to
 * avoid colliding with the old plugin's (now-removed) routes.
 *
 * Pure constants — safe for the client bundle to inline.
 */

/**
 * Settings namespace this plugin owns: the profile entry id of the plugin row,
 * and the key the card binds its form to.
 */
export const IMAGEGEN_SETTINGS_NAMESPACE = 'dsh-imagegen'

/**
 * Loopback bridge reporting, for one `generate_image` call, what that call
 * produced — the durable attachment references plus the work-dir edit handles
 * and captions — as compact JSON.
 *
 * The pictures themselves travel as native `image` blocks in the tool's own
 * result, so the browser loads them through the platform's session-authorized
 * `loadImage` loader (`ToolCallOwnerProps.loadImage`) and reuses the shipped
 * `tool.call.images` lightbox. This route only carries the facts an `image`
 * block cannot: the per-image upload work-dir path (also handed to the model in
 * the result's text envelope) and the prompt/model/size captions.
 */
export const IMAGEGEN_IMAGES_API = {
  path: '/api/dsh-tool-imagegen/images',
} as const

/**
 * Browser URL of one generated image's bytes.
 *
 * The toolview resolves its pictures through the platform's own
 * session-authorized `loadImage` (the tool result carries native `image`
 * blocks). The turn-level card cannot: it renders at the turn tail, where that
 * loader is not part of the owner props, so it reads the bytes from this
 * plugin's own route. Authorization is the same rule either way — the route
 * only answers for a call the named session actually holds (or the run this
 * process retained for it).
 * @param sessionId - the session the call belongs to.
 * @param callId - the `generate_image` call id.
 * @param index - the image's position within that call's result.
 * @returns the relative URL of the image bytes.
 */
export function generatedImageUrl(sessionId: string, callId: string, index: number): string {
  return `${IMAGEGEN_IMAGES_API.path}?session=${encodeURIComponent(sessionId)}`
    + `&call=${encodeURIComponent(callId)}&index=${index}`
}

/**
 * Browser URL of one session's whole Turn-level generated-image projection.
 *
 * The Turn-tail card prefers the client-side fold, which costs no request. This
 * route is the fallback for what that fold cannot cover: a Definition only sees
 * events matched AFTER it was registered, so a Turn whose events were folded
 * earlier — or a Turn outside the loaded window — has no client-side data. The
 * host reads the same facts from the session's own durable log.
 * @param sessionId - the session to project.
 * @returns the relative URL of the per-Turn manifest.
 */
export function generatedTurnsUrl(sessionId: string): string {
  return `${IMAGEGEN_IMAGES_API.path}?session=${encodeURIComponent(sessionId)}`
}

/** Default upstream model, editable in the settings card. */
export const DEFAULT_MODEL = 'gpt-image-2'

/**
 * Loopback bridge route accepting a text-model upload: the client POSTs the
 * image bytes (base64), the host stores them in the upload work dir + the
 * attachment store, then enqueues a user message ([uploaded-image] block +
 * model-facing text envelope) into the session so the image renders inline
 * while the model only ever sees the text envelope.
 */
export const UPLOAD_API = {
  path: '/api/dsh-tool-imagegen/upload',
} as const

/** Storage-maintenance bridges (stats + orphan cleanup). */
export const MAINTENANCE_API = {
  stats: '/api/dsh-tool-imagegen/maintenance/stats',
  cleanup: '/api/dsh-tool-imagegen/maintenance/cleanup',
} as const

/**
 * Loopback bridge route opening one referenced image in the system's default
 * image viewer (the inline view's 本地打开 button). The host re-checks the
 * session's events — the same rule as the platform's own attachment route and
 * as {@link IMAGEGEN_IMAGES_API} — then copies the
 * bytes to a host-side temp file and hands it to the OS opener; the browser
 * never gets the bytes or a path.
 */
export const OPEN_API = {
  path: '/api/dsh-tool-imagegen/open',
} as const

/**
 * Prefix of the model-facing envelope text that accompanies an uploaded image.
 * The model MUST see it (it carries the work-dir path to feed back through the
 * generate_image `image` parameter); the uploaded-image bubble renderer filters
 * out any text block starting with this prefix so the user's bubble shows only
 * the image and their own typed words.
 */
export const UPLOAD_ENVELOPE_PREFIX = '【dsh-imagegen】'

/** Third line of the envelope: the typed user request the host embedded. */
const ENVELOPE_REQUEST_MARKER = '用户接下来的要求：'

/** Placeholder the host writes when the upload carried no text. */
const ENVELOPE_NO_REQUEST = '（暂无文字说明，请先向用户确认要如何修改或生成这张图）'

/**
 * Extract the user's typed request from a model-facing upload envelope. The
 * bubble renderer filters envelope text out of the visible bubble — but the
 * user's own words live in the envelope's third line, so they are pulled out
 * and shown instead. Returns undefined when the text is not an envelope or
 * carries no request.
 */
export function envelopeRequestText(envelope: string): string | undefined {
  if (envelope.startsWith(UPLOAD_ENVELOPE_PREFIX) === false) return undefined
  const index = envelope.lastIndexOf(ENVELOPE_REQUEST_MARKER)
  if (index < 0) return undefined
  const request = envelope.slice(index + ENVELOPE_REQUEST_MARKER.length).trim()
  return request === '' || request === ENVELOPE_NO_REQUEST ? undefined : request
}

import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'

/**
 * One generated picture as the GUI learns about it: the platform's own
 * `image` block supplies the attachment reference the session-authorized
 * `loadImage` loader resolves, and this record adds the facts an `image` block
 * cannot carry — the upload work-dir copy that is the model's edit handle, and
 * the prompt/model/size captions.
 *
 * The tool persists these as `tool/result.data.meta` through
 * `output.presentationMeta`, and the images manifest route
 * ({@link IMAGEGEN_IMAGES_API}) serves the same records per call id.
 */
export interface GeneratedImageRecord {
  /** Durable attachment reference produced by ctx.attachments.saveImage(). */
  attachmentId: string
  mediaType: string
  bytes: number
  width: number
  height: number
  name?: string
  /** Absolute path of the upload work-dir copy (the model's edit handle). */
  path?: string
}

/**
 * One generated picture plus the edit bytes the host serves for it: what the
 * 修改 action stages as the session's pending reference, so the follow-up call
 * gets exactly the image the model itself was handed.
 */
export interface GeneratedImageEdit extends GeneratedImageRecord {
  /** Base64 of the image bytes (no data-URL prefix). */
  data: string
}

/** Per-call metadata the tool persists as `tool/result.data.meta`. */
export interface GeneratedImagesMeta {
  prompt: string
  model: string
  size: string
  images: GeneratedImageRecord[]
}

/**
 * Read {@link GeneratedImagesMeta} out of an untrusted value: the persisted
 * `tool/result.data.meta`, or any object of the same shape. Returns undefined
 * when the value is not that shape, so a view never throws on a foreign
 * payload (a throw would abdicate the keyed toolview entry).
 * @param value - candidate metadata (block.meta, an HTTP body, undefined).
 * @returns the validated metadata, or undefined.
 */
export function generatedImagesMeta(value: unknown): GeneratedImagesMeta | undefined {
  if (value === null || typeof value !== 'object' || Array.isArray(value)) return undefined
  const candidate = value as Record<string, unknown>
  if (!Array.isArray(candidate.images)) return undefined
  const images: GeneratedImageRecord[] = []
  for (const entry of candidate.images) {
    if (entry === null || typeof entry !== 'object' || Array.isArray(entry)) continue
    const image = entry as Record<string, unknown>
    if (typeof image.attachmentId !== 'string' || image.attachmentId === '') continue
    images.push({
      attachmentId: image.attachmentId,
      mediaType: typeof image.mediaType === 'string' ? image.mediaType : 'image/png',
      bytes: typeof image.bytes === 'number' ? image.bytes : 0,
      width: typeof image.width === 'number' ? image.width : 0,
      height: typeof image.height === 'number' ? image.height : 0,
      ...typeof image.name === 'string' && image.name !== '' ? { name: image.name } : {},
      ...typeof image.path === 'string' && image.path !== '' ? { path: image.path } : {},
    })
  }
  if (images.length === 0) return undefined
  return {
    prompt: typeof candidate.prompt === 'string' ? candidate.prompt : '',
    model: typeof candidate.model === 'string' ? candidate.model : '',
    size: typeof candidate.size === 'string' ? candidate.size : '',
    images,
  }
}

declare module '@deepseek-ai/dsh-llm/types' {
  /**
   * LEGACY, read-only. The upload bridge used to emit this plugin-private block
   * as the leading block of the reference-image user message. Message adapters
   * do NOT skip unknown block types: the strict DeepSeek Messages route refused
   * the whole request (`UNSUPPORTED_CONTENT: cannot represent user/tool-result
   * content uploaded-image`), and since that message is durable it poisoned
   * every later turn of the session.
   *
   * The host now emits the platform's own `image` block instead, so nothing
   * writes this type any more. It stays declared so images in sessions written
   * BEFORE that fix still render in the bubble rather than dropping into the
   * raw-JSON fallback.
   */
  interface ContentBlockMap {
    'uploaded-image': UploadedImageBlock
  }
}

/**
 * The retired upload block, still recognized for replay of older sessions.
 *
 * Do not emit it: it is plugin-private and therefore unrepresentable to every
 * strict adapter. See the augmentation above for the failure it caused.
 */
export interface UploadedImageBlock {
  type: 'uploaded-image'
  /** Durable attachment reference produced by ctx.attachments.saveImage(). */
  attachment: ImageAttachmentRef
  /** Absolute path in the plugin upload work dir (the generate_image handle). */
  path: string
  /** File name in the work dir (shown in the model-facing envelope). */
  filename: string
}
