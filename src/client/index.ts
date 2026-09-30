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
import { GeneratedTurnTail, type GeneratedTurnTailFace } from './GeneratedTurnTail.tsx'
import { GENERATED_IMAGES_KIND, generatedImagesDefinition, type GeneratedTurnCall } from './turn-definition.ts'
import { type MaintenanceCardFace } from './MaintenanceCard.tsx'
import { UploadedImageBubble } from './UploadedImageBubble.tsx'
import { generatedImagesMeta, generatedTurnsUrl, IMAGEGEN_IMAGES_API, OPEN_API, UPLOAD_API } from './protocol.ts'
import { getPending, setPending, setPendingFailure } from './pending-upload.ts'

/** Per-image byte cap for staging an edit reference (host maxImageBytes). */
const MAX_EDIT_BYTES = 5 * 1024 * 1024

/** Locale namespace this plugin owns. */
const NS = 'dsh-imagegen'

/**
 * Read one call's generated-images manifest from the plugin's loopback route.
 * A non-OK response degrades to an empty object so callers treat a missing
 * manifest as "no extra metadata" rather than an error.
 */
async function readManifest(
  fetchFn: (input: RequestInfo | URL, init?: RequestInit) => Promise<Response>,
  sessionId: string,
  callId: string,
): Promise<Record<string, unknown>> {
  try {
    const response = await fetchFn(
      `${IMAGEGEN_IMAGES_API.path}?session=${encodeURIComponent(sessionId)}&call=${encodeURIComponent(callId)}`,
    )
    if (response.ok !== true) return {}
    const body = await response.json()
    return body !== null && typeof body === 'object' ? body as Record<string, unknown> : {}
  } catch {
    return {}
  }
}

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

    /**
     * ui-chat's Turn-tail list seat, declared by `@deepseek-ai/dsh-client-ui-chat`
     * and shared with every Turn-level artifact (the shipped changed-files card
     * and the schedule card register here too). It renders beneath a completed
     * Turn's closing prose and OUTSIDE that Turn's collapsible tool group —
     * which is exactly where a generated picture belongs. Spelled here so this
     * package can register without depending on the sibling UI package.
     */
    'conversation.chat.turnTail': {
      kind: 'list'
      scope: 'session'
      owner: import('./GeneratedTurnTail.tsx').GeneratedTurnTailOwnerProps
    }
  }
}

/** Owner share of a plugin card: the view the page asks this entry for. */
export interface ImageGenPluginItemOwnerProps {
  /** `summary` renders the one-liner alone; `page` renders the form. */
  view: 'summary' | 'page'
}

/**
 * Required services (fiber inject waiting — the runtime must be up first).
 *
 * `uiConversation` is deliberately NOT listed: the Turn-level card's
 * registration is the only thing that needs it, and gating the WHOLE client
 * half on a service that may mount later would silently switch off the
 * settings card and the toolview too. It is acquired with a scoped
 * `ctx.inject(...)` below instead, so a late-arriving registry costs only the
 * Turn-level card.
 */
export const inject = ['slots', 'locale', 'connection', 'conversation', 'configForms']

/**
 * Build marker, logged once at apply. It is the only way to tell from the
 * outside which client bundle a running page actually loaded: DSH can serve a
 * module bundle out of the browser's cache, so "the file on disk is new" does
 * not prove "the page is running it".
 */
