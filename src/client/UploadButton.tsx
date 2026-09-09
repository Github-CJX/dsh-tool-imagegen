/**
 * The composer tool-row upload button, registered into `conversation.input.left`
 * (the left end of the tool row inside the composer card — a small
 * always-visible control).
 *
 * Why this exists: the platform's native composer upload is hard-rejected for
 * text-only models (apiproxy answers MODEL_DOES_NOT_SUPPORT_IMAGES for any
 * prompt whose content carries an `image` block), so this plugin offers its own
 * entry. The pick-file button is shown unconditionally: the same host-side
 * pending-upload path works for text-only AND image-capable models — the bytes
 * are stored, the model receives the work-dir path through the envelope, and
 * the user sees the picture inline through the plugin's uploaded-image bubble.
 *
 * (A previous revision gated the button behind a "model is text-only"
 * capability check fed by `connection.api.sessions.models`. That RPC no longer
 * exists on the DSH client connection handle, so the check always threw and
 * the button silently disappeared for every session — including text-only
 * ones. Capability gating is dropped entirely; showing the button can never
 * hide a working path.)
 *
 * Picking a file does NOT submit anything: the bytes are held as a per-session
 * pending draft (see pending-upload.ts). When the user types a message and
 * sends, the conversation sendSession wrapper (see index.ts) consumes the
 * draft — POSTing it to the UPLOAD bridge together with the typed text, so the
 * host enqueues ONE user message ([uploaded-image] block + model-facing
 * envelope carrying the text). The picture renders inline in the conversation
 * while the model only ever sees the envelope telling it the work-dir path to
 * feed back through generate_image's `image` parameter.
 *
 * The pending-draft "selected" chip renders for ANY session holding a draft —
 * the generated-image toolview's 修改 button (stageEdit) writes the same store,
 * so edit references stay visible in the composer too.
 */

import { useCallback, useRef, useState, useSyncExternalStore } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import {
  getPending,
  getPendingFailure,
  setPending,
  setPendingFailure,
  subscribePending,
  subscribePendingFailure,
} from './pending-upload.ts'
import css from './upload-button.module.css'

/** Accepted image media types (mirrored from the host attachment limits). */
const ACCEPT_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'image/gif']

/** Per-upload byte cap (the host attachment service's maxImageBytes). */
const MAX_BYTES = 5 * 1024 * 1024

/** The registrant-side face the `conversation.input.left` entry injects. */
export interface UploadButtonFace {
  /** Same-origin fetch for the loopback bridge routes. */
  fetchFn: typeof fetch
}

/** Props the composed input-left entry receives. */
export type UploadButtonProps =
  PropsRuntime<'conversation.input.left'>
  & PropsLocale<'dsh-imagegen'>
  & UploadButtonFace

/** Read a File as a base64 data URL (best-effort; callers re-validate). */
function readAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(typeof reader.result === 'string' ? reader.result : '')
    reader.onerror = () => reject(new Error('file read failed'))
    reader.readAsDataURL(file)
  })
}

/**
 * Render the composer upload button.
 * @param props - the input-left owner share + standard seats (sessionId) + face.
 * @returns the button cell (or the pending-draft chip while a draft is staged).
 */
export function UploadButton(props: UploadButtonProps) {
  const { t, sessionId } = props
  const inputRef = useRef<HTMLInputElement>(null)

  // The per-session pending draft + last send-time failure (shared with the
  // sendSession wrapper through the module store).
  const draft = useSyncExternalStore(
    useCallback((listener) => subscribePending(sessionId, listener), [sessionId]),
    useCallback(() => getPending(sessionId), [sessionId]),
  )
  const failure = useSyncExternalStore(
    useCallback((listener) => subscribePendingFailure(sessionId, listener), [sessionId]),
    useCallback(() => getPendingFailure(sessionId), [sessionId]),
  )

  // Validate + stage a picked file as the pending draft (no network I/O —
  // submission happens at send time through the sendSession wrapper).
  const onPick = useCallback(async (file: File) => {
    if (ACCEPT_TYPES.includes(file.type) === false) {
      setPendingFailure(sessionId, t('uploadTypeRejected'))
      return
    }
    if (file.size > MAX_BYTES) {
      setPendingFailure(sessionId, t('uploadTooLarge'))
      return
    }
    try {
      const dataUrl = await readAsDataUrl(file)
      const comma = dataUrl.indexOf(',')
      const data = comma >= 0 ? dataUrl.slice(comma + 1) : dataUrl
      setPending(sessionId, { mediaType: file.type, data, name: file.name })
      setPendingFailure(sessionId, undefined)
    } catch (pickError) {
      setPendingFailure(sessionId, pickError instanceof Error && pickError.message !== '' ? pickError.message : t('uploadFailed'))
    }
    if (inputRef.current !== null) inputRef.current.value = ''
  }, [sessionId, t])

  // A pending draft renders as a "selected" chip: the send submits the image
  // together with the typed message; clicking ✕ discards the draft. The chip
  // shows for EVERY session that holds a draft, including ones staged by the
  // generated-image toolview's 修改 button.
  if (draft !== undefined) {
    return (
      <div className={css.wrap}>
        <span className={css.selected} title={t('uploadHelp')}>
          {t('uploadSelected')}
          <button
            type="button"
            className={css.remove}
            onClick={() => { setPending(sessionId, undefined); setPendingFailure(sessionId, undefined) }}
            aria-label={t('uploadRemove')}
          >
            ✕
          </button>
        </span>
        {failure !== undefined ? <span className={css.error} role="status">{failure}</span> : null}
      </div>
    )
  }

  return (
    <div className={css.wrap}>
      <button
        type="button"
        className={css.button}
        onClick={() => inputRef.current?.click()}
        title={t('uploadHelp')}
        aria-label={t('uploadTitle')}
      >
        {t('uploadTitle')}
      </button>
      <input
        ref={inputRef}
        type="file"
        className={css.hidden}
        accept={ACCEPT_TYPES.join(',')}
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file !== undefined) void onPick(file)
        }}
      />
      {failure !== undefined ? <span className={css.error} role="status">{failure}</span> : null}
    </div>
  )
}
