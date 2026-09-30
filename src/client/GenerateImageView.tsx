/**
 * The inline conversation view for the `generate_image` tool, registered as the
 * keyed `tool.call.toolview` entry for that tool name. Because the entry is
 * keyed, it REPLACES the generic tool row for generate_image calls — so this
 * view must cover running, settled, and error states itself.
 *
 * How the pictures reach the browser: the tool result carries the platform's
 * OWN `image` blocks, so this view resolves them through the session-authorized
 * `loadImage` loader the slot owner hands every atomic tool view
 * (`ToolCallOwnerProps.loadImage`) — never through a plugin route of its own.
 * That is the same path the shipped `read_image` card takes, and it is what
 * makes the picture durable across reloads.
 *
 * Display style: the shipped tool-card chrome (header row + padded body, image
 * capped at 480px tall and centered in a full-width frame, hover actions pinned
 * to the frame's bottom-right corner, meta/prompt caption lines underneath).
 * The frame keeps the full body width so the action cluster always has room —
 * a hugging frame left the bottom-right buttons cramped for tall portrait
 * images.
 *
 * The current DSH chat (default "compact" transcript view) folds a closed
 * turn's tool calls into a process disclosure that starts collapsed. That is
 * why the pictures ALSO render at the Turn tail, outside the group, through
 * {@link GeneratedTurnTail} — this card covers the open Turn (where the group
 * is still in the flow) and the per-call actions.
 */

import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import { generatedImagesMeta, type GeneratedImageEdit, type GeneratedImageRecord, type GeneratedImagesMeta } from './protocol.ts'
import type { GeneratedTurnCall } from './turn-definition.ts'
import type { ImageGenLocaleKey } from './locales.ts'
import css from './generate-image-view.module.css'

/**
 * Resolve one durable attachment to a browser URL through the loader the slot
 * owner supplies. The loader is synchronous in some builds and returns a
 * promise in others; both are accepted, and a `null`/`undefined` result is
 * reported as a failure rather than rendering a broken `<img>`.
 * @param loadImage - the session-authorized loader from the owner props.
 * @param attachment - the durable reference to resolve.
 * @returns the displayable URL.
 */
async function resolveImageUrl(
  loadImage: (image: ImageAttachmentRef) => string | undefined | null | Promise<string | undefined | null>,
  attachment: ImageAttachmentRef,
): Promise<string> {
  const url = await loadImage(attachment)
  if (typeof url !== 'string' || url === '') throw new Error('图片地址不可用（会话未授权该附件）')
  return url
}

/** The registrant-side face the toolview entry injects (per session occurrence). */
export interface GenerateImageViewFace {
  /**
   * Ask the host to open one image in the system's default image viewer: the
   * host re-checks the session reference, copies the bytes to a temp file,
   * and hands them to the OS opener (start / open / xdg-open). The browser
   * never receives the bytes or a path.
   */
  openLocally: (attachment: ImageAttachmentRef) => Promise<void>
  /**
   * Stage one image as the session's pending edit reference — the same
   * per-session draft store the composer upload button writes. The user then
   * types a modification request and sends; the sendSession wrapper submits
   * image + text through the upload bridge, and the model edits the picture
   * via generate_image (the envelope carries the work-dir path).
   */
  stageEdit: (image: GeneratedImageEdit, callId: string) => Promise<void>
  /**
   * Read the metadata the tool persisted for one settled call from the plugin's
   * loopback manifest route, which answers with the same records plus the exact
   * image bytes (base64) the model was handed as its edit handle. Used only as
   * a fallback: a build that delivers no `block.meta` still renders its pictures
   * (they come from the result's native `image` blocks) and recovers the
   * captions, work-dir handles and edit bytes from here.
   */
  loadImagesMeta: (callId: string) => Promise<GeneratedImagesMeta | undefined>
  /**
   * Read the edit bytes of one generated image (base64) for staging a
   * follow-up: the host serves the exact bytes it handed the model.
   */
  loadEditBytes: (attachmentId: string, callId: string) => Promise<string | undefined>
  /**
   * Read this session's whole generated-image projection grouped by Turn, from
   * the host's own durable log. It is the Turn-level card's fallback for Turns
   * the client-side fold cannot cover (folded before the Definition registered,
   * or outside the loaded window); the toolview itself never needs it.
   */
  loadTurnImages: () => Promise<Record<number, GeneratedTurnCall[]>>
}

