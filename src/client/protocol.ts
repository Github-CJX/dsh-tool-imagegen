/**
 * Wire contract shared by the host and client halves of dsh-tool-imagegen:
 * the settings namespace and the loopback bridge route paths.
 *
 * The namespace deliberately reuses `dsh-imagegen` — the section the old
 * @dickpy/dsh-imagegen plugin wrote — so any apiUrl/apiKey already present in
 * settings.yaml inherits automatically. The bridge route paths are this
 * plugin's own (/api/dsh-tool-imagegen/*) to avoid colliding with the old
 * plugin's (now-removed) routes.
 *
 * Pure constants — safe for the client bundle to inline.
 */

/** Settings namespace this plugin owns (host settings seam + bridge). */
export const IMAGEGEN_SETTINGS_NAMESPACE = 'dsh-imagegen'

/** Same-origin route family (loopback-only, mirroring the dsh-ssh fence). */
export const SETTINGS_API = {
  describe: '/api/dsh-tool-imagegen/settings/describe',
  mutate: '/api/dsh-tool-imagegen/settings/mutate',
} as const

/**
 * Loopback bridge route serving generated-image bytes to the GUI. The
 * platform's own attachment authorization only recognizes `image` blocks
 * referenced by session events; this plugin deliberately never writes
 * `image` blocks (text-only model safety), so the inline view resolves
 * generated images through this route instead. The route re-checks the
 * session's events for a `generated-image` block referencing the id — the
 * same trust model as the platform route, over this plugin's block type.
 */
export const ATTACHMENT_API = {
  path: '/api/dsh-tool-imagegen/attachment',
} as const

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

/**
 * Loopback bridge route answering whether a given provider/model accepts image
 * input. The client learns the selected model from its own session.models RPC
 * and asks here whether the plugin's custom upload button should be shown
 * (text-only) or the native composer upload used instead (image-capable).
 */
export const CAPABILITY_API = {
  path: '/api/dsh-tool-imagegen/capability',
} as const

/** Storage-maintenance bridges (stats + orphan cleanup). */
export const MAINTENANCE_API = {
  stats: '/api/dsh-tool-imagegen/maintenance/stats',
  cleanup: '/api/dsh-tool-imagegen/maintenance/cleanup',
} as const

/**
 * Loopback bridge route opening one referenced image in the system's default
 * image viewer (the inline view's 本地打开 button). The host re-checks the
 * session's events — same authorization as ATTACHMENT_API — then copies the
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
 * The content block the tool's render() emits per generated image. Its type is
 * deliberately NOT `image` — the model layer's image detection
 * (`contentHasImage`) only matches `type === 'image'` (or inside tool-result),
 * so this block is invisible to the image-capability check. Text-only adapters
 * (pi-ai UNSUPPORTED_CONTENT) and image-capable adapters both tolerate it: the
 * model only ever sees the accompanying text envelope. The UI renders these
 * inline through the keyed `tool.call.toolview` entry.
 */
export interface GeneratedImageBlock {
  type: 'generated-image'
  /** Durable attachment reference produced by ctx.attachments.saveImage(). */
  attachment: ImageAttachmentRef
  /** The prompt that produced this image. */
  prompt: string
  /** Upstream model name. */
  model?: string
  /** Requested size (e.g. "1024x1024"). */
  size?: string
}

declare module '@deepseek-ai/dsh-llm/types' {
  interface ContentBlockMap {
    /** generated-image blocks render inline via the toolview; never reach the model. */
    'generated-image': GeneratedImageBlock
    /** uploaded-image blocks (text-model uploads) render inline via the shadowed user bubble; never reach the model. */
    'uploaded-image': UploadedImageBlock
  }
}

/**
 * The content block the host's upload bridge emits per text-model upload, as
 * the leading block of the user message it enqueues. Same model-safety story as
 * GeneratedImageBlock: never `image`, so text-only adapters tolerate it and the
 * UI renders it inline through the shadowed `user` node renderer.
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
