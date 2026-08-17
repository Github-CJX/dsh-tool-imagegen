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
import css from './generate-image-view.module.css'

/** The registrant-side face the toolview entry injects (per session occurrence). */
export interface GenerateImageViewFace {
  /**
   * Resolve one durable attachment to a browser URL. Served by the plugin's
   * own loopback attachment bridge (the conversation service's resolveImage
   * only authorizes `image` blocks, which this plugin never writes).
   */
  loadImage: (attachment: ImageAttachmentRef) => Promise<string>
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

/** Parse the running call's argsRaw for a readable prompt (best effort). */
function promptFromArgs(argsRaw: string): string | undefined {
  if (argsRaw === '') return undefined
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
  // Running calls carry no content; settled results carry the render() output.
  const settled = 'content' in block
  const images = settled ? generatedImageBlocks(block.content) : []
  const isError = settled && 'isError' in block && block.isError === true

  const runningPrompt = settled ? undefined : promptFromArgs(block.argsRaw)
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
    const envelope = textBlocks(block.content).join('\n')
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
            t={props.t}
            index={index}
          />
        ))}
      </div>
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
  t: (key: 'toolviewDownload') => string
  index: number
}) {
  const { image, loadImage, t, index } = props
  const [url, setUrl] = useState<string | undefined>(undefined)
  const [failed, setFailed] = useState<string | undefined>(undefined)

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

  const meta = (() => {
    const parts: string[] = []
    if (typeof image.model === 'string' && image.model !== '') parts.push(`${image.model}`)
    if (typeof image.size === 'string' && image.size !== '') parts.push(image.size)
    return parts.join(' · ')
  })()

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
              <a
                className={css.download}
                href={url}
                download={fileNameOf(image, index)}
                title={t('toolviewDownload')}
              >
                {t('toolviewDownload')}
              </a>
            </>
          )
          : failed !== undefined
            ? <div className={css.loadFailed} role="status">{failed}</div>
            : <div className={css.loading}>{/* CSS-only spinner-less placeholder */}</div>}
      </div>
      <div className={css.caption}>
        {meta !== '' ? <p className={css.captionLine}>{meta}</p> : null}
        {image.prompt !== '' ? <p className={`${css.captionLine} ${css.captionPrompt}`}>{image.prompt}</p> : null}
      </div>
    </div>
  )
}