/** Props the composed toolview receives. */
export type GenerateImageViewProps =
  PropsRuntime<'tool.call.toolview'>
  & PropsLocale<'dsh-imagegen'>
  & GenerateImageViewFace

/** The attachment reference one metadata record describes. */
export function attachmentOf(image: GeneratedImageRecord): ImageAttachmentRef {
  return {
    attachmentId: image.attachmentId,
    mediaType: image.mediaType,
    bytes: image.bytes,
    width: image.width,
    height: image.height,
    ...image.name === undefined ? {} : { name: image.name },
  }
}

/** Text blocks in the settled content (used as the error/summary envelope). */
function textBlocks(content: readonly ContentBlock[]): string[] {
  return content
    .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block !== null && typeof block === 'object' && 'type' in block && block.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
}

/**
 * Read the durable `image` attachment references off the settled content, in
 * block order. These are the platform's own blocks (the tool renders them), so
 * the loader the slot owner supplies can resolve every one of them.
 */
function imageAttachments(content: readonly ContentBlock[]): ImageAttachmentRef[] {
  const refs: ImageAttachmentRef[] = []
  for (const block of content) {
    if (block === null || typeof block !== 'object' || !('type' in block) || block.type !== 'image') continue
    const ref = (block as { attachment?: unknown }).attachment
    if (ref === null || typeof ref !== 'object') continue
    refs.push(ref as ImageAttachmentRef)
  }
  return refs
}

/**
 * Read the settled content array off a tool-call block. The transcript hands
 * the raw lifecycle form `{ name, argsRaw, content }` for settled calls, but
 * some surfaces deliver the nested form `{ kind, call, result: { content } }` —
 * accept both so the view never throws on an unexpected shape (a throw would
 * abdicate the keyed entry and fall back to the generic folded tool row).
 */
function settledContentOf(block: unknown): readonly ContentBlock[] | undefined {
  if (block === null || typeof block !== 'object') return undefined
  const candidate = block as Record<string, unknown>
  if (Array.isArray(candidate.content)) return candidate.content as ContentBlock[]
  if (candidate.result !== null && typeof candidate.result === 'object') {
    const result = candidate.result as Record<string, unknown>
    if (Array.isArray(result.content)) return result.content as ContentBlock[]
  }
  return undefined
}

/**
 * Read the metadata the tool persisted for this call (`tool/result.data.meta`)
 * off either block form. Absent metadata is not an error: the pictures come
 * from the content's `image` blocks, so the view falls back to the manifest
 * route for the captions and work-dir handles.
 */
function settledMetaOf(block: unknown): GeneratedImagesMeta | undefined {
  if (block === null || typeof block !== 'object') return undefined
  const direct = generatedImagesMeta((block as Record<string, unknown>).meta)
  if (direct !== undefined) return direct
  const result = (block as Record<string, unknown>).result
  if (result === null || typeof result !== 'object') return undefined
  return generatedImagesMeta((result as Record<string, unknown>).meta)
}

/** Read the call id off either block form (the manifest route key). */
function callIdOf(block: unknown): string | undefined {
  if (block === null || typeof block !== 'object') return undefined
  const candidate = block as Record<string, unknown>
  if (typeof candidate.callId === 'string' && candidate.callId !== '') return candidate.callId
  const call = candidate.call
  if (call !== null && typeof call === 'object') {
    const id = (call as Record<string, unknown>).callId ?? (call as Record<string, unknown>).id
    if (typeof id === 'string' && id !== '') return id
  }
  return undefined
}

/** Read the isError flag off either block form (false when absent). */
function settledErrorOf(block: unknown): boolean {
  if (block === null || typeof block !== 'object') return false
  const candidate = block as Record<string, unknown>
  if (candidate.isError === true) return true
  if (candidate.result !== null && typeof candidate.result === 'object') {
    return (candidate.result as Record<string, unknown>).isError === true
  }
  return false
}

/** Parse the running call's argsRaw (either block form) for a readable prompt. */
function promptFromArgs(block: unknown): string | undefined {
  if (block === null || typeof block !== 'object') return undefined
  const candidate = block as Record<string, unknown>
  let argsRaw = candidate.argsRaw
  if (typeof argsRaw !== 'string' && candidate.call !== null && typeof candidate.call === 'object') {
    argsRaw = (candidate.call as Record<string, unknown>).argsRaw
  }
  if (typeof argsRaw !== 'string' || argsRaw === '') return undefined
  try {
    const parsed = JSON.parse(argsRaw) as { prompt?: unknown }
    return typeof parsed.prompt === 'string' && parsed.prompt !== '' ? parsed.prompt : undefined
  } catch {
    return undefined
  }
}

