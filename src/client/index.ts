/**
 * Browser-half entry for the dsh-tool-imagegen plugin — runs inside the dsh
 * web GUI.
 *
 * Registers the plugin locale dictionaries, binds the plugin's own settings
 * scope (its loopback bridge routes serve the dsh-imagegen namespace the
 * official rc.6 allowlist would refuse), registers the settings card into the
 * official `settings.plugin.item` slot (Settings → Plugins → Configurable),
 * and registers the inline generated-image view into the keyed
 * `tool.call.toolview` slot for the `generate_image` tool. Failure policy:
 * registration problems are logged, never thrown — an external plugin must not
 * take the GUI down.
 */
import type { ClientContext } from '@deepseek-ai/dsh-client-store'
import type { ConnectionHandle } from '@deepseek-ai/dsh-client-connection/client'
// Type-only: pulls the locale plugin's Context merge (ctx.locale).
import type {} from '@deepseek-ai/dsh-client-locale/client'
// Type-only: pulls the LocaleNamespaceMap + SlotMap merge tables.
import type {} from '@deepseek-ai/dsh-client-ui-slots'
// Type-only: pulls the `tool.call.toolview` keyed slot declaration.
import type {} from '@deepseek-ai/dsh-client-ui-tool'
import { en, zh, type ImageGenLocaleKey } from './locales.ts'
import { ImageGenSettingsCard, ImageGenSettingsCardController, type ImageGenSettingsCardFace } from './SettingsCard.tsx'
import { bindImageGenScope, type ImageGenScope } from './settings-scope.ts'
import { GenerateImageView, type GenerateImageViewFace } from './GenerateImageView.tsx'
import { type MaintenanceCardFace } from './MaintenanceCard.tsx'
import { UploadButton, type UploadButtonFace } from './UploadButton.tsx'
import { UploadedImageBubble } from './UploadedImageBubble.tsx'
import { ATTACHMENT_API, OPEN_API, UPLOAD_API } from './protocol.ts'
import { getPending, setPending, setPendingFailure } from './pending-upload.ts'

/** Per-image byte cap for staging an edit reference (host maxImageBytes). */
const MAX_EDIT_BYTES = 5 * 1024 * 1024

/** Read a Blob as a base64 data URL (mirrors the upload button's File path). */
function blobToDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('image read failed'))
    reader.readAsDataURL(blob)
  })
}

