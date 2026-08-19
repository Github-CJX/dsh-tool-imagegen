/**
 * Per-session pending-upload store for the text-model upload flow.
 *
 * Picking a file does NOT submit anything: the bytes are held here as a
 * "pending" draft (keyed by sessionId) until the user actually sends a message.
 * The composer's sendSession wrapper (see index.ts) consumes the draft at send
 * time — posting it to the upload bridge together with the typed text, so the
 * host enqueues ONE user message ([uploaded-image] block + model-facing
 * envelope carrying the text). Without a draft the wrapper is a pass-through,
 * so ordinary conversation is untouched.
 *
 * The store is module-global because the UploadButton (which manages the
 * draft) and the sendSession wrapper (which consumes it) are separate React
 * render paths — the button renders inside `conversation.input.left`, the
 * wrapper lives on the platform conversation service instance. Session-scoped
 * React state alone cannot span the two, so a tiny external store with
 * useSyncExternalStore subscriptions is used for the UI half.
 */

/** One pending upload: the file bytes (base64) + original metadata. */
export interface PendingUpload {
  /** The media type the file was accepted as (one of the ACCEPT_TYPES). */
  mediaType: string
  /** Base64 payload without the `data:<mime>;base64,` prefix. */
  data: string
  /** Original file name (host clamps it to 120 chars). */
  name: string
}

/** Upload-failure message surfaced on the button (kept per session). */
type Listener = () => void

const drafts = new Map<string, PendingUpload>()
const failures = new Map<string, string>()
const draftListeners = new Map<string, Set<Listener>>()
const failureListeners = new Map<string, Set<Listener>>()

function notify(listeners: Map<string, Set<Listener>>, sessionId: string): void {
  const set = listeners.get(sessionId)
  if (set === undefined) return
  for (const listener of [...set]) listener()
}

/** The pending upload for one session, or undefined when none is held. */
export function getPending(sessionId: string): PendingUpload | undefined {
  return drafts.get(sessionId)
}

/** Replace (or clear, when undefined) the pending upload for one session. */
export function setPending(sessionId: string, draft: PendingUpload | undefined): void {
  if (draft === undefined) drafts.delete(sessionId)
  else drafts.set(sessionId, draft)
  notify(draftListeners, sessionId)
}

/** The last send-time upload failure for one session (clear with undefined). */
export function getPendingFailure(sessionId: string): string | undefined {
  return failures.get(sessionId)
}

/** Record (or clear, when undefined) the send-time upload failure for one session. */
export function setPendingFailure(sessionId: string, message: string | undefined): void {
  if (message === undefined) failures.delete(sessionId)
  else failures.set(sessionId, message)
  notify(failureListeners, sessionId)
}

/** Subscribe to pending-upload changes for one session. */
export function subscribePending(sessionId: string, listener: Listener): () => void {
  let set = draftListeners.get(sessionId)
  if (set === undefined) {
    set = new Set()
    draftListeners.set(sessionId, set)
  }
  set.add(listener)
  return () => {
    set!.delete(listener)
    if (set!.size === 0) draftListeners.delete(sessionId)
  }
}

/** Subscribe to send-time upload failure changes for one session. */
export function subscribePendingFailure(sessionId: string, listener: Listener): () => void {
  let set = failureListeners.get(sessionId)
  if (set === undefined) {
    set = new Set()
    failureListeners.set(sessionId, set)
  }
  set.add(listener)
  return () => {
    set!.delete(listener)
    if (set!.size === 0) failureListeners.delete(sessionId)
  }
}
