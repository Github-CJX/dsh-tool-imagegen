/**
 * The /api/dsh-tool-imagegen route family: a loopback-only bridge for the
 * plugin's own settings namespace (describe/mutate) and for generated-image
 * bytes (attachment). The settings half mirrors the dsh-web-ui family bridge
 * wire. There is no generation proxy route — the tool calls the upstream
 * directly host-side; these routes exist only so the settings card in the
 * GUI can read and write the plugin's namespace on the host settings seam,
 * and so the inline view can render generated images the platform's own
 * attachment authorization would not serve (`generated-image` blocks, not
 * `image` blocks — see {@link makeAttachmentRoute}).
 *
 * Security: every handler is loopback-fenced (same-origin browser on this
 * machine only), and describe() runs with redactSecrets so the API key never
 * crosses to the client.
 */

import { SettingsConflictError } from '@deepseek-ai/dsh-settings'

/** Cap on JSON request bodies (settings ops are small). */
const MAX_JSON_BODY_BYTES = 24 * 1024 * 1024

/** Loopback literal check plus browser same-origin markers (mirrors dsh-ssh). */
function isLoopbackRequest(request) {
  const address = request.socket.remoteAddress
  if (address !== '127.0.0.1' && address !== '::1' && address !== '::ffff:127.0.0.1') return false
  const host = request.headers.host
  if (typeof host !== 'string') return false
  let hostUrl
  try {
    hostUrl = new URL(`http://${host}`)
  } catch {
    return false
  }
  if (hostUrl.hostname !== '127.0.0.1' && hostUrl.hostname !== 'localhost' && hostUrl.hostname !== '[::1]') return false
  if (request.headers['sec-fetch-site'] === 'cross-site') return false
  const origin = request.headers.origin
  if (origin === undefined) return true
  try {
    return new URL(origin).host === hostUrl.host
  } catch {
    return false
  }
}

/** One JSON response. */
function writeJson(res, status, body) {
  const payload = JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8', 'referrer-policy': 'no-referrer' })
  res.end(payload)
}

/** Read a JSON request body (undefined when too large or unparseable). */
async function readJsonBody(req, maxBytes = MAX_JSON_BODY_BYTES) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    const buffer = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)
    size += buffer.length
    if (size > maxBytes) return undefined
    chunks.push(buffer)
  }
  try {
    const parsed = JSON.parse(Buffer.concat(chunks).toString('utf8'))
    return typeof parsed === 'object' && parsed !== null ? parsed : undefined
  } catch {
    return undefined
  }
}

/** Project one settings descriptor onto the bridge wire view. */
function toView(descriptor) {
  return {
    ns: String(descriptor.ns),
    schema: descriptor.schema,
    value: descriptor.value,
    ...descriptor.base === undefined ? {} : { base: descriptor.base },
    ...descriptor.user === undefined ? {} : { user: descriptor.user },
    ...descriptor.secrets === undefined ? {} : {
      secrets: descriptor.secrets.map(secret => ({ path: [...secret.path], set: secret.set })),
    },
    revision: descriptor.revision,
  }
}

/** Map a seam failure onto the bridge refusal envelope. */
function failureOf(error) {
  if (error instanceof SettingsConflictError) {
    return { ok: false, code: 'settings-conflict', message: error.message }
  }
  const message = error instanceof Error ? error.message : String(error)
  return { ok: false, code: 'settings-rejected', message }
}

/**
 * Find a `generated-image` block referencing the id within one content list,
 * recursing into nested tool results — the plugin's mirror of the platform's
 * `imageBlockIn` scan, over this plugin's block type.
 */
function generatedImageIn(content, attachmentId) {
  if (!Array.isArray(content)) return undefined
  for (const value of content) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) continue
    const block = value
    if (block.type === 'generated-image' && typeof block.attachment === 'object' && block.attachment !== null) {
      if (String(block.attachment.attachmentId) === attachmentId) return block.attachment
    }
    if (block.type === 'tool-result') {
      const nested = generatedImageIn(block.content, attachmentId)
      if (nested !== undefined) return nested
    }
  }
  return undefined
}

/** Search every durable event carrier for a generated-image block. */
function generatedImageInEvent(event, attachmentId) {
  const data = event.data
  const direct = generatedImageIn(data.content, attachmentId)
  if (direct !== undefined) return direct
  if (data.message !== undefined) {
    const wrapped = generatedImageIn(data.message.content, attachmentId)
    if (wrapped !== undefined) return wrapped
  }
  if (data.inserted !== undefined) for (const message of data.inserted) {
    const inserted = generatedImageIn(message.content, attachmentId)
    if (inserted !== undefined) return inserted
  }
  return undefined
}

