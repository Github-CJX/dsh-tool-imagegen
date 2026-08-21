/**
 * Upstream proxy engine: forwards a text-to-image request to the configured
 * OpenAI-compatible /images/generations endpoint and normalizes the response
 * to base64 payloads, so the API key never leaves the host and the browser
 * never fetches the upstream itself (no CORS, no key exposure).
 *
 * Framework-free (no cordis imports) so the tool and tests can drive it
 * directly. Adapted from the old dsh-imagegen engine with the edit-mode and
 * panel-only knobs (quality / detail) dropped — this plugin is a model-facing
 * tool, so the surface is prompt / size / n / model.
 */

/** A generation failure with a user-presentable message. */
export class ImageGenError extends Error {
  /** Stable wire code. */
  constructor(message, code = 'generate-failed') {
    super(message)
    this.name = 'ImageGenError'
    this.code = code
  }
}

/** Total budget for one upstream generation call (image models are slow). */
const UPSTREAM_TIMEOUT_MS = 240_000

/** Budget for downloading one result image URL. */
const IMAGE_FETCH_TIMEOUT_MS = 60_000

/**
 * Sniff an image's media type from its magic bytes (PNG / JPEG / GIF / WebP).
 * Returns undefined when unrecognized; callers fall back to 'image/png'. Used
 * to recover the mime of a work-dir reference image when no attachment block
 * is in scope.
 * @param {Buffer|Uint8Array} data - the image bytes.
 * @returns {string|undefined} a media type, or undefined when unrecognized.
 */
export function sniffMediaType(data) {
  const bytes = Buffer.isBuffer(data) ? new Uint8Array(data) : new Uint8Array(data)
  if (bytes.length >= 8 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
      && bytes[4] === 0x0d && bytes[5] === 0x0a && bytes[6] === 0x1a && bytes[7] === 0x0a) return 'image/png'
  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return 'image/jpeg'
  if (bytes.length >= 4 && bytes[0] === 0x47 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x38) return 'image/gif'
  if (bytes.length >= 12 && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46
      && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50) return 'image/webp'
  return undefined
}

/** Content-type extension hints for URL-fetched images. */
function mimeOfExtension(path) {
  const match = /\.([a-z0-9]+)$/i.exec(path)
  if (match === null) return undefined
  switch (match[1].toLowerCase()) {
    case 'png': return 'image/png'
    case 'jpg':
    case 'jpeg': return 'image/jpeg'
    case 'webp': return 'image/webp'
    case 'gif': return 'image/gif'
    default: return undefined
  }
}

/** Parse `data:<mime>;base64,<payload>` into its parts; undefined when malformed. */
function parseDataUrl(dataUrl) {
  const match = /^data:([^;,]+)?(;base64)?,(.*)$/s.exec(dataUrl.trim())
  if (match === null || match[3] === undefined) return undefined
  if (match[2] === undefined) return undefined // plain (non-base64) data URLs unsupported
  return { mime: match[1] ?? 'application/octet-stream', base64: match[3] }
}

/** Strip a data: prefix from an upstream b64 payload if a gateway added one. */
function bareBase64(value) {
  const parsed = parseDataUrl(value)
  return parsed !== undefined && parsed.base64 !== undefined ? parsed.base64 : value
}

/** Clamp the requested image count into the API-accepted range. */
function clampCount(n) {
  if (!Number.isFinite(n)) return 1
  return Math.min(4, Math.max(1, Math.round(n)))
}

/**
 * Resolve one optional string parameter: a non-empty string survives, anything
 * else (empty / whitespace / non-string) becomes undefined so the field is not
 * sent. Unlike `size`, the 'auto' literal is a legitimate enum value for
 * background/watermark and MUST be forwarded — see {@link requestOneImage}.
 */
function nonEmpty(v) {
  return typeof v === 'string' && v.trim() !== '' ? v.trim() : undefined
}

/**
 * Resolve the optional upstream parameters for one call: a model-first merge
 * (an explicit model arg wins, else the user's setting, else '' = omit the
 * field and let the upstream default apply). Every optional parameter is
 * switch-gated: while its enable switch is off it is forced empty — it must
 * not reach the upstream even if a stale client passes it. The switches are
 * the settings card's "check the box to use this parameter" interaction
 * (default off for all six).
 * @param {object} cfg - the resolved config: the six option strings plus the
 *   six `quality_enabled` / `output_format_enabled` / `background_enabled` /
 *   `style_enabled` / `moderation_enabled` / `watermark_enabled` booleans.
 * @param {object} args - the model's tool arguments (each may be undefined).
 * @returns {object} the six resolved strings; '' means "not forwarded".
 */
