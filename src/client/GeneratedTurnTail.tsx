/**
 * The Turn-level generated-picture card, registered in ui-chat's
 * `conversation.chat.turnTail` list seat.
 *
 * Placement is the whole point: the default ("compact") transcript folds a
 * closed Turn's tool calls into a collapsible process group, so a picture that
 * lives only inside the `generate_image` tool card disappears from the reading
 * flow the moment the Turn ends. This seat renders BENEATH the Turn's closing
 * prose and OUTSIDE that group, so a generated picture reads as part of the
 * answer rather than as a detail of the tool call that produced it.
 *
 * The pictures come from the Turn data {@link generatedImagesDefinition}
 * folds out of the persisted session events, so the card reproduces itself on
 * Session-log replay. Bytes are read from this plugin's own route
 * ({@link generatedImageUrl}): the Turn tail is not an atomic tool view, so the
 * platform's session-authorized `loadImage` is not among its owner props.
 */

import { useEffect, useMemo, useState } from 'react'
import type { ImageAttachmentRef } from '@deepseek-ai/dsh-attachment'
import { generatedImageUrl, type GeneratedImageEdit, type GeneratedImageRecord, type GeneratedImagesMeta } from './protocol.ts'
import {
  GENERATED_IMAGES_KIND,
  generatedCallsForClosing,
  type GeneratedTurnCall,
  type GeneratedTurnData,
  type GeneratedTurnImage,
} from './turn-definition.ts'
import { FullscreenViewer, ImageCard, attachmentOf } from './GenerateImageView.tsx'
import type { ImageGenLocaleKey } from './locales.ts'
import css from './generate-image-view.module.css'

/** The registrant-side face the Turn-tail entry injects (per session). */
export interface GeneratedTurnTailFace {
  /** Ask the host to open one picture in the system's image viewer. */
  openLocally: (attachment: ImageAttachmentRef) => Promise<void>
  /** Stage one picture as the session's pending edit reference (修改). */
  stageEdit: (image: GeneratedImageEdit, callId: string) => Promise<void>
  /** Read one call's captions + work-dir handles from the manifest route. */
  loadImagesMeta: (callId: string) => Promise<GeneratedImagesMeta | undefined>
  /** Read one picture's edit bytes (base64) for staging a follow-up. */
  loadEditBytes: (attachmentId: string, callId: string) => Promise<string | undefined>
  /**
   * Read this session's generated-image projection grouped by Turn from the
   * host's log. Used only when the client-side fold has nothing for this Turn.
   */
  loadTurnImages: () => Promise<Record<number, GeneratedTurnCall[]>>
}

/**
 * The Turn-tail owner share this card reads. Declared structurally (not
 * imported) because the platform's conversation types are not a build
 * dependency of this package; every field is read defensively so an
 * unexpected shape declines the card instead of throwing.
 */
export interface GeneratedTurnTailOwnerProps {
  /** The closing Turn: its folded data and its recorded end. */
  turn?: {
    /** Turn data, keyed by definition kind. */
    data?: { get?: (kind: string) => unknown }
    /** The Turn's end record (its `seq` bounds the projection). */
    end?: { seq?: unknown }
  }
  /** Fallback bound when the Turn records no end. */
  seq?: number
  /** The session the Turn belongs to (the byte route key). */
  sessionId?: string
}

/** Props the composed Turn-tail card receives. */
export type GeneratedTurnTailProps =
  GeneratedTurnTailOwnerProps
  & GeneratedTurnTailFace
  & { t: (key: ImageGenLocaleKey) => string }

/**
 * Bounded runtime report for this seat. The failure mode it guards against is
 * silent: the Turn-tail seat renders every list entry for every Turn, and a
 * component that finds no folded data can only return null — indistinguishable
 * from "the entry was never registered" or "the Definition never folded".
 *
 * Reported PER TURN (capped), not once: the seat is called for every Turn in
 * the transcript, and the oldest loaded Turn often has no `turn/start` inside
 * the window, so sampling a single Turn would report `folded=none` even when
 * the fold works for the Turn that actually holds a picture.
 */
const seatReported = new Set<string>()

/** Report one Turn's projection once, within a small budget. */
function reportSeat(turn: unknown, sessionId: unknown, folded: number | undefined, bounded: number): void {
  const index = (turn as { turn?: unknown } | undefined)?.turn
  const label = typeof index === 'number' ? String(index) : 'unknown'
  if (seatReported.has(label) || seatReported.size >= 8) return
  seatReported.add(label)
  console.info(
    `[dsh-tool-imagegen] turn-tail seat: turn=${label}`
    + ` session=${typeof sessionId === 'string' && sessionId !== '' ? 'present' : 'missing'}`
    + ` folded=${folded === undefined ? 'none' : `${folded} call(s)`}`
    + ` bounded=${bounded}`,
  )
}

