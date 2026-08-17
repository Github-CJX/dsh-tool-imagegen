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
  }
}
