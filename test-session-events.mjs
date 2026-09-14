/**
 * Regression test for the session-event accessor and the attachment bridge's
 * authorization path.
 *
 * Bug it pins: DSH 2.0.10's session service keeps the event log private
 * (`snapshotEvents()` / `ownEvents()`, no `session.events` array). The bridge
 * read `session.events`, which is `undefined` there, so every image request
 * threw `TypeError: events is not iterable` and the inline card showed a
 * broken image instead of the picture. The route must serve bytes for BOTH
 * shapes: the current snapshot API and the legacy `events` array.
 */

import { sessionEvents } from './lib/session-events.js'
import { makeAttachmentRoute, referencedImageRef } from './lib/routes.js'

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

/** One durable tool result carrying the plugin's generated-image block. */
const EVENT = {
  type: 'tool/result',
  seq: 26,
  data: {
    message: {
      content: [{
        type: 'tool-result',
        toolCallId: 'call_1',
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
check('finds the ref inside a nested tool result',
  referencedImageRef([EVENT], 'sha256:aa11')?.mediaType === 'image/png')
check('unknown id yields undefined',
  referencedImageRef([EVENT], 'sha256:ffff') === undefined)

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

/** Drive the real route handler against one fake session shape. */
async function getThroughBridge(session) {
  const route = makeAttachmentRoute({
    path: '/api/dsh-tool-imagegen/attachment',
    sessions: {
      get(id) { return id === 'session-1' ? session : undefined },
    },
    attachments: {
      async readImage(ref) { return { ref, data: Buffer.from([1, 2, 3]) } },
    },
  })
  const res = fakeResponse()
  await route.handler(
    fakeRequest('/api/dsh-tool-imagegen/attachment?session=session-1&id=sha256%3Aaa11'),
    res,
  )
  return res.captured
}

console.log('\nattachment bridge (current session API — the reported regression):')
{
  const captured = await getThroughBridge({ snapshotEvents: () => [EVENT] })
  check('serves 200 for a generated-image reference', captured.status === 200)
  check('serves the image media type', captured.headers?.['content-type'] === 'image/png')
  check('serves the stored bytes', Buffer.from(captured.body).equals(Buffer.from([1, 2, 3])))
}
console.log('\nattachment bridge (legacy session API):')
{
  const captured = await getThroughBridge({ events: [EVENT] })
  check('still serves 200 for the legacy events array', captured.status === 200)
}
console.log('\nattachment bridge (unreferenced id):')
{
  const route = makeAttachmentRoute({
    path: '/api/dsh-tool-imagegen/attachment',
    sessions: { get: () => ({ snapshotEvents: () => [EVENT] }) },
    attachments: { async readImage() { throw new Error('must not be called') } },
  })
  const res = fakeResponse()
  await route.handler(
    fakeRequest('/api/dsh-tool-imagegen/attachment?session=session-1&id=sha256%3Affff'),
    res,
  )
  check('unreferenced id answers 404 without touching the store', res.captured.status === 404)
}

console.log('')
if (failures > 0) {
  console.error(`SESSION-EVENTS FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('SESSION-EVENTS PASSED')