export function resolveOptionalParams(cfg, args) {
  const str = value => typeof value === 'string' ? value.trim() : ''
  const gated = (name, value) => cfg[`${name}_enabled`] === true ? (str(value) || cfg[name]) : ''
  return {
    quality: gated('quality', args.quality),
    output_format: gated('output_format', args.output_format),
    background: gated('background', args.background),
    style: gated('style', args.style),
    moderation: gated('moderation', args.moderation),
    watermark: gated('watermark', args.watermark),
  }
}

/** Combine an optional caller signal with a timeout into one abort signal. */
function signalWithTimeout(signal, timeoutMs) {
  const timeout = AbortSignal.timeout(timeoutMs)
  return signal === undefined ? timeout : AbortSignal.any([signal, timeout])
}

/** Normalize one upstream data item into a base64 image. */
async function normalizeItem(item, upstream, signal) {
  const revisedPrompt = typeof item.revised_prompt === 'string' ? item.revised_prompt : undefined
  if (typeof item.b64_json === 'string') {
    return { b64: bareBase64(item.b64_json), mime: 'image/png', revisedPrompt }
  }
  if (typeof item.url !== 'string' || item.url === '') {
    throw new ImageGenError('upstream image item has neither b64_json nor url')
  }
  const url = item.url
  if (url.startsWith('data:')) {
    const parsed = parseDataUrl(url)
    if (parsed === undefined) throw new ImageGenError('upstream returned a malformed data: url')
    return { b64: parsed.base64, mime: parsed.mime, revisedPrompt }
  }
  let response
  try {
    response = await fetch(url, {
      headers: {
        ...upstream.apiKey === '' ? {} : { authorization: `Bearer ${upstream.apiKey}` },
      },
      signal: signalWithTimeout(signal, IMAGE_FETCH_TIMEOUT_MS),
    })
  } catch (error) {
    throw new ImageGenError(`failed to fetch the generated image url: ${error instanceof Error ? error.message : String(error)}`)
  }
  if (!response.ok) {
    throw new ImageGenError(`failed to fetch the generated image url: HTTP ${response.status}`)
  }
  const buffer = Buffer.from(await response.arrayBuffer())
  const contentType = response.headers.get('content-type')
  const mime = contentType !== null && contentType !== ''
    ? contentType.split(';')[0].trim()
    : mimeOfExtension(url) ?? 'image/png'
  return { b64: buffer.toString('base64'), mime, revisedPrompt }
}

/**
 * Issue one single-image request, retrying transient failures. Text-to-image
 * posts JSON to /images/generations; image-to-image posts multipart form-data
 * (image file + prompt) to the standard OpenAI-compatible /images/edits
 * endpoint — passing the image as a JSON `input_image` parameter on
 * /images/generations is not accepted by OpenAI-shaped gateways ("Unknown
 * parameter: 'input_image'"), while /images/edits is the portable path every
 * OpenAI-compatible relay implements. The `n` batch parameter is never sent —
 * Responses-API-based gateways reject it as `tools[0].n` — so a requested
 * count above one is satisfied by parallel single-image requests in
 * {@link generateImage}. The response is kept as a list so a gateway that
 * happens to return several images per call still works.
 */
