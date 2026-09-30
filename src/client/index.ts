/**
 * Browser-half entry for the dsh-tool-imagegen plugin — runs inside the dsh
 * web GUI.
 *
 * Registers the plugin locale dictionaries, binds its settings scope to the
 * platform's own configuration-form service for the `dsh-imagegen` entry,
 * registers the settings card into the Plugins page's `plugins.item` slot, and
 * registers the inline generated-image view into the keyed
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
import { bindImageGenScope, unavailableScope, type ConfigFormsLike, type ImageGenScope } from './settings-scope.ts'
import { GenerateImageView, type GenerateImageViewFace } from './GenerateImageView.tsx'
import { type MaintenanceCardFace } from './MaintenanceCard.tsx'
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

/**
 * The plugin's profile entry id in the host composition. In the current DSH a
 * configurable entry is addressed by its loader entry id, so this is also the
 * settings namespace the card edits and the key it registers under.
 * Spelled here rather than imported: a client package must not import a host
 * package.
 */
const ENTRY_ID = 'dsh-imagegen'

declare module '@deepseek-ai/dsh-client-ui-slots' {
  interface LocaleNamespaceMap {
    /** dsh-tool-imagegen surface copy. */
    'dsh-imagegen': ImageGenLocaleKey
  }

  interface SlotMap {
    /**
     * The Plugins page's list of configurable plugins, declared by
     * `@deepseek-ai/dsh-client-ui-plugin-manager` and occupied by one companion
     * package per configurable host-plane namespace. The page renders the entry
     * as the card's one-liner in `view: 'summary'` and, once the card is opened,
     * as the body of the plugin's own page in `view: 'page'`. Spelled here with
     * the same shape so this package can register without depending on the
     * sibling UI package.
     */
    'plugins.item': { kind: 'list'; scope: 'root'; owner: ImageGenPluginItemOwnerProps }
  }
}

/** Owner share of a plugin card: the view the page asks this entry for. */
export interface ImageGenPluginItemOwnerProps {
  /** `summary` renders the one-liner alone; `page` renders the form. */
  view: 'summary' | 'page'
}

/** Required services (fiber inject waiting — the runtime must be up first). */
export const inject = ['slots', 'locale', 'connection', 'conversation', 'configForms']

/**
 * Mount the settings card and the inline generated-image view.
 * @param ctx - client root context (services: slots, locale, connection,
 *   conversation, configForms).
 */
