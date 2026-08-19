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

import crypto from 'node:crypto'
import { spawn } from 'node:child_process'
import { writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { SettingsConflictError } from '@deepseek-ai/dsh-settings'
import { UPLOAD_ENVELOPE_PREFIX } from './protocol.js'
import { cleanupOrphans, storageStats } from './maintenance.js'
import { saveUpload } from './uploads.js'

/** Cap on JSON request bodies (settings ops and uploads are small). */
const MAX_JSON_BODY_BYTES = 24 * 1024 * 1024

/** Extract a friendly message from an unknown thrown value. */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

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
 * The plugin's image block types. `image` is the platform's own block (native
 * multimodal uploads); `generated-image` and `uploaded-image` are this
 * plugin's model-invisible blocks (generation results, and text-model uploads
 * respectively). The attachment bridge and the image-parameter resolver scan
 * all three.
 */
const IMAGE_BLOCK_TYPES = new Set(['image', 'generated-image', 'uploaded-image'])

/**
 * Find a block referencing the id within one content list, recursing into
 * nested tool results — the plugin's mirror of the platform's `imageBlockIn`
 * scan, over the plugin's block types.
 */
function imageBlockIn(content, attachmentId) {
  if (!Array.isArray(content)) return undefined
  for (const value of content) {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) continue
    const block = value
    if (IMAGE_BLOCK_TYPES.has(block.type) && typeof block.attachment === 'object' && block.attachment !== null) {
      if (String(block.attachment.attachmentId) === attachmentId) return block.attachment
    }
    if (block.type === 'tool-result') {
      const nested = imageBlockIn(block.content, attachmentId)
      if (nested !== undefined) return nested
    }
  }
  return undefined
}

/** Search every durable event carrier for a block referencing the id. */
function imageBlockInEvent(event, attachmentId) {
  const data = event.data
  const direct = imageBlockIn(data.content, attachmentId)
  if (direct !== undefined) return direct
  if (data.message !== undefined) {
    const wrapped = imageBlockIn(data.message.content, attachmentId)
    if (wrapped !== undefined) return wrapped
  }
  if (data.inserted !== undefined) for (const message of data.inserted) {
    const inserted = imageBlockIn(message.content, attachmentId)
    if (inserted !== undefined) return inserted
  }
  return undefined
}

/**
 * Resolve the full attachment ref matching one opaque id by scanning a
 * session's events for any of the plugin's image block types. This is what the
 * attachment bridge uses to authorize byte serving, and what execute() uses to
 * turn a model-supplied attachmentId into the full ref attachments.readImage()
 * requires (readImageFile verifies data.byteLength === ref.bytes, so a bare
 * id is never enough).
 * @returns {object|undefined} the full ref { attachmentId, mediaType, bytes, ... }.
 */
export function referencedImageRef(events, attachmentId) {
  for (const event of events) {
    const found = imageBlockInEvent(event, attachmentId)
    if (found !== undefined) return found
  }
  return undefined
}

/**
 * Build the plugin's attachment bridge route: a loopback-only GET serving the
 * raw bytes of one image, authorized by the same session reference model as
 * the platform route — the id must appear in a `generated-image`,
 * `uploaded-image`, or `image` block within the named session's events.
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
      const ref = referencedImageRef(session.events, attachmentId)
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
 * Build the plugin's upload + capability bridge routes.
 *
 * `upload` accepts a text-model image upload: it persists the bytes in the
 * upload work dir and the attachment store, then enqueues a user message
 * ([uploaded-image] block + model-facing text envelope) into the session via
 * agent.followup — the same publish path apiproxy's prompt RPC uses, so the
 * image renders inline in the conversation while the text-only model only ever
 * sees the envelope (the block type is invisible to model adapters).
 *
 * `capability` answers whether the client's selected provider/model accepts
 * image input (resolved host-side via llm.resolveModelInfo, mirroring
 * apiproxy's own MODEL_DOES_NOT_SUPPORT_IMAGES gate). Unknown models resolve
 * as image-capable so the client falls back to the platform's native upload.
 *
 * @param {object} deps - { uploadPath, capabilityPath, sessions, attachments,
 *   agents, llm }.
 * @returns {Array<object>} the webServer route registrations.
 */