async function requestOneImage(baseUrl, upstream, request) {
  const attempt = async () => {
    const model = request.model.trim() === '' ? 'gpt-image-2' : request.model.trim()
    // `size` drops the 'auto' literal — it is NOT a valid canvas size and a
    // strict gateway rejects it. The optional quality/style/etc. parameters
    // below use `nonEmpty` instead: for those, 'auto' IS a legal enum value
    // (background: transparent|opaque|auto, watermark: triw|none|auto) and some
    // gateways distinguish an explicit 'auto' from an omitted field, so it must
    // be forwarded verbatim.
    const size = request.size !== '' && request.size !== 'auto' ? request.size : undefined
    const quality = nonEmpty(request.quality)
    const outputFormat = nonEmpty(request.output_format)
    const background = nonEmpty(request.background)
    const style = nonEmpty(request.style)
    const moderation = nonEmpty(request.moderation)
    const watermark = nonEmpty(request.watermark)

    let url
    let headers = {}
    let body
    if (request.image !== undefined && request.image !== null
        && typeof request.image.b64 === 'string' && request.image.b64 !== '') {
      const mime = typeof request.image.mime === 'string' && request.image.mime !== ''
        ? request.image.mime
        : 'image/png'
      const ext = mime === 'image/jpeg' ? 'jpg'
        : mime === 'image/webp' ? 'webp'
          : mime === 'image/gif' ? 'gif'
            : 'png'
      const form = new FormData()
      form.append('model', model)
      form.append('prompt', request.prompt)
      if (size !== undefined) form.append('size', size)
      if (quality !== undefined) form.append('quality', quality)
      if (outputFormat !== undefined) form.append('output_format', outputFormat)
      if (background !== undefined) form.append('background', background)
      if (style !== undefined) form.append('style', style)
      if (moderation !== undefined) form.append('moderation', moderation)
      if (watermark !== undefined) form.append('watermark', watermark)
      form.append('image', new Blob([Buffer.from(request.image.b64, 'base64')], { type: mime }), `reference.${ext}`)
      url = `${baseUrl}/images/edits`
      body = form
    } else {
      const jsonBody = { prompt: request.prompt, model }
      if (size !== undefined) jsonBody.size = size
      if (quality !== undefined) jsonBody.quality = quality
      if (outputFormat !== undefined) jsonBody.output_format = outputFormat
      if (background !== undefined) jsonBody.background = background
      if (style !== undefined) jsonBody.style = style
      if (moderation !== undefined) jsonBody.moderation = moderation
      if (watermark !== undefined) jsonBody.watermark = watermark
      url = `${baseUrl}/images/generations`
      headers = { 'content-type': 'application/json' }
      body = JSON.stringify(jsonBody)
    }

    let response
    try {
      response = await fetch(url, {
        method: 'POST',
        headers: {
          authorization: `Bearer ${upstream.apiKey.trim()}`,
          ...headers,
        },
        body,
        signal: signalWithTimeout(request.signal, UPSTREAM_TIMEOUT_MS),
      })
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error)
      if (/aborter/i.test(message) || /timeout/i.test(message)) {
        throw new ImageGenError('上游接口响应超时（240 秒）', 'upstream-timeout')
      }
      throw new ImageGenError(`无法连接上游接口：${message}`, 'upstream-unreachable')
    }

    // Status first: a 5xx gateway failure (often with an HTML/empty body)
    // must be rejected before body parsing so the retry loop can re-run it;
    // a 4xx is a contract or auth problem that retrying can never fix.
    if (!response.ok) {
      if (response.status >= 500) {
        throw new ImageGenError(`上游接口临时故障（HTTP ${response.status}）`, 'upstream-5xx')
      }
      let payload
      try {
        payload = await response.json()
      } catch {
        // unparseable 4xx body: fall through with an undefined payload
      }
      throw new ImageGenError(upstreamMessage(payload, response.status), 'upstream-rejected')
    }

    let payload
    try {
      payload = await response.json()
    } catch {
      throw new ImageGenError(`上游接口返回了非 JSON 响应（HTTP ${response.status}）`, 'upstream-invalid')
    }
    if (payload === null || typeof payload !== 'object') {
      throw new ImageGenError(`上游接口返回了非 JSON 响应（HTTP ${response.status}）`, 'upstream-invalid')
    }

    const data = Array.isArray(payload.data)
      ? payload.data
      : Array.isArray(payload.images)
        ? payload.images
        : Array.isArray(payload.output)
          ? payload.output
          : undefined
    if (data === undefined) {
      throw new ImageGenError('上游响应缺少 data 数组', 'upstream-invalid')
    }
    if (data.length === 0) {
      throw new ImageGenError('上游返回了 0 张图片', 'upstream-empty')
    }
    return Promise.all(data.map(async (entry) => {
      if (entry === null || typeof entry !== 'object') {
        throw new ImageGenError('上游响应包含无效的图片条目', 'upstream-invalid')
      }
      return normalizeItem(entry, upstream, request.signal)
    }))
  }
  return withRetry(attempt, {
    maxRetries: request.maxRetries,
    retryDelayMs: request.retryDelayMs,
    signal: request.signal,
  })
}

