/**
 * Wire contract shared by the host and client halves of dsh-tool-imagegen:
 * the settings namespace and the loopback bridge route paths.
 *
 * The namespace is `dsh-imagegen`, which in the current DSH is BOTH this
 * plugin's profile entry id (the `id:` of its row in cordis.patch.yml) and the
 * key the official settings service addresses. The settings service identifies
 * a configurable entry by its loader entry id, so the row id, the namespace and
 * the client's form key are one string; reusing the old plugin's section name
 * additionally lets the official legacy importer fold an existing
 * `dsh-imagegen:` section of settings.yaml into this entry.
 *
 * The bridge route paths are this plugin's own (/api/dsh-tool-imagegen/*) to
 * avoid colliding with the old plugin's (now-removed) routes.
 *
 * Pure constants — safe for the client bundle to inline.
 */

/**
 * Settings namespace this plugin owns: the profile entry id of the plugin row,
 * the key `settings.describe()` reports, and the key the client card binds.
 */
export const IMAGEGEN_SETTINGS_NAMESPACE = 'dsh-imagegen'

/**
 * Loopback bridge reporting, for one `generate_image` call, what that call
 * produced: the durable attachment references, the work-dir copies that are the
 * model's edit handles, and the prompt/model/size captions — as compact JSON.
 *
 * Generated pictures travel as native `image` blocks in the tool's own result,
 * which is what the platform's session-authorized `loadImage` loader and its
 * `tool.call.images` lightbox already serve; this route therefore never ships
 * image bytes. It exists for the two facts an `image` block cannot carry: the
 * per-image upload work-dir path (also given to the model in the result's text
 * envelope) and the captions. Authorization mirrors the platform route: the
 * named session must reference the attachment in one of its own events.
 */
export const IMAGEGEN_IMAGES_API = {
  path: '/api/dsh-tool-imagegen/images',
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
 * input. The plugin no longer renders an upload button of its own (the
 * composer's native attachment picker serves that), but the probe remains for
 * clients that want to know whether a staged reference can be read as an
 * `image` block by the currently selected model.
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
 * the OS opener — the same session-reference authorization as the platform's
 * own attachment route (the tool result's `image` blocks carry the reference).
 * Lets the user view a generated image without hunting for a download.
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
