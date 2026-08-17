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
 * Issue one single-image request. The `n` batch parameter is never sent —
 * Responses-API-based gateways reject it as `tools[0].n` — so a requested
 * count above one is satisfied by parallel single-image requests in
 * {@link generateImage}. The response is kept as a list so a gateway that
 * happens to return several images per call still works.
 */
async function requestOneImage(baseUrl, upstream, request) {
  const model = request.model.trim() === '' ? 'gpt-image-2' : request.model.trim()
  const body = { prompt: request.prompt, model }
  if (request.size !== '' && request.size !== 'auto') body.size = request.size

  let response
  try {
    response = await fetch(`${baseUrl}/images/generations`, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${upstream.apiKey.trim()}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify(body),
      signal: signalWithTimeout(request.signal, UPSTREAM_TIMEOUT_MS),
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    if (/aborter/i.test(message) || /timeout/i.test(message)) {
      throw new ImageGenError('上游接口响应超时（240 秒）', 'upstream-timeout')
    }
    throw new ImageGenError(`无法连接上游接口：${message}`, 'upstream-unreachable')
  }

  let payload
  try {
    payload = await response.json()
  } catch {
    throw new ImageGenError(`上游接口返回了非 JSON 响应（HTTP ${response.status}）`, 'upstream-invalid')
  }
  if (!response.ok || payload === null || typeof payload !== 'object') {
    throw new ImageGenError(upstreamMessage(payload, response.status), 'upstream-rejected')
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

/**
 * Forward one text-to-image request to the configured endpoint. A requested
 * count above one is satisfied with N parallel single-image requests (the `n`
 * batch parameter is never sent), then the results are flattened in order.
 * @param {object} upstream - the resolved upstream config (apiUrl/apiKey).
 * @param {object} request - { model, prompt, size, n, signal? }.
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
      signal: request.signal,
    })),
  )
  return { images: batches.flat() }
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
