/**
 * Regression test for the session-event accessor and the generated-images
 * manifest route's authorization path.
 *
 * Bug it pins (part 1): DSH 2.0.10's session service keeps the event log
 * private (`snapshotEvents()` / `ownEvents()`, no `session.events` array). The
 * old byte bridge read `session.events`, which is `undefined` there, so every
 * image request threw `TypeError: events is not iterable` and the inline card
 * showed a broken image. The accessor must serve BOTH shapes: the current
 * snapshot API and the legacy `events` array.
 *
 * Bug it pins (part 2): generated pictures now travel as the platform's own
 * `image` blocks in the tool result (a plugin-private block type fails every
 * strict adapter with UNSUPPORTED_CONTENT), so the manifest route is authorized
 * by scanning those blocks — and by the retained run of the exact call, which
 * is what lets 修改 re-stage the bytes the model itself was handed.
 */

import { sessionEvents } from './lib/session-events.js'
import { generatedImagesByTurn, imageRecordsInSession, makeGeneratedImageRoutes, referencedImageRef } from './lib/routes.js'

let failures = 0
const check = (label, ok) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}`) }
}

const ATTACHMENT = {
  attachmentId: 'sha256:aa11',
  mediaType: 'image/png',
  bytes: 3,
  width: 1,
  height: 1,
}

/** One durable tool result carrying the platform `image` blocks the tool renders. */
const EVENT = {
  type: 'tool/result',
  seq: 26,
  data: {
    callId: 'call_1',
    turn: 3,
    message: {
      role: 'tool',
      toolCallId: 'call_1',
      content: [
        { type: 'text', text: '已生成 1 张图片' },
        { type: 'image', attachment: ATTACHMENT },
      ],
    },
    meta: {
      prompt: 'p',
      model: 'gpt-image-2',
      size: '1024x1024',
      images: [{ ...ATTACHMENT, path: 'C:\\work\\generated-1.png' }],
    },
  },
}

/** One legacy tool result, from a session written before the block-type fix. */
const LEGACY_EVENT = {
  type: 'tool/result',
  seq: 26,
  data: {
    message: {
      content: [{
        type: 'tool-result',
        toolCallId: 'call_legacy',
        content: [
          { type: 'text', text: '已生成 1 张图片' },
          { type: 'generated-image', attachment: ATTACHMENT, prompt: 'p' },
        ],
      }],
    },
  },
}

console.log('sessionEvents():')
check('legacy shape (plain events array) is returned as-is',
  sessionEvents({ events: [EVENT] }).length === 1)
check('current shape (snapshotEvents) is returned',
  sessionEvents({ snapshotEvents: () => [EVENT] }).length === 1)
check('snapshotEvents wins over a stale events array',
  sessionEvents({ snapshotEvents: () => [EVENT], events: [] }).length === 1)
check('ownEvents is the last-resort fallback',
  sessionEvents({ ownEvents: () => [EVENT] }).length === 1)
check('non-array results degrade to an empty list',
  sessionEvents({ snapshotEvents: () => 'nope' }).length === 0)
check('an unknown session shape degrades to an empty list',
  sessionEvents({}).length === 0)
check('undefined/missing session degrades to an empty list',
  sessionEvents(undefined).length === 0 && sessionEvents(null).length === 0)

console.log('\nreferencedImageRef():')
check('finds a native image block in a tool result',
  referencedImageRef([EVENT], 'sha256:aa11')?.mediaType === 'image/png')
check('still finds a legacy nested generated-image block',
  referencedImageRef([LEGACY_EVENT], 'sha256:aa11')?.mediaType === 'image/png')
check('unknown id yields undefined',
  referencedImageRef([EVENT], 'sha256:ffff') === undefined)

console.log('\nimageRecordsInSession():')
{
  const records = imageRecordsInSession([EVENT], 'call_1')
  check('returns the call\'s own image attachment', records.length === 1 && records[0].attachmentId === 'sha256:aa11')
  check('carries the durable dimensions', records[0].width === 1 && records[0].height === 1)
  check('a different call id yields nothing', imageRecordsInSession([EVENT], 'call_other').length === 0)
  check('a result with no image blocks yields nothing',
    imageRecordsInSession([{ type: 'tool/result', data: { callId: 'call_2', message: { content: [{ type: 'text', text: 'x' }] } } }], 'call_2').length === 0)
}

/** Minimal ServerResponse stand-in capturing the written status and body. */
function fakeResponse() {
  const captured = { status: 0, headers: undefined, body: undefined }
  return {
    captured,
    writeHead(status, headers) { captured.status = status; captured.headers = headers },
    end(body) { captured.body = body },
  }
}

/** Minimal IncomingMessage stand-in that passes the loopback fence. */
function fakeRequest(url) {
  return {
    method: 'GET',
    url,
    socket: { remoteAddress: '127.0.0.1' },
    headers: { host: '127.0.0.1:43120' },
  }
}

/** Drive the real manifest route against one fake session shape. */
async function getThroughBridge(session, query = 'session=session-1&call=call_1') {
  const route = makeGeneratedImageRoutes({
    path: '/api/dsh-tool-imagegen/images',
    manifest: (sessionId, callId) => {
      const found = sessionId === 'session-1' ? session : undefined
      if (found === undefined) return undefined
      return imageRecordsInSession(sessionEvents(found), callId)
    },
  })
  const res = fakeResponse()
  await route.handler(fakeRequest(`/api/dsh-tool-imagegen/images?${query}`), res)
  return res.captured
}

console.log('\nmanifest route (current session API — the reported regression):')
{
  const captured = await getThroughBridge({ snapshotEvents: () => [EVENT] })
  check('answers 200 for a referenced call', captured.status === 200)
  const body = JSON.parse(String(captured.body))
  check('reports the call\'s images', body.ok === true && body.images.length === 1)
  check('reports the durable attachment id', body.images[0].attachmentId === 'sha256:aa11')
}
console.log('\nmanifest route (legacy session API):')
{
  const captured = await getThroughBridge({ events: [EVENT] })
  check('still answers 200 for the legacy events array', captured.status === 200)
}
console.log('\nmanifest route (errors):')
{
  const unknownSession = await getThroughBridge({ snapshotEvents: () => [EVENT] }, 'session=nope&call=call_1')
  check('an unknown session answers 404', unknownSession.status === 404)
  const unreferenced = await getThroughBridge({ snapshotEvents: () => [EVENT] }, 'session=session-1&call=call_none')
  check('a call the session does not reference answers 200 with no images',
    unreferenced.status === 200 && JSON.parse(String(unreferenced.body)).images.length === 0)
  const missing = await getThroughBridge({ snapshotEvents: () => [EVENT] }, 'session=session-1')
  check('a missing call id is a bad request', missing.status === 400)
}

console.log('\nmanifest route (a retained run wins, so 修改 stages the exact bytes):')
{
  const route = makeGeneratedImageRoutes({
    path: '/api/dsh-tool-imagegen/images',
    manifest: (sessionId, callId) => (sessionId === 'session-1' && callId === 'call_1'
      ? [{ ...ATTACHMENT, path: 'C:\\work\\g.png', data: 'AAAA' }]
      : undefined),
  })
  const res = fakeResponse()
  await route.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=session-1&call=call_1'), res)
  const body = JSON.parse(String(res.captured.body))
  check('serves the retained work-dir handle and bytes',
    body.images[0].path === 'C:\\work\\g.png' && body.images[0].data === 'AAAA')
}

console.log('\nper-Turn projection (generatedImagesByTurn — the Turn-tail fallback):')
{
  const events = [
    { type: 'turn/start', seq: 10, data: { turn: 3 } },
    { type: 'tool/call', seq: 11, data: { turn: 3, callId: 'call_1', name: 'generate_image', arguments: '{"prompt":"一只猫"}' } },
    EVENT,
    { type: 'turn/start', seq: 40, data: { turn: 4 } },
    { type: 'tool/call', seq: 41, data: { turn: 4, callId: 'call_2', name: 'generate_image', arguments: '{"prompt":"一只狗"}' } },
    { type: 'tool/result', seq: 42, data: { turn: 4, message: { toolCallId: 'call_2', content: [{ type: 'image', attachment: { ...ATTACHMENT, attachmentId: 'sha256:bb22' } }] } } },
    // A failed call contributes nothing.
    { type: 'tool/result', seq: 43, data: { turn: 4, message: { toolCallId: 'call_3', isError: true, content: [{ type: 'image', attachment: ATTACHMENT }] } } },
    // A result with no picture blocks contributes nothing.
    { type: 'tool/result', seq: 44, data: { turn: 4, message: { toolCallId: 'call_4', content: [{ type: 'text', text: 'plain' }] } } },
  ]
  const turns = generatedImagesByTurn(events)
  check('groups by Turn in Turn order', turns.length === 2 && turns[0].turn === 3 && turns[1].turn === 4)
  check('reads the first Turn\'s picture', turns[0].calls.length === 1 && turns[0].calls[0].images[0].attachmentId === 'sha256:aa11')
  check('reads the call id and settlement sequence', turns[0].calls[0].callId === 'call_1' && turns[0].calls[0].seq === 26)
  check('reads the prompt off the call arguments', turns[0].calls[0].prompt === '一只猫')
  check('indexes each picture within its call', turns[1].calls[0].images[0].index === 0)
  check('skips the failed call', turns[1].calls.length === 1 && turns[1].calls[0].callId === 'call_2')
  check('a session with no picture projects no Turns',
    generatedImagesByTurn([{ type: 'turn/start', seq: 1, data: { turn: 1 } }]).length === 0)
}

console.log('\nsession-wide mode on the route:')
{
  const route = makeGeneratedImageRoutes({
    path: '/api/dsh-tool-imagegen/images',
    manifest: () => undefined,
    turns: (sessionId) => (sessionId === 'session-1' ? generatedImagesByTurn([EVENT]) : undefined),
  })
  const res = fakeResponse()
  await route.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=session-1'), res)
  const body = JSON.parse(String(res.captured.body))
  check('answers 200 for a whole-session request', res.captured.status === 200)
  check('reports the Turn projection', body.ok === true && Array.isArray(body.turns))
  const unknown = fakeResponse()
  await route.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=nope'), unknown)
  check('an unknown session answers 404', unknown.captured.status === 404)
  const noSession = fakeResponse()
  await route.handler(fakeRequest('/api/dsh-tool-imagegen/images'), noSession)
  check('a missing session is still a bad request', noSession.captured.status === 400)
}

console.log('\nmanifest route (raw byte mode — the Turn-tail card\'s image source):')
{
  // Bytes come from the retained run when it is still in memory…
  const retained = makeGeneratedImageRoutes({
    path: '/api/dsh-tool-imagegen/images',
    manifest: () => [{ ...ATTACHMENT, mediaType: 'image/png', data: Buffer.from([7, 8, 9]).toString('base64') }],
    readImage: async () => { throw new Error('must not be called when the run is retained') },
  })
  const res = fakeResponse()
  await retained.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=session-1&call=call_1&index=0'), res)
  check('serves the retained bytes as 200', res.captured.status === 200)
  check('serves the stored media type', res.captured.headers?.['content-type'] === 'image/png')
  check('serves exactly the retained bytes', Buffer.from(res.captured.body).equals(Buffer.from([7, 8, 9])))
  check('declares the byte length', res.captured.headers?.['content-length'] === 3)
  check('forbids caching (the run can be evicted)', res.captured.headers?.['cache-control'] === 'no-store')

  // …otherwise from the attachment store, through the reference the session's
  // own tool result carries (a session replayed after a restart).
  let readRef
  const replayed = makeGeneratedImageRoutes({
    path: '/api/dsh-tool-imagegen/images',
    manifest: () => [{ ...ATTACHMENT }],
    readImage: async (ref) => { readRef = ref; return { ref, data: Buffer.from([1, 2, 3, 4]) } },
  })
  const res2 = fakeResponse()
  await replayed.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=session-1&call=call_1&index=0'), res2)
  check('falls back to the attachment store for a replayed session', res2.captured.status === 200)
  check('passes the durable reference (id + geometry) to the store',
    readRef?.attachmentId === 'sha256:aa11' && readRef?.width === 1 && readRef?.height === 1)

  // Out-of-range and unusable records answer 404 rather than an empty body.
  const outOfRange = await (async () => {
    const route = makeGeneratedImageRoutes({
      path: '/api/dsh-tool-imagegen/images',
      manifest: () => [{ ...ATTACHMENT, data: 'AAAA' }],
      readImage: async () => undefined,
    })
    const res3 = fakeResponse()
    await route.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=session-1&call=call_1&index=5'), res3)
    return res3.captured
  })()
  check('an out-of-range index answers 404', outOfRange.status === 404)
  const noBytes = await (async () => {
    const route = makeGeneratedImageRoutes({
      path: '/api/dsh-tool-imagegen/images',
      manifest: () => [{ ...ATTACHMENT }],
      readImage: async () => undefined,
    })
    const res4 = fakeResponse()
    await route.handler(fakeRequest('/api/dsh-tool-imagegen/images?session=session-1&call=call_1&index=0'), res4)
    return res4.captured
  })()
  check('an unreadable attachment answers 404', noBytes.status === 404)
}

console.log('\nmanifest route (loopback fence):')
{
  const route = makeGeneratedImageRoutes({
    path: '/api/dsh-tool-imagegen/images',
    manifest: () => [],
  })
  const res = fakeResponse()
  await route.handler({
    method: 'GET',
    url: '/api/dsh-tool-imagegen/images?session=session-1&call=call_1',
    socket: { remoteAddress: '10.0.0.5' },
    headers: { host: '127.0.0.1:43120' },
  }, res)
  check('a non-loopback peer is refused', res.captured.status === 403)
}

console.log('')
if (failures > 0) {
  console.error(`SESSION-EVENTS FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('SESSION-EVENTS PASSED')
