/**
 * The shadowed `user` node renderer, registered into `conversation.chat.node`
 * for key 'user' at priority -1 (the platform's UserMessageNodeView sits at
 * priority 0; the lowest priority wins, so every user message flows through
 * this view).
 *
 * It is a faithful replica of the shipped user bubble — same row/stack/bubble
 * chrome, same hover clock + copy actions — extended with this plugin's
 * `uploaded-image` blocks (text-model uploads): those render inline through
 * the plugin's own loopback attachment bridge (the platform's loadImage only
 * authorizes `image` blocks). The model-facing envelope text (prefixed with
 * UPLOAD_ENVELOPE_PREFIX) is filtered out of the bubble; the user sees the
 * picture and their own words.
 */

import { memo, useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { ImageGallery } from '@deepseek-ai/dsh-client-ui-attachment'
import {
  IconCheckOutline16,
  IconCopyOutline16,
  JsonBlock,
  MessageText,
  Tooltip,
  writeClipboard,
} from '@deepseek-ai/dsh-client-ui-primitives'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import type { ContentBlock } from '@deepseek-ai/dsh-llm/types'
import { ATTACHMENT_API, envelopeRequestText, UPLOAD_ENVELOPE_PREFIX, type UploadedImageBlock } from './protocol.ts'
import css from './uploaded-image-bubble.module.css'

/** Props the composed chat-node entry receives (owner + standard seats). */
export type UploadedImageBubbleProps =
  PropsRuntime<'conversation.chat.node'>
  & PropsLocale<'dsh-imagegen'>

/** The translated text seat the copy action and clock read. */
type Translate = UploadedImageBubbleProps['t']

/** Message timestamp carrier in the transcript node data. */
type NodeTime = string | number | Date | undefined

/** Two-digit zero pad for the clock. */
function pad2(n: number): string {
  return n < 10 ? `0${n}` : String(n)
}

/**
 * Format a message time as a clock (same-day) or date + clock (older), with
 * the same calendar-day grouping as the shipped bubble.
 */
function formatClock(time: NodeTime, t: Translate): string | undefined {
  if (time === undefined) return undefined
  const date = new Date(time)
  if (Number.isNaN(date.getTime())) return undefined
  const now = new Date()
  const clock = `${pad2(date.getHours())}:${pad2(date.getMinutes())}`
  if (date.getFullYear() === now.getFullYear() && date.getMonth() === now.getMonth() && date.getDate() === now.getDate()) {
    return clock
  }
  const params = { y: date.getFullYear(), m: date.getMonth() + 1, d: date.getDate() }
  const dateLabel = date.getFullYear() === now.getFullYear() ? t('clock.md', params) : t('clock.ymd', params)
  return `${dateLabel} ${clock}`
}

/**
 * Display projection of reference forms in a user bubble — the shipped
 * projectUserText replication: plain-text `/name` / `@name` word-boundary
 * tokens decorate as chips, everything else stays plain text.
 */
function projectUserText(text: string): ReactNode {
  const pattern = /(^|\s)([/@][\w-]+)(?=\s|$)/g
  const parts: ReactNode[] = []
  let cursor = 0
  let match: RegExpExecArray | null
  while ((match = pattern.exec(text)) !== null) {
    const tokenStart = match.index + (match[1]?.length ?? 0)
    const label = match[2] ?? ''
    if (tokenStart > cursor) parts.push(<MessageText key={cursor} text={text.slice(cursor, tokenStart)} />)
    parts.push(
      <span
        key={tokenStart}
        className={css.refChip}
        data-ref-chip={label.startsWith('@') ? 'subagent' : 'skill'}
      >
        {label}
      </span>,
    )
    cursor = tokenStart + label.length
  }
  if (parts.length === 0) return <MessageText text={text} />
  if (cursor < text.length) parts.push(<MessageText key={cursor} text={text.slice(cursor)} />)
  return <>{parts}</>
}

/** The hover copy action (shipped MessageIconActions replication, copy only). */
function CopyAction({ text, t }: { text: string; t: Translate }) {
  const [copied, setCopied] = useState(false)
  const pending = useRef(false)
  const timer = useRef<number | null>(null)
  const epoch = useRef(0)

  useEffect(() => () => {
    epoch.current += 1
    pending.current = false
    if (timer.current !== null) window.clearTimeout(timer.current)
  }, [])

  const onCopy = useCallback(() => {
    if (copied || pending.current) return
    const generation = epoch.current
    pending.current = true
    void writeClipboard(text).then((ok) => {
      if (generation !== epoch.current) return
      pending.current = false
      if (!ok) return
      setCopied(true)
      timer.current = window.setTimeout(() => {
        timer.current = null
        setCopied(false)
      }, 1000)
    })
  }, [copied, text])

  return (
    <Tooltip label={copied ? t('copied') : t('copy')} side="bottom">
      <button
        type="button"
        className={css.action}
        aria-label={copied ? t('copied') : t('copy')}
        onClick={onCopy}
      >
        {copied ? <IconCheckOutline16 /> : <IconCopyOutline16 />}
      </button>
    </Tooltip>
  )
}

/** Narrow one content block to a text block. */
function isTextBlock(block: ContentBlock): block is Extract<ContentBlock, { type: 'text' }> {
  return block !== null && typeof block === 'object' && 'type' in block && block.type === 'text' && typeof block.text === 'string'
}

/** Narrow one content block to a platform `image` block. */
function isImageBlock(block: ContentBlock): block is Extract<ContentBlock, { type: 'image' }> {
  return block !== null && typeof block === 'object' && 'type' in block && block.type === 'image' && block.attachment !== undefined
}

/** Narrow one content block to this plugin's uploaded-image block. */
function isUploadedImageBlock(block: ContentBlock): block is UploadedImageBlock {
  return block !== null && typeof block === 'object' && 'type' in block && block.type === 'uploaded-image' && block.attachment !== undefined
}

/**
 * Render one user message: images (platform `image` + plugin `uploaded-image`)
 * above the text bubble, then the hover actions column.
 * @param props - the chat-node owner share, standard seats, and locale seat.
 * @returns the user bubble row.
 */
export const UploadedImageBubble = memo(function UploadedImageBubble(props: UploadedImageBubbleProps) {
  const { node, loadImage, t, sessionId } = props
  // Shape guards: never throw on an unexpected node carrier — a throw would
  // abdicate this shadowed renderer and fall back to the shipped bubble,
  // which would show the raw model-facing envelope text.
  const record = node !== null && typeof node === 'object'
    ? (node as { data?: unknown }).data
    : undefined
  const message = record !== null && typeof record === 'object'
    ? record as { content?: unknown; time?: NodeTime }
    : undefined
  const content = Array.isArray(message?.content) ? message.content as ContentBlock[] : []
  const time = message?.time

  // Classify: envelope text is model-facing only (filtered out of the bubble);
  // platform images go through the native loader; plugin uploads go through
  // the plugin's attachment bridge; everything else lands in JsonBlock.
  const texts: string[] = []
  const platformImages: ImageAttachmentRef[] = []
  const uploadedImages: UploadedImageBlock[] = []
  const rest: ContentBlock[] = []
  for (const block of content) {
    if (isTextBlock(block)) {
      // Envelope text is model-facing only — except the user's own typed
      // request, which the host embeds in its third line: extract and show it.
      if (block.text.startsWith(UPLOAD_ENVELOPE_PREFIX)) {
        const request = envelopeRequestText(block.text)
        if (request !== undefined) texts.push(request)
        continue
      }
      texts.push(block.text)
      continue
    }
    if (isImageBlock(block)) {
      platformImages.push(block.attachment)
      continue
    }
    if (isUploadedImageBlock(block)) {
      uploadedImages.push(block)
      continue
    }
    rest.push(block)
  }
  const text = texts.join('')
  const showBubble = text !== '' || rest.length > 0

  const items = useMemo(
    () => [...platformImages, ...uploadedImages.map(block => block.attachment)].map(attachment => ({ attachment })),
    [platformImages, uploadedImages],
  )
  const pluginIds = useMemo(
    () => new Set(uploadedImages.map(block => String(block.attachment.attachmentId))),
    [uploadedImages],
  )

  // Per-attachment URL resolution: plugin uploads are deterministic bridge
  // URLs (only when a session id is actually present); everything else defers
  // to the platform loader.
  const load = useCallback((attachment: ImageAttachmentRef) => {
    if (typeof sessionId === 'string' && sessionId !== '' && pluginIds.has(String(attachment.attachmentId))) {
      return Promise.resolve(
        `${ATTACHMENT_API.path}?session=${encodeURIComponent(sessionId)}&id=${encodeURIComponent(String(attachment.attachmentId))}`,
      )
    }
    return loadImage(attachment)
  }, [pluginIds, sessionId, loadImage])

  const labels = useMemo(() => ({
    image: t('image.label'),
    open: t('image.openOriginal'),
    openNamed: (label: string) => t('image.openOriginalLabel', { label }),
    loading: t('image.loading'),
    loadFailed: t('image.loadFailed'),
    lightbox: { dialog: t('image.preview'), close: t('image.closePreview') },
  }), [t])

  const clock = useMemo(() => formatClock(time, t), [time, t])
  const truncated = useCallback((total: number) => t('json.truncated', { total }), [t])

  return (
    <div className={css.userRow} data-time-hover-root>
      <div className={css.userStack}>
        <ImageGallery images={items} load={load} align="end" labels={labels} />
        {showBubble && (
          <div className={css.bubble}>
            {projectUserText(text)}
            {rest.map((block, index) => (
              <JsonBlock
                key={index}
                label={t('message.extraBlock')}
                payload={block}
                truncatedLabel={truncated}
              />
            ))}
          </div>
        )}
      </div>
      <div className={css.actions}>
        {clock !== undefined ? <span className={css.timeStart}>{clock}</span> : null}
        <CopyAction text={text} t={t} />
      </div>
    </div>
  )
})