/** Resolve the generated-image reference matching one opaque id. */
function referencedGeneratedImage(events, attachmentId) {
  for (const event of events) {
    const found = generatedImageInEvent(event, attachmentId)
    if (found !== undefined) return found
  }
  return undefined
}

/**
 * Build the plugin's attachment bridge route: a loopback-only GET serving the
 * raw bytes of one generated image, authorized by the same session reference
 * model as the platform route — the id must appear in a `generated-image`
 * block within the named session's events.
 * @param {object} deps - { path, sessions, attachments }.
 * @returns {object} the webServer route registration.
 */
export function makeAttachmentRoute(deps) {
  const guard = (req, res, method) => {
    if (!isLoopbackRequest(req)) {
      writeJson(res, 403, { error: 'forbidden: loopback-only' })
      return false
    }
    if (req.method !== method) {
      writeJson(res, 405, { error: `method not allowed: ${req.method}` })
      return false
    }
    return true
  }

  return {
    kind: 'exact',
    path: deps.path,
    handler: async (req, res) => {
      if (!guard(req, res, 'GET')) return
      let url
      try {
        url = new URL(req.url, 'http://127.0.0.1')
      } catch {
        writeJson(res, 400, { error: 'malformed request URL' })
        return
      }
      const sessionId = url.searchParams.get('session') ?? ''
      const attachmentId = url.searchParams.get('id') ?? ''
      if (sessionId === '' || attachmentId === '') {
        writeJson(res, 400, { error: 'missing session or id' })
        return
      }
      const session = deps.sessions.get(sessionId)
      if (session === undefined) {
        writeJson(res, 404, { error: 'session not found' })
        return
      }
      const ref = referencedGeneratedImage(session.events, attachmentId)
      if (ref === undefined) {
        writeJson(res, 404, { error: 'image not referenced by this session' })
        return
      }
      try {
        const stored = await deps.attachments.readImage(ref)
        res.writeHead(200, {
          'content-type': typeof ref.mediaType === 'string' ? ref.mediaType : 'image/png',
          'referrer-policy': 'no-referrer',
        })
        res.end(stored.data)
      } catch (error) {
        writeJson(res, 500, { error: 'unable to read image attachment' })
      }
    },
  }
}

/**
 * Build the plugin's settings bridge routes.
 * @param {object} deps - { settings, namespace, namespaceObject, describePath, mutatePath }.
 * @returns {Array<object>} the webServer route registrations.
 */
export function makeRoutes(deps) {
  const guard = (req, res, method) => {
    if (!isLoopbackRequest(req)) {
      writeJson(res, 403, { error: 'forbidden: loopback-only' })
      return false
    }
    if (req.method !== method) {
      writeJson(res, 405, { error: `method not allowed: ${req.method}` })
      return false
    }
    return true
  }

  return [
    {
      kind: 'exact',
      path: deps.describePath,
      handler: async (req, res) => {
        if (!guard(req, res, 'POST')) return
        const descriptor = deps.settings.describe({ redactSecrets: true })
          .find(candidate => String(candidate.ns) === deps.namespace)
        writeJson(res, 200, {
          ok: true,
          value: {
            namespaces: descriptor === undefined ? [] : [toView(descriptor)],
            writable: deps.settings.writable !== false,
          },
        })
      },
    },
    {
      kind: 'exact',
      path: deps.mutatePath,
      handler: async (req, res) => {
        if (!guard(req, res, 'POST')) return
        const body = await readJsonBody(req)
        if (body === undefined) {
          writeJson(res, 200, { ok: false, code: 'settings-rejected', message: 'unreadable JSON body' })
          return
        }
        const ns = typeof body.ns === 'string' ? body.ns : ''
        if (ns !== deps.namespace || !Array.isArray(body.ops)) {
          writeJson(res, 200, { ok: false, code: 'settings-rejected', message: 'malformed bridge settings request' })
          return
        }
        const expectedRevision = typeof body.expectedRevision === 'number' ? body.expectedRevision : undefined
        try {
          await deps.settings.mutate(deps.namespaceObject, body.ops, expectedRevision)
        } catch (error) {
          writeJson(res, 200, failureOf(error))
          return
        }
        const descriptor = deps.settings.describe({ redactSecrets: true })
          .find(candidate => String(candidate.ns) === ns)
        if (descriptor === undefined) {
          writeJson(res, 200, { ok: false, code: 'internal', message: `settings namespace "${ns}" was disposed after the mutate` })
          return
        }
        writeJson(res, 200, { ok: true, value: toView(descriptor) })
      },
    },
  ]
}