export function makeUploadRoutes(deps) {
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
      path: deps.uploadPath,
      handler: async (req, res) => {
        if (!guard(req, res, 'POST')) return
        const body = await readJsonBody(req)
        if (body === undefined) {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: 'unreadable JSON body' })
          return
        }
        const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
        const mediaType = typeof body.mediaType === 'string' ? body.mediaType : ''
        const data64 = typeof body.data === 'string' ? body.data : ''
        if (sessionId === '') {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: 'missing sessionId' })
          return
        }
        if (mediaType === '' || deps.attachments.imageLimits.mediaTypes.includes(mediaType) === false) {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: `unsupported media type: ${mediaType}` })
          return
        }
        // Decode with a round-trip sanity check (padding-lenient) so garbage
        // base64 never reaches the decoder as a silently-empty buffer.
        let bytes
        try {
          const canonical = data64.replace(/\s+/g, '')
          bytes = Buffer.from(canonical, 'base64')
          const padded = bytes.toString('base64')
          if (bytes.byteLength === 0 || (padded !== canonical && padded.replace(/=+$/, '') !== canonical.replace(/=+$/, ''))) {
            throw new Error('not canonical base64')
          }
        } catch {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: 'malformed image data' })
          return
        }
        if (bytes.byteLength > deps.attachments.imageLimits.maxImageBytes) {
          writeJson(res, 200, {
            ok: false,
            code: 'upload-rejected',
            message: `image too large: ${bytes.byteLength} bytes (max ${deps.attachments.imageLimits.maxImageBytes})`,
          })
          return
        }
        const session = deps.sessions.get(sessionId)
        if (session === undefined) {
          writeJson(res, 404, { error: 'session not found' })
          return
        }
        const agent = deps.agents.get(sessionId)
        if (agent === undefined) {
          writeJson(res, 404, { error: 'agent not found' })
          return
        }
        const filename = typeof body.name === 'string' && body.name.trim() !== ''
          ? body.name.trim().slice(0, 120)
          : 'uploaded-image'
        let stored
        try {
          // saveImage validates media type + pixel cap and decodes dimensions.
          stored = await deps.attachments.saveImage({ data: bytes, mediaType, name: filename })
        } catch (error) {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: `无法保存图片：${messageOf(error)}` })
          return
        }
        let work
        try {
          work = await saveUpload(bytes, mediaType)
        } catch (error) {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: `无法保存上传文件：${messageOf(error)}` })
          return
        }
        const userText = typeof body.text === 'string' ? body.text.trim() : ''
        const envelope = [
          `${UPLOAD_ENVELOPE_PREFIX} 用户上传了参考图片 "${work.name}"（本机路径 ${work.path}）。`,
          `请把这张图当作生图参考：后续调用 generate_image 时，把 image 参数设为 "${work.path}"。`,
          `用户接下来的要求：${userText === '' ? '（暂无文字说明，请先向用户确认要如何修改或生成这张图）' : userText}`,
        ].join('')
        const message = {
          id: crypto.randomUUID(),
          role: 'user',
          content: [
            { type: 'uploaded-image', attachment: stored, path: work.path, filename: work.name },
            { type: 'text', text: envelope },
          ],
          source: { kind: 'user' },
        }
        try {
          agent.followup(message)
        } catch (error) {
          writeJson(res, 200, { ok: false, code: 'upload-rejected', message: `无法投递消息：${messageOf(error)}` })
          return
        }
        writeJson(res, 200, {
          ok: true,
          attachment: {
            attachmentId: stored.attachmentId,
            mediaType: stored.mediaType,
            bytes: stored.bytes,
            width: stored.width,
            height: stored.height,
          },
          path: work.path,
          filename: work.name,
        })
      },
    },
    {
      kind: 'exact',
      path: deps.capabilityPath,
      handler: async (req, res) => {
        if (!guard(req, res, 'POST')) return
        const body = await readJsonBody(req)
        if (body === undefined) {
          writeJson(res, 200, { ok: false, code: 'capability-rejected', message: 'unreadable JSON body' })
          return
        }
        const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
        const provider = typeof body.provider === 'string' ? body.provider : ''
        const model = typeof body.model === 'string' ? body.model : ''
        if (sessionId === '') {
          writeJson(res, 200, { ok: false, code: 'capability-rejected', message: 'missing sessionId' })
          return
        }
        if (provider === '' || model === '') {
          writeJson(res, 200, { ok: false, code: 'capability-rejected', message: 'missing provider or model' })
          return
        }
        const session = deps.sessions.get(sessionId)
        if (session === undefined) {
          writeJson(res, 404, { error: 'session not found' })
          return
        }
        let imageCapable = true
        let inputModalities
        try {
          const info = await deps.llm.resolveModelInfo(provider, model)
          inputModalities = info.inputModalities
          // Mirror apiproxy's gate: unknown modality counts as capable.
          imageCapable = !(info.inputModalities !== undefined && info.inputModalities.includes('image') === false)
        } catch {
          imageCapable = true
        }
        writeJson(res, 200, {
          ok: true,
          imageCapable,
          ...inputModalities === undefined ? {} : { inputModalities },
        })
      },
    },
  ]
}

/**
 * Build the plugin's storage-maintenance bridge routes: `stats` reports the
 * upload work dir + attachment store sizes, `cleanup` prunes files not
 * referenced by any session (live or persisted) and reports what was freed.
 * Both are loopback-fenced, same as the settings bridge.
 * @param {object} deps - { statsPath, cleanupPath, sessions }.
 * @returns {Array<object>} the webServer route registrations.
 */