const CLIENT_BUILD = 'imagegen-client/2026-09-30-turn-tail'

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
  // generate_image calls render in the conversation. The pictures themselves
  // are native `image` blocks in the tool result, so they resolve through the
  // platform loader the slot owner supplies (`props.loadImage`, the same
  // session-authorized loader the shipped read_image card uses) — this plugin
  // never ships image bytes and never shadows that prop. The injected face
  // covers only what the platform does not: 本地打开 (host-side viewer), 修改
  // (stage a new edit reference), and the per-call metadata fallback.
  //
  // The SAME face serves the Turn-tail card below: both entries close over the
  // session id their own `inject(sessionId)` receives, so the two surfaces
  // cannot drift apart in what they can do.
  const makeFace = (sessionId: string): GenerateImageViewFace => ({
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
        // identically for text-only and image-capable models.
        stageEdit: async (image) => {
          if (typeof image.data !== 'string' || image.data === '') {
            throw new Error('无法读取图片：缺少图片数据')
          }
          const bytes = typeof image.bytes === 'number' ? image.bytes : Number.POSITIVE_INFINITY
          if (bytes > MAX_EDIT_BYTES) throw new Error('图片超过 5MB 上限，无法作为修改参考')
          setPending(sessionId, {
            mediaType: typeof image.mediaType === 'string' && image.mediaType !== '' ? image.mediaType : 'image/png',
            data: image.data,
            name: typeof image.name === 'string' && image.name !== '' ? image.name : 'generated-image.png',
          })
          setPendingFailure(sessionId, undefined)
        },
        // Metadata fallback: the platform normally delivers the tool's
        // `presentationMeta` as `tool/result.data.meta`; when a build does not,
        // the manifest route still yields the captions and work-dir handles.
        loadImagesMeta: async (callId) => {
          const body = await readManifest(bridgeFetch, sessionId, callId)
          return generatedImagesMeta(body)
        },
        // Every settled generate_image call of this session, grouped by Turn,
        // read from the host's own log. The Turn-level card uses this only when
        // the client-side fold has nothing: a Definition only sees events
        // matched after it registered, so a Turn folded earlier (or outside the
        // loaded window) would otherwise render no card at all.
        loadTurnImages: async () => {
          const response = await bridgeFetch(generatedTurnsUrl(sessionId))
          if (response.ok !== true) return {}
          const body = await response.json() as { turns?: unknown }
          if (!Array.isArray(body.turns)) return {}
          const byTurn: Record<number, GeneratedTurnCall[]> = {}
          for (const entry of body.turns) {
            if (entry === null || typeof entry !== 'object') continue
            const record = entry as Record<string, unknown>
            if (typeof record.turn !== 'number' || !Array.isArray(record.calls)) continue
            byTurn[record.turn] = record.calls as GeneratedTurnCall[]
          }
          return byTurn
        },
        // Edit bytes for one picture: the host serves the exact bytes it handed
        // the model as that call's edit handle.
        loadEditBytes: async (attachmentId, callId) => {
          const body = await readManifest(bridgeFetch, sessionId, callId)
          const images = (body as { images?: unknown }).images
          if (!Array.isArray(images)) return undefined
          for (const entry of images) {
            if (entry === null || typeof entry !== 'object') continue
            const record = entry as Record<string, unknown>
            if (record.attachmentId !== attachmentId) continue
            if (typeof record.data === 'string' && record.data !== '') return record.data
          }
          return undefined
        },
  })

  try {
    ctx.slots.inject('tool.call.toolview', () => ctx.slots.register({
      name: 'tool.call.toolview',
      key: 'generate_image',
      locale: NS,
      inject: makeFace,
    }, GenerateImageView))
  } catch (error) {
    console.warn('[dsh-tool-imagegen] toolview registration failed:', error)
  }

  // Turn-level picture card. The default ("compact") transcript folds a closed
  // Turn's tool calls into a collapsible process group, so the toolview's
  // picture — which is what the user sees while the Turn is still open —
  // disappears from the reading flow once the Turn ends. The Definition folds
  // each Turn's settled generate_image results out of the persisted session
  // events, and this list seat renders them BENEATH the Turn's closing prose
  // and OUTSIDE that group, so a generated picture reads as part of the answer.
  // Both halves are the shipped pattern (ui-schedule's `schedule_create` card
  // and ui-deliverables' changed-files card use the same two registrations).
  const registerTurnCard = (registry: { events?: { register?: (definition: unknown) => unknown } }): void => {
    if (typeof registry.events?.register !== 'function') {
      throw new Error('uiConversation exposes no events.register')
    }
    registry.events.register(generatedImagesDefinition)
    ctx.slots.inject('conversation.chat.turnTail', () => ctx.slots.register({
      name: 'conversation.chat.turnTail',
      id: GENERATED_IMAGES_KIND,
      order: 30,
      locale: NS,
      inject: (sessionId) => makeFace(sessionId),
    }, GeneratedTurnTail))
  }
  try {
    const conversationService = ctx.get('uiConversation') as {
      events?: { register?: (definition: unknown) => unknown }
    } | undefined
    if (conversationService !== undefined && typeof conversationService.events?.register === 'function') {
      registerTurnCard(conversationService)
      console.info(`[dsh-tool-imagegen] ${CLIENT_BUILD}: Turn-level card registered (registry already available)`)
    } else {
      // The conversation runtime may mount after this plugin. Register through
      // a SCOPED inject so a late arrival costs only this card, never the rest
      // of the plugin.
      const scopedInject = (ctx as unknown as {
        inject?: (services: string[], callback: (scoped: ClientContext) => void) => unknown
      }).inject
      if (typeof scopedInject === 'function') {
        scopedInject.call(ctx, ['uiConversation'], (scoped) => {
          try {
            const late = scoped.get('uiConversation') as {
              events?: { register?: (definition: unknown) => unknown }
            } | undefined
            registerTurnCard(late ?? {})
            console.info(`[dsh-tool-imagegen] ${CLIENT_BUILD}: Turn-level card registered (registry arrived late)`)
          } catch (error) {
            console.warn('[dsh-tool-imagegen] Turn-tail card registration failed:', error)
          }
        })
        console.info(`[dsh-tool-imagegen] ${CLIENT_BUILD}: waiting for the conversation event registry`)
      } else {
        console.warn(`[dsh-tool-imagegen] ${CLIENT_BUILD}: no uiConversation service and no scoped inject; Turn-level card not registered`)
      }
    }
  } catch (error) {
    console.warn('[dsh-tool-imagegen] Turn-tail card registration failed:', error)
  }
  console.info(`[dsh-tool-imagegen] ${CLIENT_BUILD}: apply complete`)

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
