/**
 * dsh-tool-imagegen — host half. A model-facing image-generation tool.
 *
 * The tool renders its results as `generated-image` content blocks (never
 * `image` blocks), so the picture is shown inline in the conversation while
 * the session history stays free of blocks that a text-only model adapter
 * would reject (`contentHasImage` matches only `type:'image'`, and pi-ai's
 * toolResultText skips unknown block types) — the plugin works identically
 * for models with and without image input.
 *
 * Settings (api_url / api_key / model / size / n) live on the host settings
 * seam under the `dsh-imagegen` namespace — the same namespace the old
 * @dickpy/dsh-imagegen plugin wrote, so existing settings.yaml config
 * inherits automatically — and are editable in the GUI at 设置 → 插件 →
 * 可配置 through a loopback-only bridge. The API key never leaves the host.
 */

import { installSettingsSection, settingsNamespace } from '@deepseek-ai/dsh-settings'
import z from 'schemastery'
import { ATTACHMENT_API, CAPABILITY_API, DEFAULT_MODEL, IMAGEGEN_SETTINGS_NAMESPACE, MAINTENANCE_API, OPEN_API, SETTINGS_API, UPLOAD_API } from './protocol.js'
import { makeAttachmentRoute, makeMaintenanceRoutes, makeOpenRoute, makeRoutes, makeUploadRoutes, referencedImageRef } from './routes.js'
import { generateImage, sniffMediaType } from './engine.js'
import { readUpload } from './uploads.js'

/** Stable cordis plugin name (matches cordis.patch.yml id). */
export const name = 'dsh-tool-imagegen'

/** Services required before the surfaces can mount. */
export const inject = ['webServer', 'systemPrompt', 'tools', 'attachments', 'sessions', 'agents', 'llm']

/** The branded settings namespace of this plugin (the card edits it). */
export const ImageGenSettingsNamespace = settingsNamespace(IMAGEGEN_SETTINGS_NAMESPACE)

/** Plugin config, validated by the same-named schemastery schema. */
export const Config = z.object({
  /** Master switch for the tool. */
  enabled: z.boolean().default(true),
  /** Announce the plugin in every agent's system prompt. */
  announceToAgent: z.boolean().default(true),
  /** Base URL of the OpenAI-compatible endpoint, e.g. https://api.openai.com/v1 */
  apiUrl: z.string().default(''),
  /** Bearer API key (stored as a secret field on the settings seam). */
  apiKey: z.string().role('secret').default(''),
  /** Upstream model name; default gpt-image-2, user-editable. */
  model: z.string().default(DEFAULT_MODEL),
  /** Canvas size, e.g. '1024x1024'. */
  size: z.string().default('1024x1024'),
  /** Number of images, clamped to 1-4. */
  n: z.number().default(1),
})

/** Schema defaults, re-read for hand-built contexts. */
const DEFAULTS = {
  enabled: true,
  announceToAgent: true,
  apiUrl: '',
  apiKey: '',
  model: DEFAULT_MODEL,
  size: '1024x1024',
  n: 1,
}

/** Order of the announcement section within the tool-guidance band. */
const SECTION_ORDER = 150

/** Model-facing announcement: plugin presence, capabilities, and limits. */
export const IMAGEGEN_GUIDANCE = '本机已安装 dsh-tool-imagegen 插件（对话内联生图）：当用户要求「生图 / 画 / 绘画 / 生成图片 / 插画 / 海报 / 头像 / 生成一张图 / 把这张图改成… / 基于这张图生成…」等时，调用 generate_image 工具。能力：对接 OpenAI 兼容图像生成 API（默认模型 gpt-image-2，可在「设置 → 插件 → 可配置」中修改）；请求参数为提示词 prompt、可选尺寸 size（如 1024x1024）与张数 n（1-4，默认 1）。图生图：当用户上传/引用了一张参考图，generate_image 的可选参数 image 用于传入该图——取值为参考图的附件 ID（attachmentId），或插件上传目录中的完整路径（对话中的文字信封会给出该路径）；传入后引擎会以图生图方式处理（input_image），例如根据参考图重绘、改风格、改局部内容。生成结果会以图片形式直接显示在对话中；工具结果里的文字信封只是为了告知结果，回复用户时不要使用 markdown 图片语法（如 ![...](...)）、不要引用或嵌入图片。API 地址与密钥在 GUI「设置 → 插件 → 可配置」中配置，密钥仅存于本机设置文档，不进入浏览器。限制：生成消耗上游 API 额度；内容由上游模型生成，可能不符合预期或包含不适宜内容；若上游返回模型不存在/参数错误（HTTP 400），请告知用户在设置页修改 model 或尺寸后再试。'