/**
 * Render the generate_image call inline.
 * @param props - the tool call's owner share, the locale seat, and the bridge faces.
 * @returns the inline card.
 */
export function GenerateImageView(props: GenerateImageViewProps) {
  const { t, block } = props
  // The card's own DOM node, used to reach the transcript's process disclosure.
  const rootRef = useRef<HTMLDivElement>(null)
  // Running calls carry no content; settled results carry the render() output
  // (either directly or under `result`). Anything unexpected renders the
  // running card — never throws, so the keyed entry cannot abdicate.
  const content = settledContentOf(block)
  const settled = content !== undefined
  const attachments = settled ? imageAttachments(content) : []
  const isError = settledErrorOf(block)

  // Per-call metadata: the persisted `tool/result.data.meta` when the platform
  // delivers it, otherwise the plugin's manifest route (keyed by call id). Both
  // are optional — the pictures come from the content's `image` blocks, so a
  // missing metadata source costs only the captions and the work-dir handle.
  const callId = callIdOf(block)
  const [meta, setMeta] = useState<GeneratedImagesMeta | undefined>(() => settledMetaOf(block))
  useEffect(() => {
    const persisted = settledMetaOf(block)
    if (persisted !== undefined) {
      setMeta(persisted)
      return
    }
    if (callId === undefined || attachments.length === 0) return
    let alive = true
    props.loadImagesMeta(callId)
      .then((loaded) => { if (alive && loaded !== undefined) setMeta(loaded) })
      .catch(() => {
        // The manifest route is a convenience; the pictures still render.
      })
    return () => { alive = false }
  }, [block, callId, attachments.length, props.loadImagesMeta])

  // The fullscreen overlay holds one image at a time (url + display name).
  const [viewing, setViewing] = useState<{ url: string; name: string } | undefined>(undefined)

  const runningPrompt = settled ? undefined : promptFromArgs(block)
  const captionMeta = (): string => {
    const parts: string[] = []
    if (meta !== undefined && meta.model !== '') parts.push(meta.model)
    if (meta !== undefined && meta.size !== '') parts.push(meta.size)
    return parts.join(' · ')
  }

  // The current DSH chat (default "compact" transcript view) folds a closed
  // turn's tool calls into a process disclosure that starts collapsed. This
  // card does NOT force that disclosure open: the pictures also render at the
  // Turn tail (see GeneratedTurnTail), which is outside the group, so opening
  // the group here would show the same image twice. The card's own picture is
  // what the user sees while the Turn is still open.

  if (!settled) {
    return (
      <div className={css.root} ref={rootRef}>
        <div className={css.head}>
          <span className={css.title}>{t('toolviewTitle')}</span>
          <span className={css.meta}>{runningPrompt ?? ''}</span>
        </div>
        <div className={css.running} role="status">
          <span className={css.spinner} aria-hidden />
          {t('toolviewRunning')}
        </div>
      </div>
    )
  }

  // Settled with no image blocks: error or text-only outcome. The keyed entry
  // replaced the generic row, so surface the text envelope rather than dropping
  // the call.
  if (attachments.length === 0) {
    const envelope = textBlocks(content).join('\n')
    return (
      <div className={css.root} ref={rootRef}>
        <div className={css.head}>
          <span className={css.title}>{t('toolviewTitle')}</span>
          {isError ? <span className={css.state}>{t('toolviewFailed')}</span> : null}
        </div>
        {envelope !== ''
          ? (
            <div className={css.running}>
              <span className={css.captionPrompt}>{envelope}</span>
            </div>
          )
          : null}
      </div>
    )
  }

  return (
    <div className={css.root} ref={rootRef}>
      <div className={css.head}>
        <span className={css.title}>{t('toolviewTitle')}</span>
        <span className={css.meta}>
          {attachments.length > 1 ? `${attachments.length} · ` : ''}
          {captionMeta()}
        </span>
        {isError ? <span className={css.state}>{t('toolviewFailed')}</span> : null}
      </div>
      <div className={css.body}>
        {attachments.map((attachment, index) => {
          const record = meta?.images.find(image => image.attachmentId === attachment.attachmentId)
          return (
            <ImageCard
              key={attachment.attachmentId ?? `generated-${index}`}
              attachment={attachment}
              record={record}
              prompt={meta?.prompt ?? ''}
              callId={callId}
              loadImage={props.loadImage}
              openLocally={props.openLocally}
              stageEdit={props.stageEdit}
              loadEditBytes={props.loadEditBytes}
              onView={(url, name) => setViewing({ url, name })}
              t={props.t}
              index={index}
            />
          )
        })}
      </div>
      {viewing !== undefined
        ? <FullscreenViewer url={viewing.url} name={viewing.name} onClose={() => setViewing(undefined)} />
        : null}
    </div>
  )
}