/**
 * Contribute the Turn's generated pictures beneath its closing prose.
 *
 * Declines (returns null) for every Turn that produced no picture — the seat
 * is shared with the platform's other Turn-level artifacts, so a quiet Turn
 * must contribute nothing at all.
 * @param props - the closing Turn, the injected face, and localized copy.
 * @returns the picture rows, or null when the Turn generated none.
 */
export function GeneratedTurnTail(props: GeneratedTurnTailProps) {
  const { sessionId, turn } = props
  // Bound the projection by the Turn's OWN end: a settlement that lands after
  // the closing text still belongs to this Turn, while the seat itself exists
  // only for a completed Turn.
  const endSeq = typeof turn?.end?.seq === 'number' ? turn.end.seq : undefined
  const bound = endSeq ?? (typeof props.seq === 'number' ? props.seq : Number.POSITIVE_INFINITY)
  const data = turn?.data?.get?.(GENERATED_IMAGES_KIND) as GeneratedTurnData | undefined
  const folded = useMemo(() => generatedCallsForClosing(data, bound), [data, bound])

  // Fallback for Turns the fold does not cover. A Definition only sees events
  // matched AFTER it registered, and only those inside the client's loaded
  // window; the host route reads the same facts from the whole durable log.
  const turnIndex = (turn as { turn?: unknown } | undefined)?.turn
  const loadTurnImages = props.loadTurnImages
  const [remote, setRemote] = useState<GeneratedTurnCall[] | undefined>(undefined)
  useEffect(() => {
    if (folded.length > 0) return
    if (typeof sessionId !== 'string' || sessionId === '') return
    if (typeof turnIndex !== 'number') return
    let alive = true
    loadTurnImages()
      .then((byTurn) => { if (alive) setRemote(byTurn[turnIndex]) })
      .catch(() => {
        // The fold is the primary source; a failed fallback renders nothing.
      })
    return () => { alive = false }
  }, [folded.length, sessionId, turnIndex, loadTurnImages])

  const calls = folded.length > 0 ? folded : (remote ?? [])

  reportSeat(turn, sessionId, folded.length, calls.length)

  if (typeof sessionId !== 'string' || sessionId === '') return null
  if (calls.length === 0) return null
  return <GeneratedTurnPictures sessionId={sessionId} calls={calls} {...props} />
}

/**
 * Render the pictures of every settled call, with the same per-image actions
 * the tool card offers (全屏查看 / 修改 / 下载 / 本地打开).
 * @param props - the session, the Turn's settled calls, and the injected face.
 * @returns the picture rows.
 */
function GeneratedTurnPictures(
  props: GeneratedTurnTailProps & { sessionId: string; calls: GeneratedTurnCall[] },
) {
  const { sessionId, calls, t } = props
  // One manifest per settled call: it carries the prompt caption, the work-dir
  // handle and the edit bytes. Absent metadata is not an error — the pictures
  // themselves come from the folded session events, so the card still renders.
  const [metas, setMetas] = useState<Record<string, GeneratedImagesMeta | undefined>>({})
  const [viewing, setViewing] = useState<{ url: string; name: string } | undefined>(undefined)

  const loadImagesMeta = props.loadImagesMeta
  useEffect(() => {
    let alive = true
    for (const call of calls) {
      loadImagesMeta(call.callId)
        .then((meta) => {
          if (!alive || meta === undefined) return
          setMetas(previous => ({ ...previous, [call.callId]: meta }))
        })
        .catch(() => {
          // The manifest is a convenience; the pictures still render.
        })
    }
    return () => { alive = false }
  }, [calls, loadImagesMeta])

  return (
    <div className={css.turnTail} data-imagegen-generated="">
      {calls.map(call => call.images.map((image) => {
        const meta = metas[call.callId]
        const record: GeneratedImageRecord | undefined =
          meta?.images.find(entry => entry.attachmentId === image.attachmentId)
        return (
          <ImageCard
            key={`${call.callId}:${image.index}`}
            attachment={attachmentFor(image)}
            record={record}
            prompt={meta?.prompt ?? call.prompt}
            callId={call.callId}
            // The Turn tail has no session-authorized loader among its owner
            // props, so bytes come from this plugin's own authorized route.
            loadImage={() => generatedImageUrl(sessionId, call.callId, image.index)}
            openLocally={props.openLocally}
            stageEdit={props.stageEdit}
            loadEditBytes={props.loadEditBytes}
            onView={(url, name) => setViewing({ url, name })}
            t={t}
            index={image.index}
          />
        )
      }))}
      {viewing !== undefined
        ? <FullscreenViewer url={viewing.url} name={viewing.name} onClose={() => setViewing(undefined)} />
        : null}
    </div>
  )
}

/** The attachment reference one folded picture describes. */
function attachmentFor(image: GeneratedTurnImage): ImageAttachmentRef {
  return attachmentOf({
    attachmentId: image.attachmentId,
    mediaType: image.mediaType,
    bytes: image.bytes ?? 0,
    width: image.width ?? 0,
    height: image.height ?? 0,
    ...image.name === undefined ? {} : { name: image.name },
  })
}
