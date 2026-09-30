/**
 * Turn-level projection of the pictures a Turn generated, for the transcript
 * card registered in the `conversation.chat.turnTail` list seat.
 *
 * Why a Turn Definition and not just the toolview: the default ("compact")
 * transcript folds a closed Turn's tool calls into a process disclosure, so a
 * picture that lives only inside the `generate_image` tool card is hidden as
 * soon as the Turn ends. A Turn Definition publishes the settled result
 * against its Turn, and the Turn-tail seat renders it BENEATH the closing
 * prose and OUTSIDE that collapsible group — which is where the user expects a
 * generated picture to appear.
 *
 * The pictures are narrowed from the persisted result JSON (the `image` blocks
 * the tool rendered), exactly like the shipped `schedule_create` card narrows
 * its created task: Session-log replay reproduces the card with no Host
 * change and no presentation metadata. The call's own tool-group cell keeps
 * its keyed `tool.call.toolview` view, which is where the per-call actions
 * (本地打开 / 修改 / 全屏查看) live while the Turn is still open.
 */

/** One picture of a settled call: the durable reference plus its position. */
export interface GeneratedTurnImage {
  /** Durable attachment id (the platform's own reference). */
  attachmentId: string
  /** Media type of the stored bytes. */
  mediaType: string
  /** Stored byte length, when the block carries it. */
  bytes?: number
  /** Pixel width, when the block carries it. */
  width?: number
  /** Pixel height, when the block carries it. */
  height?: number
  /** Stored file name, when the block carries it. */
  name?: string
  /** Position within its call's result (the byte route's index). */
  index: number
}

/** One settled `generate_image` call of a Turn. */
export interface GeneratedTurnCall {
  /** The call id (the manifest/byte route key). */
  callId: string
  /** Event sequence of the settlement (bounds the Turn-tail projection). */
  seq: number
  /** The prompt, read from the call's own arguments when available. */
  prompt: string
  /** The pictures that call produced, in block order. */
  images: GeneratedTurnImage[]
}

/** Folded state of one Turn: its calls that produced pictures. */
export interface GeneratedTurnData {
  /** The Turn index this state belongs to. */
  turn: number
  /** Settled calls that produced at least one picture, in settlement order. */
  calls: GeneratedTurnCall[]
  /** In-window `tool/call` heads, keyed by call id (name + raw arguments). */
  callsByName: Map<string, { name: string, argsRaw: string }>
}

/** The `kind` this definition publishes under (the Turn data key). */
export const GENERATED_IMAGES_KIND = 'imagegen-generated'

/**
 * Bounded runtime trace.
 *
 * A Definition that is registered but never matched is INDISTINGUISHABLE from
 * one that was never registered, and from one whose Turn data is not the map
 * the seat reads: all three leave the card returning null. These few lines
 * separate the cases at the source (the fold itself) rather than inferring it
 * from the seat.
 */
const trace = { match: 0, start: 0, update: 0 }

/** Record one fold step, within a small per-phase budget. */
function traceStep(phase: 'match' | 'start' | 'update', detail: string): void {
  const limit = phase === 'match' ? 2 : 3
  if (trace[phase] >= limit) return
  trace[phase] += 1
  console.info(`[dsh-tool-imagegen] definition ${phase}: ${detail}`)
}

/**
 * Block types whose attachment is one of OUR pictures. `image` is the platform
 * block the tool renders today; `generated-image` is the plugin's old private
 * block, still present in sessions written before that fix, so replaying an
 * older session still shows its pictures.
 */
const PICTURE_BLOCK_TYPES = new Set(['image', 'generated-image'])

/** Read a string field off an unknown record. */
function stringField(value: unknown, key: string): string | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const field = (value as Record<string, unknown>)[key]
  return typeof field === 'string' && field !== '' ? field : undefined
}

/** Read a number field off an unknown record. */
function numberField(value: unknown, key: string): number | undefined {
  if (value === null || typeof value !== 'object') return undefined
  const field = (value as Record<string, unknown>)[key]
  return typeof field === 'number' && Number.isFinite(field) ? field : undefined
}

/**
 * Narrow one content array to the pictures it carries, in block order.
 * @param content - the settled result's content blocks.
 * @returns the pictures, empty when the call produced none.
 */
export function picturesInContent(content: unknown): GeneratedTurnImage[] {
  if (!Array.isArray(content)) return []
  const images: GeneratedTurnImage[] = []
  for (const block of content) {
    if (block === null || typeof block !== 'object') continue
    const type = (block as Record<string, unknown>).type
    if (typeof type !== 'string' || !PICTURE_BLOCK_TYPES.has(type)) continue
    const ref = (block as Record<string, unknown>).attachment
    const attachmentId = stringField(ref, 'attachmentId')
    if (attachmentId === undefined) continue
    images.push({
      attachmentId,
      mediaType: stringField(ref, 'mediaType') ?? 'image/png',
      ...numberField(ref, 'bytes') === undefined ? {} : { bytes: numberField(ref, 'bytes') as number },
      ...numberField(ref, 'width') === undefined ? {} : { width: numberField(ref, 'width') as number },
      ...numberField(ref, 'height') === undefined ? {} : { height: numberField(ref, 'height') as number },
      ...stringField(ref, 'name') === undefined ? {} : { name: stringField(ref, 'name') as string },
      index: images.length,
    })
  }
  return images
}