/** Resolved config with defaults applied. */
export function resolveConfig(value = {}) {
  return {
    enabled: value.enabled ?? DEFAULTS.enabled,
    announceToAgent: value.announceToAgent ?? DEFAULTS.announceToAgent,
    apiUrl: typeof value.apiUrl === 'string' ? value.apiUrl : DEFAULTS.apiUrl,
    apiKey: typeof value.apiKey === 'string' ? value.apiKey : DEFAULTS.apiKey,
    model: typeof value.model === 'string' && value.model.trim() !== '' ? value.model.trim() : DEFAULTS.model,
    size: typeof value.size === 'string' && value.size.trim() !== '' ? value.size.trim() : DEFAULTS.size,
    n: typeof value.n === 'number' && Number.isFinite(value.n) ? clampCount(value.n) : DEFAULTS.n,
  }
}

/** Clamp the requested image count into 1-4. */
function clampCount(n) {
  return Math.min(4, Math.max(1, Math.round(n)))
}

/** Extract a friendly message from an unknown thrown value. */
function messageOf(error) {
  return error instanceof Error ? error.message : String(error)
}

/**
 * Resolve the model-supplied `image` reference into engine-ready base64 +
 * mime. Accepts either an attachmentId (a native multimodal upload's `image`
 * block, or the id of a plugin `uploaded-image` block) or an upload-workdir
 * path (a text-model plugin upload, whose path the envelope told the model to
 * echo back). attachmentId references are resolved to the FULL ref by scanning
 * the session's events — attachments.readImage() verifies data.byteLength ===
 * ref.bytes, so a bare id is never enough. Returns undefined when no image was
 * supplied.
 */
async function resolveImageInput(ctx, image, exec) {
  if (image === undefined || image === null) return undefined
  if (typeof image !== 'string' || image.trim() === '') {
    throw new Error('generate_image 的 image 参数无效')
  }
  const reference = image.trim()
  const attachments = ctx.get('attachments')
  const session = exec.agent?.session
  if (attachments !== undefined && session !== undefined) {
    const ref = referencedImageRef(session.events, reference)
    if (ref !== undefined) {
      const stored = await attachments.readImage(ref)
      return { b64: Buffer.from(stored.data).toString('base64'), mime: ref.mediaType }
    }
  }
  // Work-dir path form (text-model upload). The uploaded bytes were validated
  // by saveImage at upload time, so magic-byte sniffing reliably recovers the
  // mime for the data URL.
  const work = await readUpload(reference).catch(() => {
    throw new Error('generate_image 无法解析 image 参数：既不是会话中的图片附件，也不在插件上传目录中')
  })
  return { b64: work.data.toString('base64'), mime: sniffMediaType(work.data) }
}

/**
 * Mount the settings section, bridge routes, prompt announcement, and the
 * generate_image tool.
 * @param ctx - host plugin context carrying webServer/systemPrompt.
 * @param config - resolved plugin config (schema defaults applied by the loader).
 */