export function apply(ctx: ClientContext): void {
  ctx.effect(() => ctx.locale.register(NS, { zh, en }), 'dsh-tool-imagegen: dictionaries')
  const t = ctx.locale.bind(NS)

  const connection = ctx.get('connection') as ConnectionHandle | undefined
  const loopback = connection?.isLoopback === true
  // The plugin's OWN bridge routes are loopback-fenced; a remote browser gets
  // failing faces instead of fetching them. (Configuration travels over the
  // platform's settings service, which handles its own non-loopback case.)
  const bridgeFetch = loopback
    ? (input: RequestInfo | URL, init?: RequestInit) => fetch(input, init)
    : () => { throw new Error('plugin bridge is loopback-only') }
  const forms = ctx.get('configForms') as unknown as ConfigFormsLike | undefined
  const scope: ImageGenScope = forms === undefined
    ? unavailableScope()
    : bindImageGenScope(forms, ENTRY_ID)

  // Re-read the scope whenever the connection resets (same invalidation the
  // official settings binder wires).
  ctx.effect(() => {
    const disposers = [
      ctx.on('connection/reset', () => { void scope.load() }),
    ]
    return () => {
      for (const dispose of disposers) dispose()
      scope.dispose()
    }
  }, 'dsh-tool-imagegen: settings scope invalidation')

  // Plugin configuration card: one staged form over the `dsh-imagegen` entry,
  // registered into the Plugins page's `plugins.item` list slot — the same slot
  // the shipped settings pages use. `whileServed` keeps the registration alive
  // only while the Host actually serves that entry, so a deployment whose
  // composition dropped the plugin (or whose settings service is read-only)
  // shows no trace of the card instead of a dead control.
  //
  // The storage-maintenance section lives INSIDE this card: a list slot holds
  // one entry per id, and the plugin owns exactly one settings page.
  try {
    const settingsCard = new ImageGenSettingsCardController(scope)
    ctx.effect(
      () => (forms === undefined
        ? () => {}
        : forms.whileServed([ENTRY_ID], () => ctx.slots.inject('plugins.item', () => ctx.slots.register({
          name: 'plugins.item',
          id: ENTRY_ID,
          order: 50,
          label: () => t('cardTitle'),
          locale: NS,
          inject: (): ImageGenSettingsCardFace => ({
            ...settingsCard.inject(),
            maintenance: { fetchFn: bridgeFetch },
          }),
        }, ImageGenSettingsCard)))),
      'dsh-tool-imagegen: settings page',
    )
  } catch (error) {
    console.warn('[dsh-tool-imagegen] settings card registration failed:', error)
  }

  // Inline generated-image view: the keyed toolview entry owns how
  // generate_image calls render in the conversation. Its inject face binds
  // bridgeImageUrl to the plugin's own loopback attachment bridge — the
  // conversation service's resolveImage authorizes only `image` blocks
  // referenced by session events, and this plugin never writes `image`
  // blocks (text-only model safety). The bridge re-checks the same session
  // reference against `generated-image` blocks before serving the bytes.
  //
  // The face field is deliberately NOT named `loadImage`: the owner share of
  // `tool.call.toolview` already carries a platform `loadImage`, and the slot
  // renderer spreads owner props LAST (owner wins), so a face field with that
  // name is silently shadowed — the view would then resolve through the
  // platform route and fail with `session/attachment-invalid`.
  try {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview',
      key: 'generate_image',
      locale: NS,
      inject: (sessionId): GenerateImageViewFace => ({
        bridgeImageUrl: (attachment) => Promise.resolve(
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

  // Reference-image entry: the composer's OWN attachment button. The plugin
  // used to add a second, custom upload button (conversation.input.left) for
  // text-only models, which staged a pending draft submitted through the
  // plugin's upload bridge. The platform now uploads image attachments itself
  // (native `image` blocks the model can consume), so the duplicate button is
  // gone; what remains is the sendSession wrapper below, which still serves the
  // image card's 修改 (stageEdit) staging path.

  // Send-time interception: wrap the platform conversation service's
  // sendSession so an image staged by the card's 修改 button is submitted
  // TOGETHER with the typed message. The platform composer calls
  // sendSession(session, text, attachmentIds, mode, signal) on submit; when this
  // session holds a staged edit reference, the wrapper posts it to the upload
  // bridge with the text instead, and the host enqueues ONE user message
  // ([uploaded-image] + envelope carrying the text). Without a staged draft the
  // wrapper is a pass-through, so ordinary conversation — native attachments
  // included — is untouched. A failed upload throws (the composer restores the
  // draft text) and the staged draft is kept for a retry.
  //
  // The wrapper mirrors the platform signature exactly, `signal` included: the
  // composer passes an AbortSignal that cancels the whole Host admission, and
  // dropping it would leave a cancelled submission running to completion.
  try {
    const conversation = ctx.get('conversation') as {
      sendSession: (
        session: { sessionId?: string },
        text: string,
        attachmentIds: unknown[],
        mode: unknown,
        signal?: AbortSignal,
      ) => Promise<unknown>
    } | undefined
    if (conversation !== undefined && typeof conversation.sendSession === 'function') {
      const originalSend = conversation.sendSession.bind(conversation)
      conversation.sendSession = (async (session, text, attachmentIds, mode, signal) => {
        const sessionId = session?.sessionId
        const draft = typeof sessionId === 'string' && sessionId !== '' ? getPending(sessionId) : undefined
        if (draft === undefined) return originalSend(session, text, attachmentIds, mode, signal)
        let response
        try {
          response = await bridgeFetch(UPLOAD_API.path, {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({
              sessionId,
              mediaType: draft.mediaType,
              data: draft.data,
              name: draft.name,
              text,
            }),
            ...signal === undefined ? {} : { signal },
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
        // The platform contract is a discriminated outcome; the composer only
        // distinguishes success from failure.
        return { kind: 'success' }
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