/** Locale namespace this plugin owns. */
const NS = 'dsh-imagegen'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** dsh-tool-imagegen surface copy. */
    'dsh-imagegen': ImageGenLocaleKey
  }

  interface SlotMap {
    /**
     * The official plugin-configuration slot the Settings → Plugins →
     * Configurable tab declares and renders. rc.7 made it a KEYED slot whose
     * key is the settings namespace the card edits; the tab only dispatches
     * namespaces the host settings service serves (settings.describe). This
     * card registers under the dsh-imagegen key it owns. Spelled here with the
     * same shape so this package can register without depending on the sibling
     * UI package.
     */
    'settings.plugin.item': { kind: 'keyed'; scope: 'root'; owner: ImageGenPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card (the section supplies nothing). */
export interface ImageGenPluginItemOwnerProps {
  /** Marker field: card owner props are intentionally empty. */
  children?: never
}

/** Required services (fiber inject waiting — the runtime must be up first). */
export const inject = ['slots', 'locale', 'connection', 'conversation']

/**
 * Mount the settings card and the inline generated-image view.
 * @param ctx - client root context (services: slots, locale, connection).
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-tool-imagegen: dictionaries')

  const connection = ctx.get('connection') as ConnectionHandle | undefined
  const loopback = connection?.isLoopback === true
  // Every plugin bridge route is loopback-fenced; remote browsers get an
  // unavailable scope / failing faces instead of fetching them.
  const bridgeFetch = loopback
    ? (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init)
    : () => { throw new Error('plugin bridge is loopback-only') }
  const scope: ImageGenScope = bindImageGenScope(bridgeFetch)

  // Re-read the scope whenever the connection resets (same invalidation the
  // official settings binder wires).
  ctx.effect(() => {
    const disposers = [
      ctx.on('connection/reset', () => { void scope.load() }),
    ]
    return () => { for (const dispose of disposers) dispose() }
  }, 'dsh-tool-imagegen: settings scope invalidation')

  // Plugin configuration card: one staged form over the `dsh-imagegen` scope,
  // registered into the official plugin-configuration slot (Settings →
  // Plugins → Configurable). rc.7 keyed the slot by settings namespace, so the
  // registration key is the namespace it edits — and the storage-maintenance
  // section (a second card in rc.6) now lives INSIDE this card, because a
  // keyed slot holds one entry per key.
  try {
    const settingsCard = new ImageGenSettingsCardController(scope)
    ctx.slots.inject('settings.plugin.item', () => ctx.slots.register({
      name: 'settings.plugin.item',
      key: NS,
      order: 30,
      locale: NS,
      inject: (): ImageGenSettingsCardFace => ({
        ...settingsCard.inject(),
        maintenance: { fetchFn: bridgeFetch },
      }),
    }, ImageGenSettingsCard))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] settings card registration failed:', error)
  }

  // Inline generated-image view: the keyed toolview entry owns how
  // generate_image calls render in the conversation. Its inject face binds
  // loadImage to the plugin's own loopback attachment bridge — the
  // conversation service's resolveImage authorizes only `image` blocks
  // referenced by session events, and this plugin never writes `image`
  // blocks (text-only model safety). The bridge re-checks the same session
  // reference against `generated-image` blocks before serving the bytes.
  try {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview',
      key: 'generate_image',
      locale: NS,
      inject: (sessionId): GenerateImageViewFace => ({
        loadImage: (attachment) => Promise.resolve(
          `${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(attachment.attachmentId)}`,
        ),
        // 本地打开: the host re-checks the session reference, copies the bytes
        // to a temp file, and hands them to the system's image viewer.
        openLocally: (attachment) => bridgeFetch(OPEN_API.path, {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ sessionId, attachmentId: attachment.attachmentId }),
        }).then(async (response) => {
          const body = await response.json() as { ok?: boolean; message?: string }
          if (body.ok !== true) {
            throw new Error(body.message !== undefined && body.message !== '' ? body.message : 'open failed')
          }
        }),
        // 修改: stage this generated image as the session's pending upload
        // reference (same store the composer upload button writes), so the
        // user can type a modification request and send — the sendSession
        // wrapper then submits image + text through the upload bridge and the
        // model edits via generate_image with the work-dir path. The channel
        // is model-agnostic: `uploaded-image` blocks + the text envelope work
        // identically for text-only and image-capable models (the envelope
        // carries the path; the block type is invisible to both).
        stageEdit: async (attachment) => {
          const bytes = typeof attachment.bytes === 'number' ? attachment.bytes : Number.POSITIVE_INFINITY
          if (bytes > MAX_EDIT_BYTES) throw new Error('图片超过 5MB 上限，无法作为修改参考')
          const response = await bridgeFetch(
            `${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(attachment.attachmentId)}`,
          )
          if (response.ok !== true) throw new Error(`无法读取图片：HTTP ${response.status}`)
          const dataUrl = await blobToDataUrl(await response.blob())
          const comma = dataUrl.indexOf(',')
          setPending(sessionId, {
            mediaType: typeof attachment.mediaType === 'string' && attachment.mediaType !== '' ? attachment.mediaType : 'image/png',
            data: comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl,
            name: typeof attachment.name === 'string' && attachment.name !== '' ? attachment.name : 'generated-image.png',
          })
          setPendingFailure(sessionId, undefined)
        },
      }),
    }, GenerateImageView))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] toolview registration failed:', error)
  }

  // Text-model upload entry: a composer tool-row button shown only for
  // sessions whose model cannot take images (capability-checked through the
  // bridge; see UploadButton). Picking a file only stages a pending draft —
  // the sendSession wrapper below submits it (with the typed text) at send
  // time; the host then enqueues the [uploaded-image] + envelope user message
  // — the model never sees image blocks, the user sees the picture inline.
  const uploadFace: UploadButtonFace = {
    fetchFn: bridgeFetch,
    connection: connection as ConnectionHandle,
  }
  try {
    ctx.slots.inject('conversation.input.left', () => ctx.slots.register({
      name: 'conversation.input.left',
      id: 'imagegen-upload',
      order: 10,
      locale: NS,
      inject: () => uploadFace,
    }, UploadButton))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] upload button registration failed:', error)
  }

  // Send-time interception: wrap the platform conversation service's
  // sendSession so a pending upload is submitted TOGETHER with the typed
  // message. The platform composer calls sendSession(session, text, imageIds,
  // mode) on submit (sink); when this session holds a pending upload draft,
  // the wrapper posts it to the upload bridge with the text instead, and the
  // host enqueues ONE user message ([uploaded-image] + envelope carrying the
  // text). The platform's own draft images (imageIds) are ignored here — the
  // text-only path never produces them; without a draft the wrapper is a
  // pass-through, so ordinary conversation is untouched. A failed upload
  // throws (the composer restores the draft text) and the pending draft is
  // kept for a retry.
  try {
    const conversation = ctx.get('conversation') as {
      sendSession: (session: { sessionId?: string }, text: string, imageIds: unknown[], mode: unknown) => Promise<{ ok: boolean }>
    } | undefined
    if (conversation !== undefined && typeof conversation.sendSession === 'function') {
      const originalSend = conversation.sendSession.bind(conversation)
      conversation.sendSession = (async (session, text, imageIds, mode) => {
        const sessionId = session?.sessionId
        const draft = typeof sessionId === 'string' && sessionId !== '' ? getPending(sessionId) : undefined
        if (draft === undefined) return originalSend(session, text, imageIds, mode)
        let response
        try {
          response = await uploadFace.fetchFn(UPLOAD_API.path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              mediaType: draft.mediaType,
              data: draft.data,
              name: draft.name,
              text,
            }),
          })
        } catch (error) {
          const message = error instanceof Error && error.message !== '' ? error.message : 'upload bridge unreachable'
          setPendingFailure(sessionId, message)
          throw error
        }
        const body = await response.json() as { ok?: boolean; message?: string }
        if (body.ok !== true) {
          const message = body.message !== undefined && body.message !== '' ? body.message : 'upload failed'
          setPendingFailure(sessionId, message)
          throw new Error(message)
        }
        // Consumed: the host enqueued the combined user message.
        setPending(sessionId, undefined)
        setPendingFailure(sessionId, undefined)
        return { ok: true }
      }) as typeof conversation.sendSession
    }
  } catch (error) {
    console.warn('[dsh-tool-imagegen] sendSession wrapper failed:', error)
  }

  // User-message node shadow: registered for key 'user' at priority -1, which
  // outranks the shipped renderer (lowest priority wins), so every user bubble
  // flows through this view — a faithful replica of the shipped bubble (same
  // chrome, hover clock, copy action) extended with the plugin's
  // uploaded-image blocks, which render inline through the plugin's own
  // attachment bridge. The model-facing envelope text is filtered out.
  try {
    ctx.slots.inject('conversation.chat.node', () => ctx.slots.register({
      name: 'conversation.chat.node',
      key: 'user',
      priority: -1,
      locale: NS,
    }, UploadedImageBubble))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] user bubble registration failed:', error)
  }
}
