/**
 * The inline conversation view for the `generate_image` tool, registered as the
 * keyed `tool.call.toolview` entry for that tool name. Because the entry is
 * keyed, it REPLACES the generic tool row for generate_image calls — so this
 * view must cover running, settled, and error states itself.
 *
 * The model never sees an `image` block from this tool (the render() output is
 * `generated-image` blocks, which the image-capability check ignores), so this
 * view is the ONLY place the pictures surface: it resolves each durable
 * attachment to a browser URL through the conversation service and renders
 * `<img>` inline.
 */

import { useEffect, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import type { GeneratedImageBlock } from './protocol.ts'
import type { ImageGenLocaleKey } from './locales.ts'
import css from './generate-image-view.module.css'

/** The registrant-side face the toolview entry injects (per session occurrence). */
export interface GenerateImageViewFace {
  /**
   * Resolve one durable attachment to a browser URL. Served by the plugin's
   * own loopback attachment bridge (the conversation service's resolveImage
   * only authorizes `image` blocks, which this plugin never writes).
   */
  loadImage: (attachment: ImageAttachmentRef) => Promise<string>
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
   * via generate_image (the envelope carries the work-dir path). Works for
   * text-only and image-capable models alike.
   */
  stageEdit: (attachment: ImageAttachmentRef) => Promise<void>
}

/** Props the composed toolview receives. */
export type GenerateImageViewProps =
  PropsRuntime<'tool.call.toolview'>
  & PropsLocale<'dsh-imagegen'>
  & GenerateImageViewFace

/** Narrow the settled content to this plugin's generated-image blocks. */
function generatedImageBlocks(content: readonly ContentBlock[]): GeneratedImageBlock[] {
  return content.filter((block): block is GeneratedImageBlock => block !== null && typeof block === 'object' && 'type' in block && block.type === 'generated-image')
}

/** Text blocks in the settled content (used as the error/summary envelope). */
function textBlocks(content: readonly ContentBlock[]): string[] {
  return content
    .filter((block): block is Extract<ContentBlock, { type: 'text' }> => block !== null && typeof block === 'object' && 'type' in block && block.type === 'text' && typeof block.text === 'string')
    .map(block => block.text)
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
 * @param props - the tool call's owner share, the locale seat, and loadImage.
 * @returns the inline card.
 */
export function GenerateImageView(props: GenerateImageViewProps) {
  const { t, block } = props
  // Running calls carry no content; settled results carry the render() output
  // (either directly or under `result`). Anything unexpected renders the
  // running card — never throws, so the keyed entry cannot abdicate.
  const content = settledContentOf(block)
  const settled = content !== undefined
  const images = settled ? generatedImageBlocks(content) : []
  const isError = settledErrorOf(block)
  // The fullscreen overlay holds one image at a time (url + display name).
  const [viewing, setViewing] = useState<{ url: string; name: string } | undefined>(undefined)

  const runningPrompt = settled ? undefined : promptFromArgs(block)
  const captionMeta = (image: GeneratedImageBlock): string => {
    const parts: string[] = []
    if (typeof image.model === 'string' && image.model !== '') parts.push(image.model)
    if (typeof image.size === 'string' && image.size !== '') parts.push(image.size)
    return parts.join(' · ')
  }

  if (!settled) {
    return (
      <div className={css.root}>
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

  // Settled with no generated-image blocks: error or text-only outcome. The
  // keyed entry replaced the generic row, so surface the text envelope rather
  // than dropping the call.
  if (images.length === 0) {
    const envelope = textBlocks(content).join('\n')
    return (
      <div className={css.root}>
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
    <div className={css.root}>
      <div className={css.head}>
        <span className={css.title}>{t('toolviewTitle')}</span>
        <span className={css.meta}>
          {images.length > 1 ? `${images.length} · ` : ''}
          {captionMeta(images[0])}
        </span>
        {isError ? <span className={css.state}>{t('toolviewFailed')}</span> : null}
      </div>
      <div className={css.body}>
        {images.map((image, index) => (
          <ImageRow
            key={image.attachment.attachmentId ?? `generated-${index}`}
            image={image}
            loadImage={props.loadImage}
            openLocally={props.openLocally}
            stageEdit={props.stageEdit}
            onView={(url, name) => setViewing({ url, name })}
            t={props.t}
            index={index}
          />
        ))}
      </div>
      {viewing !== undefined
        ? <FullscreenViewer url={viewing.url} name={viewing.name} onClose={() => setViewing(undefined)} />
        : null}
    </div>
  )
}

/** Fullscreen image overlay: dark backdrop, Esc / backdrop-click closes. */
function FullscreenViewer(props: { url: string; name: string; onClose: () => void }) {
  const { url, name, onClose } = props
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])
  return (
    <div className={css.viewer} role="dialog" aria-label={name} onClick={onClose}>
      <button type="button" className={css.viewerClose} aria-label="close" onClick={onClose}>✕</button>
      <img
        className={css.viewerImg}
        src={url}
        alt={name}
        onClick={(event) => event.stopPropagation()}
      />
    </div>
  )
}

/** A usable file name for one generated image (attachment name or fallback). */
function fileNameOf(image: GeneratedImageBlock, index: number): string {
  const name = image.attachment.name
  if (typeof name === 'string' && name !== '') return name
  const extension = (() => {
    switch (image.attachment.mediaType) {
      case 'image/jpeg': return 'jpg'
      case 'image/webp': return 'webp'
      case 'image/gif': return 'gif'
      default: return 'png'
    }
  })()
  return `generated-${index + 1}.${extension}`
}

/** One generated image: resolve its URL, then render the frame + caption. */
function ImageRow(props: {
  image: GeneratedImageBlock
  loadImage: (attachment: ImageAttachmentRef) => Promise<string>
  openLocally: (attachment: ImageAttachmentRef) => Promise<void>
  stageEdit: (attachment: ImageAttachmentRef) => Promise<void>
  onView: (url: string, name: string) => void
  t: (key: ImageGenLocaleKey) => string
  index: number
}) {
  const { image, loadImage, openLocally, stageEdit, onView, t, index } = props
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [failed, setFailed] = useState<string | undefined>(undefined)
  // Local-open handshake: idle → opening → idle (success) or failed (error).
  const [openState, setOpenState] = useState<'idle' | 'opening' | 'failed'>('idle')
  const [openError, setOpenError] = useState<string | undefined>(undefined)
  // Edit staging: idle → staging → staged (composer chip appears) or failed.
  const [editState, setEditState] = useState<'idle' | 'staging' | 'staged' | 'failed'>('idle')
  const [editError, setEditError] = useState<string | undefined>(undefined)

  useEffect(() => {
    let alive = true
    loadImage(image.attachment)
      .then((resolved) => { if (alive) setUrl(resolved) })
      .catch((error: unknown) => {
        if (!alive) return
        setFailed(error instanceof Error ? error.message : String(error))
      })
    return () => { alive = false }
  }, [loadImage, image.attachment])

  const handleOpen = () => {
    if (openState === 'opening') return
    setOpenState('opening')
    setOpenError(undefined)
    openLocally(image.attachment)
      .then(() => setOpenState('idle'))
      .catch((error: unknown) => {
        setOpenState('failed')
        setOpenError(error instanceof Error ? error.message : String(error))
      })
  }

  const handleEdit = () => {
    if (editState === 'staging') return
    setEditState('staging')
    setEditError(undefined)
    stageEdit(image.attachment)
      .then(() => setEditState('staged'))
      .catch((error: unknown) => {
        setEditState('failed')
        setEditError(error instanceof Error ? error.message : String(error))
      })
  }

  const meta = (() => {
    const parts: string[] = []
    if (typeof image.model === 'string' && image.model !== '') parts.push(`${image.model}`)
    if (typeof image.size === 'string' && image.size !== '') parts.push(image.size)
    return parts.join(' · ')
  })()

  const name = fileNameOf(image, index)

  return (
    <div className={css.image}>
      <div className={css.frame}>
        {url !== undefined
          ? (
            <>
              <img
                className={css.img}
                src={url}
                alt={image.prompt}
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
        {meta !== '' ? <p className={css.captionLine}>{meta}</p> : null}
        {image.prompt !== '' ? <p className={`${css.captionLine} ${css.captionPrompt}`}>{image.prompt}</p> : null}
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