/** Read the call id a settled tool result belongs to. */
function resultCallId(data: unknown): string | undefined {
  const message = (data as { message?: unknown } | null)?.message
  return stringField(message, 'toolCallId')
    ?? stringField((message as { source?: unknown } | null)?.source, 'callId')
    ?? stringField(data, 'callId')
}

/** Read the prompt off a call's raw arguments. */
function promptOf(argsRaw: string | undefined): string {
  if (typeof argsRaw !== 'string' || argsRaw === '') return ''
  try {
    const parsed = JSON.parse(argsRaw) as { prompt?: unknown }
    return typeof parsed.prompt === 'string' ? parsed.prompt : ''
  } catch {
    return ''
  }
}

/** The minimal event shape this definition reads (kept structural on purpose). */
export interface TurnEventLike {
  /** Event type (`turn/start`, `tool/call`, `tool/result`, …). */
  type?: unknown
  /** Monotonic sequence within the session. */
  seq?: unknown
  /** Event payload. */
  data?: unknown
}

/** One match: which Turn the event belongs to, and how it folds. */
export interface TurnMatch {
  /** The Turn index (the Turn-data key). */
  id: string
  /** `start` opens the Turn's state; `update` folds into it. */
  role: 'start' | 'update'
  /** The matched event. */
  event: TurnEventLike
}

/** The fold context the registry hands `update`. */
export interface TurnContext {
  /** The state produced by the previous fold step. */
  state: GeneratedTurnData
}

/**
 * The Turn Definition. Registered with `ctx.uiConversation.events.register`;
 * its `kind` is the key the Turn-tail card reads through
 * `owner.turn.data.get(GENERATED_IMAGES_KIND)`.
 *
 * Only events that can change the projection are matched, so an unrelated
 * `tool/result` never schedules a fold step.
 */
export const generatedImagesDefinition = {
  kind: GENERATED_IMAGES_KIND,
  /**
   * Claim the events that can change a Turn's picture set.
   * @param event - one session event.
   * @returns the Turn to fold into, or null to ignore the event.
   */
  match(event: TurnEventLike): TurnMatch | null {
    const turn = numberField(event.data, 'turn')
    if (turn === undefined) return null
    if (event.type === 'turn/start') {
      traceStep('match', `turn/start turn=${turn}`)
      return { id: String(turn), role: 'start', event }
    }
    if (event.type === 'tool/call') return { id: String(turn), role: 'update', event }
    if (event.type === 'tool/result') return { id: String(turn), role: 'update', event }
    return null
  },
  /**
   * Open a Turn's state. The registry guarantees `start` sees `turn/start`.
   * @param _context - the fold context (unused).
   * @param match - the opening match.
   * @returns the fresh Turn state.
   */
  start(_context: unknown, match: TurnMatch): GeneratedTurnData {
    if (match.event.type !== 'turn/start') {
      throw new Error('imagegen-generated start requires turn/start')
    }
    const turn = numberField(match.event.data, 'turn') ?? 0
    traceStep('start', `turn=${turn}`)
    return {
      turn,
      calls: [],
      callsByName: new Map(),
    }
  },
  /**
   * Fold one event into the Turn's state.
   * @param context - the fold context (its `state` is the previous value).
   * @param match - the matched event.
   * @returns the next state (the same object when nothing changed).
   */
  update(context: TurnContext, match: TurnMatch): GeneratedTurnData {
    const state = context.state
    if (match.event.type === 'tool/call') {
      const callId = stringField(match.event.data, 'callId')
      if (callId === undefined) return state
      const callsByName = new Map(state.callsByName)
      callsByName.set(callId, {
        name: stringField(match.event.data, 'name') ?? '',
        argsRaw: stringField(match.event.data, 'arguments') ?? '',
      })
      return { ...state, callsByName }
    }
    if (match.event.type !== 'tool/result') return state
    const data = match.event.data
    const message = (data as { message?: unknown } | null)?.message
    // A failed call produced no picture; keep the state identical so the
    // registry can skip the update.
    if ((message as { isError?: unknown } | null)?.isError === true) return state
    const callId = resultCallId(data)
    if (callId === undefined) return state
    const images = picturesInContent((message as { content?: unknown } | null)?.content)
    if (images.length === 0) return state
    const head = state.callsByName.get(callId)
    const seq = typeof match.event.seq === 'number' ? match.event.seq : 0
    traceStep('update', `settled call="${state.callsByName.get(callId)?.name ?? '?'}" images=${images.length} turn=${state.turn}`)
    return {
      ...state,
      calls: [...state.calls, { callId, seq, prompt: promptOf(head?.argsRaw), images }],
    }
  },
}

/**
 * The pictures one Turn produced, bounded by a sequence.
 *
 * The bound is the Turn's own end (not the closing Assistant text): a Turn
 * whose last text precedes a settlement still owns that settlement, and the
 * Turn-tail seat only exists for a completed Turn.
 * @param data - the folded Turn state.
 * @param seq - the bound sequence (settlements after it are excluded).
 * @returns the settled calls that produced pictures, in settlement order.
 */
export function generatedCallsForClosing(data: GeneratedTurnData | undefined, seq: number): GeneratedTurnCall[] {
  if (data === undefined) return []
  return data.calls.filter(call => call.seq <= seq)
}