/**
 * Forward one text-to-image (or image-to-image) request to the configured
 * endpoint. A requested count above one is satisfied with N parallel
 * single-image requests (the `n` batch parameter is never sent), then the
 * results are flattened in order.
 * @param {object} upstream - the resolved upstream config (apiUrl/apiKey).
 * @param {object} request - { model, prompt, size, n, image?, signal?,
 *   maxRetries?, retryDelayMs?, quality?, output_format?, background?, style?,
 *   moderation?, watermark? } where image is { b64, mime } for image-to-image,
 *   maxRetries/retryDelayMs tune the transient-failure retry (defaults: 3
 *   retries, 800 ms exponential backoff), and the optional quality/output_format/
 *   background/style/moderation/watermark strings mirror the OpenAI Images API
 *   query parameters (forwarded verbatim when non-empty; an empty string means
 *   "let the upstream default apply").
 * @returns {Promise<{images: Array<{b64: string, mime: string, revisedPrompt?: string}>}>}
 */
export async function generateImage(upstream, request) {
  const baseUrl = upstream.apiUrl.trim().replace(/\/+$/, '')
  if (baseUrl === '') throw new ImageGenError('api_url 未配置：请先在「设置 → 插件 → 可配置」中填写', 'config-missing')
  if (upstream.apiKey.trim() === '') throw new ImageGenError('api_key 未配置：请先在「设置 → 插件 → 可配置」中填写', 'config-missing')
  if (request.prompt.trim() === '') throw new ImageGenError('prompt 不能为空', 'bad-request')
  if (request.prompt.length > 2000) throw new ImageGenError('prompt 超过 2000 字符上限', 'bad-request')
  const count = clampCount(request.n)
  const batches = await Promise.all(
    Array.from({ length: count }, () => requestOneImage(baseUrl, upstream, {
      model: request.model,
      prompt: request.prompt.trim(),
      size: request.size,
      image: request.image,
      signal: request.signal,
      maxRetries: request.maxRetries,
      retryDelayMs: request.retryDelayMs,
      quality: request.quality,
      output_format: request.output_format,
      background: request.background,
      style: request.style,
      moderation: request.moderation,
      watermark: request.watermark,
    })),
  )
  return { images: batches.flat() }
}

/** Transient failure codes the retry loop re-runs. */
const RETRYABLE_CODES = new Set(['upstream-unreachable', 'upstream-timeout', 'upstream-5xx'])

/** Default automatic retry budget for transient upstream failures. */
const MAX_RETRIES = 3

/** Base backoff delay; doubles after every failed attempt. */
const RETRY_BASE_DELAY_MS = 800

/** Promisified setTimeout for the backoff pauses. */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

/**
 * Run one attempt up to maxRetries more times when it fails with a transient
 * error (network / timeout / 5xx gateway). 4xx and contract errors are never
 * retried — retrying cannot fix a bad request, a wrong model name, or a bad
 * key. The caller's abort signal stops further attempts. After the budget is
 * exhausted the last error is rethrown with a retry-count note.
 * @param {() => Promise<*>} attempt - one full request+parse cycle.
 * @param {object} options - { maxRetries?, retryDelayMs?, signal? }.
 * @returns {Promise<*>} the first non-transient result.
 */
async function withRetry(attempt, { maxRetries = MAX_RETRIES, retryDelayMs = RETRY_BASE_DELAY_MS, signal } = {}) {
  let lastError
  for (let attemptNumber = 0; attemptNumber <= maxRetries; attemptNumber += 1) {
    if (attemptNumber > 0) await sleep(retryDelayMs * 2 ** (attemptNumber - 1))
    try {
      return await attempt()
    } catch (error) {
      lastError = error
      if (!(error instanceof ImageGenError) || RETRYABLE_CODES.has(error.code) === false) throw error
      if (signal !== undefined && signal.aborted) throw error
    }
  }
  const message = lastError instanceof Error ? lastError.message : String(lastError)
  throw new ImageGenError(`${message}（已自动重试 ${maxRetries} 次）`, lastError instanceof ImageGenError ? lastError.code : 'upstream-unreachable')
}

/** Human-readable failure message from an upstream error payload. */
function upstreamMessage(payload, status) {
  if (payload !== null && typeof payload === 'object') {
    const error = payload.error
    if (error !== null && typeof error === 'object') {
      const message = error.message
      if (typeof message === 'string' && message !== '') return message
    }
    if (typeof payload.message === 'string' && payload.message !== '') return payload.message
    if (typeof payload.error === 'string' && payload.error !== '') return payload.error
  }
  return `上游接口拒绝请求（HTTP ${status}）`
}