/**
 * Fullscreen image overlay: dark backdrop, Esc / backdrop-click closes.
 *
 * Rendered through a PORTAL into `document.body` rather than in place. The
 * transcript nests this card inside the turn's process disclosure and a
 * scroll container, both of which are exactly the situations where an inline
 * `position: fixed` overlay can end up inside an ancestor stacking/containing
 * block and never paint above the page — which is why 全屏查看 appeared to do
 * nothing. Mounting at the document root sidesteps every ancestor's
 * transform/filter/overflow, and the explicit z-index clears the platform's
 * own floating layers (`--dsw-elevation-*` overlays sit at 1100).
 */
export function FullscreenViewer(props: { url: string; name: string; onClose: () => void }) {
  const { url, name, onClose } = props
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    // The overlay owns the page while it is open: the transcript behind it must
    // not scroll under the pointer.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      window.removeEventListener('keydown', onKey)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])
  if (typeof document === 'undefined') return null
  return createPortal(
    <div className={css.viewer} role="dialog" aria-modal="true" aria-label={name} onClick={onClose}>
      <button type="button" className={css.viewerClose} aria-label="close" onClick={onClose}>✕</button>
      <img
        className={css.viewerImg}
        src={url}
        alt={name}
        onClick={(event) => event.stopPropagation()}
      />
    </div>,
    document.body,
  )
}

/** A usable file name for one generated image (metadata name or fallback). */
function fileNameOf(record: GeneratedImageRecord | undefined, attachment: ImageAttachmentRef, index: number): string {
  const name = record?.name ?? attachment.name
  if (typeof name === 'string' && name !== '') return name
  const extension = (() => {
    switch (attachment.mediaType) {
      case 'image/jpeg': return 'jpg'
      case 'image/webp': return 'webp'
      case 'image/gif': return 'gif'
      default: return 'png'
    }
  })()
  return `generated-${index + 1}.${extension}`
}

/**
 * One generated image: resolve its URL through the session-authorized loader,
 * then render the frame + caption and the hover action cluster.
 */