export function apply(ctx, config) {
  // The live source the tool reads: the settings section once the settings
  // service is attached, the composition entry otherwise.
  let current = () => config ?? {}
  const resolve = () => resolveConfig(current())

  // The settings bridge mounts once, gated on the settings seam. It keeps
  // serving while the plugin is disabled — it is how the user re-enables it.
  ctx.inject(['settings'], (sctx) => {
    const seam = sctx.get('settings')
    sctx.effect(
      () => {
        const routes = makeRoutes({
          settings: seam,
          namespace: IMAGEGEN_SETTINGS_NAMESPACE,
          namespaceObject: settingsNamespace(IMAGEGEN_SETTINGS_NAMESPACE),
          describePath: SETTINGS_API.describe,
          mutatePath: SETTINGS_API.mutate,
        })
        const disposers = routes.map(route => ctx.webServer.register(route))
        return () => { for (const dispose of disposers) dispose() }
      },
      'dsh-tool-imagegen: routes',
    )
  })

  // System-prompt announcement (toggled by settings changes).
  let disposeSection = undefined
  const sync = () => {
    if (disposeSection !== undefined) {
      disposeSection()
      disposeSection = undefined
    }
    const value = resolve()
    if (!value.enabled || !value.announceToAgent) return
    disposeSection = ctx.systemPrompt.section({
      name: 'plugin:dsh-tool-imagegen',
      order: SECTION_ORDER,
      text: IMAGEGEN_GUIDANCE,
    })
  }

  installSettingsSection(ctx, ImageGenSettingsNamespace, Config, config ?? {}, {
    setSource: (source) => {
      current = source
      sync()
    },
    onChange: sync,
  })

  // The generate_image tool registers from our own apply fiber (declared
  // `tools` in inject above, matching how dsh-mcp-client mounts tools), so the
  // registration lands in the global tool layer and lives as long as the
  // plugin — an inject callback's fiber would be disposed and undo the
  // registration. execute() reads the live config per call, so settings edits
  // apply without a restart.
  ctx.tools.register({
      name: 'generate_image',
      description: '生成一张或多张图片（OpenAI 兼容接口），结果直接显示在对话中。当用户要求画图、生图、生成插画/海报/头像、或基于参考图改图（图生图）时使用。',
      // parameters must be a FULL JSON Schema (object-rooted), not a bare
      // property map: the registry projects it verbatim into the model request
      // (schemaOf), and strict upstream gateways reject a function schema
      // without type: "object". This mirrors what the platform's own
      // parameterSchemaSpecToJsonSchema emits for first-party tools.
      parameters: {
        type: 'object',
        properties: {
          prompt: {
            type: 'string',
            description: '画面描述，建议包含主体、风格、构图、光线等细节（最多 2000 字）。',
          },
          image: {
            type: 'string',
            description: '可选参考图，用于图生图/图片编辑：传参考图的附件 ID（attachmentId），或插件上传目录中的完整路径（形如 C:\\Users\\<user>\\.dsh\\data\\dsh-tool-imagegen\\uploads\\upload-xxx.png，文字信封会给出）。仅当用户要求基于某张图修改/生成时才传。',
          },
          size: {
            type: 'string',
            description: '可选尺寸，如 1024x1024、1536x1024、1024x1536、512x512；不传则用设置里的默认尺寸。',
          },
          n: {
            type: 'number',
            description: '生成张数，1-4，默认取设置里的默认值（通常为 1）。',
          },
        },
        required: ['prompt'],
      },
      output: {
        schema: {
          type: 'object',
          additionalProperties: false,
          required: ['prompt', 'model', 'size', 'images'],
          properties: {
            prompt: {
              type: 'string',
            },
            model: {
              type: 'string',
            },
            size: {
              type: 'string',
            },
            images: {
              type: 'array',
              items: {
                type: 'object',
                additionalProperties: false,
                required: ['attachmentId', 'mediaType', 'bytes', 'width', 'height'],
                properties: {
                  attachmentId: {
                    type: 'string',
                  },
                  mediaType: {
                    type: 'string',
                  },
                  bytes: {
                    type: 'integer',
                  },
                  width: {
                    type: 'integer',
                  },
                  height: {
                    type: 'integer',
                  },
                  name: {
                    type: 'string',
                  },
                },
              },
            },
          },
        },
        render: (args, value) => {
          const reference = typeof args.image === 'string' && args.image.trim() !== ''
            ? '（基于参考图片生成）'
            : ''
          const envelope = [
            { type: 'text', text: `已生成 ${value.images.length} 张图片${reference}（模型 ${value.model}，尺寸 ${value.size}）：` },
            { type: 'text', text: `提示词：${value.prompt}` },
            { type: 'text', text: '图片已直接显示在对话界面中，回复时不要使用 markdown 图片语法、不要引用或嵌入图片。' },
          ]
          return [
            ...envelope,
            ...value.images.map(image => ({
              type: 'generated-image',
              attachment: {
                attachmentId: image.attachmentId,
                mediaType: image.mediaType,
                bytes: image.bytes,
                width: image.width,
                height: image.height,
                ...image.name === undefined ? {} : { name: image.name },
              },
              prompt: value.prompt,
              model: value.model,
              size: value.size,
            })),
          ]
        },
      },
      isConcurrencySafe: () => true,
      async execute(args, exec) {
        const cfg = resolve()
        if (!cfg.enabled) {
          throw new Error('生图插件已停用：请在「设置 → 插件 → 可配置」中启用 dsh-tool-imagegen')
        }
        const prompt = typeof args.prompt === 'string' ? args.prompt.trim() : ''
        if (prompt === '') throw new Error('generate_image 需要非空 prompt')
        if (prompt.length > 2000) throw new Error('prompt 超过 2000 字符上限')
        const model = cfg.model
        const size = typeof args.size === 'string' ? args.size.trim() : ''
        const count = typeof args.n === 'number' && Number.isFinite(args.n) ? clampCount(args.n) : cfg.n
        const image = await resolveImageInput(ctx, args.image, exec)

        const result = await generateImage(
          { apiUrl: cfg.apiUrl, apiKey: cfg.apiKey },
          { model, prompt, size, n: count, image, signal: exec.signal },
        )

        const attachments = ctx.get('attachments')
        if (attachments === undefined) throw new Error('生图失败：附件服务未挂载')
        const images = []
        for (let i = 0; i < result.images.length; i += 1) {
          const image = result.images[i]
          const mediaType = image.mime
          if (attachments.imageLimits.mediaTypes.includes(mediaType) === false) {
            throw new Error(`上游返回了不支持的图片格式 ${mediaType}（仅支持 PNG/JPEG/WebP/GIF）`)
          }
          const ref = await attachments.saveImage({
            data: Buffer.from(image.b64, 'base64'),
            mediaType,
            name: `generated-${Date.now()}-${i + 1}.png`,
          })
          images.push({
            attachmentId: ref.attachmentId,
            mediaType: ref.mediaType,
            bytes: ref.bytes,
            width: ref.width,
            height: ref.height,
            ...ref.name === undefined ? {} : { name: ref.name },
          })
        }
        // The inline view serves the images through the plugin's own
        // attachment bridge (see makeAttachmentRoute): the platform's
        // authorization only serves `image` blocks referenced by session
        // events, and those are model-visible — fatal for text-only models.
        // Nothing else is appended to the session here; the generated-image
        // blocks in this tool-result content are what the bridge scans.
        return { prompt, model, size: size || cfg.size, images }
      },
      presentCall(args) {
        return {
          card: 'generic',
          title: '生成图片',
          kind: 'other',
          locations: [],
        }
      },
      presentResult(_args, result) {
        if (result.isError) return undefined
        const text = result.content
          .filter(block => block.type === 'text' && typeof block.text === 'string')
          .map(block => block.text)
          .join('\n')
        const images = result.content
          .filter(block => block.type === 'generated-image' && block.attachment !== undefined)
          .map(block => ({ type: 'image', attachment: block.attachment }))
        if (images.length === 0) return undefined
        return {
          card: 'generic',
          title: '生成图片',
          content: [{ type: 'text', text }, ...images],
        }
      },
    })

  // The inline view resolves generated images through our own loopback
  // bridge: the platform's attachment authorization only recognizes `image`
  // blocks in session events, and this plugin deliberately never writes
  // `image` blocks (text-only model safety). The bridge re-checks the
  // session's own events for a generated-image block referencing the id —
  // the same trust model as the platform route, over our block type. Mounted
  // from apply (like the tool) so it lives for the plugin's lifetime.
  ctx.webServer.register(makeAttachmentRoute({
    path: ATTACHMENT_API.path,
    attachments: ctx.get('attachments'),
    sessions: ctx.get('sessions'),
  }))

  // Upload + capability bridges (text-model upload, and image-capability
  // detection for the client's custom upload button). Registered from apply so
  // they live for the plugin's lifetime, like the attachment route.
  for (const route of makeUploadRoutes({
    uploadPath: UPLOAD_API.path,
    capabilityPath: CAPABILITY_API.path,
    sessions: ctx.get('sessions'),
    attachments: ctx.get('attachments'),
    agents: ctx.get('agents'),
    llm: ctx.get('llm'),
  })) {
    ctx.webServer.register(route)
  }

  // Storage-maintenance bridges (stats + orphan cleanup for the settings
  // card's storage section). Same lifetime as the other loopback routes.
  for (const route of makeMaintenanceRoutes({
    statsPath: MAINTENANCE_API.stats,
    cleanupPath: MAINTENANCE_API.cleanup,
    sessions: ctx.get('sessions'),
  })) {
    ctx.webServer.register(route)
  }

  // Local-open bridge (the inline view's 本地打开 button): copies a referenced
  // image to a temp file and opens it in the system's default viewer. Same
  // session-reference authorization as the attachment route.
  ctx.webServer.register(makeOpenRoute({
    path: OPEN_API.path,
    sessions: ctx.get('sessions'),
    attachments: ctx.get('attachments'),
  }))

  // Initial registration from the composition entry (covers deployments with
  // no settings service, whose installSettingsSection never fires its hooks).
  sync()
}

export { generateImage } from './engine.js'
export { makeRoutes } from './routes.js'
export { messageOf }