export function makeMaintenanceRoutes(deps) {
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
      path: deps.statsPath,
      handler: async (req, res) => {
        if (!guard(req, res, 'POST')) return
        try {
          const stats = await storageStats()
          writeJson(res, 200, { ok: true, ...stats })
        } catch (error) {
          writeJson(res, 200, { ok: false, code: 'maintenance-failed', message: messageOf(error) })
        }
      },
    },
    {
      kind: 'exact',
      path: deps.cleanupPath,
      handler: async (req, res) => {
        if (!guard(req, res, 'POST')) return
        try {
          const result = await cleanupOrphans(deps.sessions)
          writeJson(res, 200, { ok: true, ...result })
        } catch (error) {
          writeJson(res, 200, { ok: false, code: 'maintenance-failed', message: messageOf(error) })
        }
      },
    },
  ]
}

/** Extension for one media type when naming the temp file (fallback png). */
function extensionOf(mediaType) {
  switch (mediaType) {
    case 'image/jpeg': return 'jpg'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    default: return 'png'
  }
}

/**
 * Temp-file name for one attachment: derived from the attachment id only
 * (never from client-controlled names), with every character Windows file
 * names reject replaced by `_`. The platform's attachment ids look like
 * "sha256:<hex>" — the colon would make NTFS treat the rest of the name as an
 * alternate data stream, so the write would silently land on a stream and the
 * opener would find no such file.
 */
export function tempFileName(attachmentId, mediaType) {
  const safe = attachmentId.replace(/[^a-zA-Z0-9._-]/g, '_')
  return `dsh-imagegen-${safe}.${extensionOf(mediaType)}`
}

/**
 * Build the plugin's local-open bridge route: copy one referenced image to a
 * host-side temp file and hand it to the system's default image viewer, so the
 * user can look at a generated image without hunting for a download. The temp
 * file name derives from the attachment id only (never from client-controlled
 * names), the session-reference authorization is the same as the attachment
 * route, and the opener runs detached so the web server never blocks on the
 * viewer process.
 * @param {object} deps - { path, sessions, attachments }.
 * @returns {object} the webServer route registration.
 */
export function makeOpenRoute(deps) {
  return {
    kind: 'exact',
    path: deps.path,
    handler: async (req, res) => {
      if (!isLoopbackRequest(req)) {
        writeJson(res, 403, { error: 'forbidden: loopback-only' })
        return
      }
      if (req.method !== 'POST') {
        writeJson(res, 405, { error: `method not allowed: ${req.method}` })
        return
      }
      const body = await readJsonBody(req)
      if (body === undefined) {
        writeJson(res, 200, { ok: false, code: 'open-rejected', message: 'unreadable JSON body' })
        return
      }
      const sessionId = typeof body.sessionId === 'string' ? body.sessionId : ''
      const attachmentId = typeof body.attachmentId === 'string' ? body.attachmentId : ''
      if (sessionId === '' || attachmentId === '') {
        writeJson(res, 200, { ok: false, code: 'open-rejected', message: 'missing sessionId or attachmentId' })
        return
      }
      const session = deps.sessions.get(sessionId)
      if (session === undefined) {
        writeJson(res, 404, { error: 'session not found' })
        return
      }
      const ref = referencedImageRef(session.events, attachmentId)
      if (ref === undefined) {
        writeJson(res, 404, { error: 'image not referenced by this session' })
        return
      }
      let stored
      try {
        stored = await deps.attachments.readImage(ref)
      } catch (error) {
        writeJson(res, 200, { ok: false, code: 'open-failed', message: `无法读取图片附件：${messageOf(error)}` })
        return
      }
      const mediaType = typeof ref.mediaType === 'string' && ref.mediaType !== '' ? ref.mediaType : 'image/png'
      const filePath = join(tmpdir(), tempFileName(attachmentId, mediaType))
      try {
        await writeFile(filePath, stored.data)
      } catch (error) {
        writeJson(res, 200, { ok: false, code: 'open-failed', message: `无法写入临时文件：${messageOf(error)}` })
        return
      }
      // Fire-and-forget: detach the opener so an image viewer process never
      // holds the web server (and never blocks a retry of this route). The
      // path goes in as a plain argv entry — never hand-quoted — so node's
      // own Windows argument serialization quotes it exactly once; a
      // pre-quoted arg gets wrapped a second time by libuv and cmd's
      // quote-stripping mangles it ("Windows 找不到文件").
      const opener = process.platform === 'win32'
        ? spawn('cmd', ['/c', 'start', '', filePath], { detached: true, stdio: 'ignore' })
        : process.platform === 'darwin'
          ? spawn('open', [filePath], { detached: true, stdio: 'ignore' })
          : spawn('xdg-open', [filePath], { detached: true, stdio: 'ignore' })
      opener.unref()
      writeJson(res, 200, { ok: true, path: filePath })
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
