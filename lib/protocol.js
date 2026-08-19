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
}

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
}

/**
 * Loopback bridge route accepting a text-model upload: the client POSTs the
 * image bytes (base64), the host stores them in the upload work dir + the
 * attachment store, then enqueues a user message ([uploaded-image] + text
 * envelope) into the session so the image renders inline while the model only
 * ever sees the text envelope.
 */
export const UPLOAD_API = {
  path: '/api/dsh-tool-imagegen/upload',
}

/**
 * Loopback bridge route answering whether a given provider/model accepts image
 * input. The client learns the selected model from its own session.models RPC
 * and asks here whether the plugin's custom upload button should be shown
 * (text-only) or the native composer upload used instead (image-capable).
 */
export const CAPABILITY_API = {
  path: '/api/dsh-tool-imagegen/capability',
}

/**
 * Loopback bridge routes for storage maintenance: `stats` reports the upload
 * work dir + attachment store sizes, `cleanup` prunes files not referenced by
 * any session (live or persisted) and reports what was freed.
 */
export const MAINTENANCE_API = {
  stats: '/api/dsh-tool-imagegen/maintenance/stats',
  cleanup: '/api/dsh-tool-imagegen/maintenance/cleanup',
}

/**
 * Loopback bridge route opening one referenced image in the system's default
 * image viewer: the client POSTs { sessionId, attachmentId }, the host copies
 * the bytes to a temp file (named from the attachment id only) and hands it to
 * the OS opener — the same session-reference authorization as the attachment
 * route. Lets the user view a generated image without hunting for a download.
 */
export const OPEN_API = {
  path: '/api/dsh-tool-imagegen/open',
}

/**
 * Prefix of the model-facing envelope text that accompanies an uploaded image.
 * The model MUST see it (it carries the work-dir path to feed back through the
 * generate_image `image` parameter); the client's uploaded-image bubble renderer
 * filters out any text block starting with this prefix so the user's bubble
 * shows only the image and their own typed words.
 */
export const UPLOAD_ENVELOPE_PREFIX = '【dsh-imagegen】'

/** Default upstream model, editable in the settings card. */
export const DEFAULT_MODEL = 'gpt-image-2'