export function ImageCard(props: {
  attachment: ImageAttachmentRef
  record: GeneratedImageRecord | undefined
  prompt: string
  callId: string | undefined
  loadImage: (image: ImageAttachmentRef) => string | undefined | null | Promise<string | undefined | null>
  openLocally: (attachment: ImageAttachmentRef) => Promise<void>
  stageEdit: (image: GeneratedImageEdit, callId: string) => Promise<void>
  loadEditBytes: (attachmentId: string, callId: string) => Promise<string | undefined>
  onView: (url: string, name: string) => void
  t: (key: ImageGenLocaleKey) => string
  index: number
}) {
  const { attachment, record, prompt, callId, loadImage, openLocally, stageEdit, loadEditBytes, onView, t, index } = props
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [failed, setFailed] = useState<string | undefined>(undefined)
  // Local-open handshake: idle → opening → idle (success) or failed (error).
  const [openState, setOpenState] = useState<'idle' | 'opening' | 'failed'>('idle')
  const [openError, setOpenError] = useState<string | undefined>(undefined)
  // Edit staging: idle → staging → staged (composer chip appears) or failed.
  const [editState, setEditState] = useState<'idle' | 'staging' | 'staged' | 'failed'>('idle')
  const [editError, setEditError] = useState<string | undefined>(undefined)
  // Prompt caption: the one-line preview is truncated by CSS; the toggle is
  // offered only while the full prompt does not fit (and stays while open, so
  // the user can collapse it again).
  const promptRef = useRef<HTMLParagraphElement>(null)
  const [promptOpen, setPromptOpen] = useState(false)
  const [promptClipped, setPromptClipped] = useState(false)
  useLayoutEffect(() => {
    const el = promptRef.current
    if (el === null) return
    const measure = () => { setPromptClipped(el.scrollWidth > el.clientWidth + 1) }
    measure()
    if (typeof ResizeObserver === 'undefined') return
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    return () => observer.disconnect()
  }, [prompt, promptOpen])

  useEffect(() => {
    let alive = true
    resolveImageUrl(loadImage, attachment)
      .then((resolved) => { if (alive) setUrl(resolved) })
      .catch((error: unknown) => {
        if (!alive) return
        setFailed(error instanceof Error ? error.message : String(error))
      })
    return () => { alive = false }
  }, [loadImage, attachment])

  const handleOpen = () => {
    if (openState === 'opening') return
    setOpenState('opening')
    setOpenError(undefined)
    openLocally(attachment)
      .then(() => setOpenState('idle'))
      .catch((error: unknown) => {
        setOpenState('failed')
        setOpenError(error instanceof Error ? error.message : String(error))
      })
  }

  const handleEdit = () => {
    if (editState === 'staging') return
    // 修改 re-submits the exact bytes the model itself was handed as its edit
    // handle, so the staged draft must resolve through the call that produced
    // this picture: the record supplies the work-dir path and the host serves
    // those bytes for the same call id.
    if (record === undefined || callId === undefined) {
      setEditState('failed')
      setEditError(t('toolviewEditNoHandle'))
      return
    }
    setEditState('staging')
    setEditError(undefined)
    loadEditBytes(record.attachmentId, callId)
      .then(async (data) => {
        if (typeof data !== 'string' || data === '') throw new Error(t('toolviewEditNoHandle'))
        await stageEdit({ ...record, data }, callId)
      })
      .then(() => setEditState('staged'))
      .catch((error: unknown) => {
        setEditState('failed')
        setEditError(error instanceof Error ? error.message : String(error))
      })
  }

  const name = fileNameOf(record, attachment, index)

  return (
    <div className={css.image}>
      <div className={css.frame}>
        {url !== undefined
          ? (
            <>
              <img
                className={css.img}
                src={url}
                alt={prompt}
                loading="lazy"
              />
              <div className={css.actions}>
                <button
                  type="button"
                  className={css.action}
                  onClick={() => onView(url, name)}
                  title={t('toolviewView')}
                >
                  {t('toolviewView')}
                </button>
                <button
                  type="button"
                  className={css.action}
                  onClick={handleEdit}
                  disabled={editState === 'staging'}
                  title={t('toolviewEdit')}
                >
                  {editState === 'staging' ? t('toolviewEditing') : t('toolviewEdit')}
                </button>
                <a
                  className={css.action}
                  href={url}
                  download={name}
                  title={t('toolviewDownload')}
                >
                  {t('toolviewDownload')}
                </a>
                <button
                  type="button"
                  className={css.action}
                  onClick={handleOpen}
                  disabled={openState === 'opening'}
                  title={t('toolviewOpen')}
                >
                  {openState === 'opening' ? t('toolviewOpening') : t('toolviewOpen')}
                </button>
              </div>
            </>
          )
          : failed !== undefined
            ? <div className={css.loadFailed} role="status">{failed}</div>
            : <div className={css.loading}>{/* CSS-only spinner-less placeholder */}</div>}
      </div>
      <div className={css.caption}>
        {prompt !== ''
          ? (
            <div className={css.promptRow} data-expanded={promptOpen ? 'true' : undefined}>
              <p ref={promptRef} className={`${css.captionLine} ${css.captionPrompt}`}>{prompt}</p>
              {promptOpen || promptClipped
                ? (
                  <button
                    type="button"
                    className={css.promptToggle}
                    aria-expanded={promptOpen}
                    title={promptOpen ? t('toolviewPromptCollapse') : t('toolviewPromptExpand')}
                    onClick={() => setPromptOpen(!promptOpen)}
                  >
                    {promptOpen ? t('toolviewPromptCollapse') : t('toolviewPromptExpand')}
                  </button>
                )
                : null}
            </div>
          )
          : null}
        {editState === 'staged'
          ? <p className={`${css.captionLine} ${css.editReady}`}>{t('toolviewEditReady')}</p>
          : null}
        {editState === 'failed' && editError !== undefined
          ? <p className={`${css.captionLine} ${css.actionError}`}>{t('toolviewEditFailed')}：{editError}</p>
          : null}
        {openState === 'failed' && openError !== undefined
          ? <p className={`${css.captionLine} ${css.actionError}`}>{t('toolviewOpenFailed')}：{openError}</p>
          : null}
      </div>
    </div>
  )
}
