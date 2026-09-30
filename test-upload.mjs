/**
 * Regression test for the upload bridge's enqueued user message.
 *
 * Bug it pins: the bridge used to enqueue the reference image as a
 * plugin-private `uploaded-image` block. Message adapters do NOT skip unknown
 * block types — the strict DeepSeek Messages route refused the whole request
 * with
 *
 *   UNSUPPORTED_CONTENT: cannot represent user/tool-result content uploaded-image
 *
 * and because the user message is durable, every later Turn whose model-visible
 * history still contained it failed the same way. The message must therefore
 * carry the platform's OWN `image` block, which every adapter can represent (and
 * which the platform's text-only projection replaces with a placeholder, while
 * the envelope text beside it still carries the work-dir edit handle).
 */

import { makeUploadRoutes } from './lib/routes.js'

let failures = 0
const check = (label, ok) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}`) }
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

/** Minimal IncomingMessage carrying a JSON body, passing the loopback fence. */
function fakeRequest(payload) {
  const chunks = [Buffer.from(JSON.stringify(payload), 'utf8')]
  return {
    method: 'POST',
    url: '/api/dsh-tool-imagegen/upload',
    socket: { remoteAddress: '127.0.0.1' },
    headers: { host: '127.0.0.1:43120', 'content-type': 'application/json' },
    async *[Symbol.asyncIterator]() { for (const chunk of chunks) yield chunk },
  }
}

const PNG = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3, 4])

/** The host-side collaborators the upload route needs. */
function makeDeps() {
  const delivered = []
  return {
    delivered,
    deps: {
      uploadPath: '/api/dsh-tool-imagegen/upload',
      capabilityPath: '/api/dsh-tool-imagegen/capability',
      sessions: { get: (id) => (id === 'session-1' ? { id } : undefined) },
      agents: { get: (id) => (id === 'session-1' ? { followup: (message) => delivered.push(message) } : undefined) },
      attachments: {
        imageLimits: { mediaTypes: ['image/png', 'image/jpeg', 'image/webp', 'image/gif'], maxImageBytes: 5 * 1024 * 1024 },
        async saveImage({ data, mediaType, name }) {
          return { attachmentId: 'sha256:aa11', mediaType, bytes: data.byteLength, width: 2, height: 2, name }
        },
      },
      llm: {},
    },
  }
}

console.log('upload bridge (the enqueued reference-image message):')
{
  const { deps, delivered } = makeDeps()
  const route = makeUploadRoutes(deps).find((entry) => entry.path === deps.uploadPath)
  const res = fakeResponse()
  await route.handler(fakeRequest({
    sessionId: 'session-1',
    mediaType: 'image/png',
    data: PNG.toString('base64'),
    name: 'reference.png',
    text: '给它上色',
  }), res)

  check('accepts the upload', JSON.parse(String(res.captured.body)).ok === true)
  check('delivers exactly one user message', delivered.length === 1)

  const content = delivered[0]?.content ?? []
  const types = content.map((block) => block.type)
  // The whole point: no plugin-private block may appear in a durable message.
  check('emits the platform\'s own image block', types.includes('image'))
  check('never emits the retired private block', types.includes('uploaded-image') === false, `types=${types.join(',')}`)
  check('block types are representable by every adapter',
    types.every((type) => type === 'image' || type === 'text'), `types=${types.join(',')}`)

  const image = content.find((block) => block.type === 'image')
  check('the image block carries the durable attachment reference',
    image?.attachment?.attachmentId === 'sha256:aa11' && image.attachment.mediaType === 'image/png')
  check('the image block carries no plugin-private fields',
    image !== undefined && image.path === undefined && image.filename === undefined)

  const envelope = content.find((block) => block.type === 'text')?.text ?? ''
  // The work-dir file name is host-generated (saveUpload), not the client's
  // `name`, so assert on the handle the model is told to echo back.
  check('the envelope still carries the work-dir edit handle',
    envelope.includes('本机路径') && envelope.includes('把 image 参数设为'))
  check('the envelope carries the user\'s own request', envelope.includes('给它上色'))
  check('the message is a user-role message', delivered[0]?.role === 'user')
}

console.log('\nupload bridge (rejections):')
{
  const { deps, delivered } = makeDeps()
  const route = makeUploadRoutes(deps).find((entry) => entry.path === deps.uploadPath)
  const res = fakeResponse()
  await route.handler(fakeRequest({ sessionId: 'session-1', mediaType: 'image/bmp', data: 'AAAA' }), res)
  const body = JSON.parse(String(res.captured.body))
  check('an unsupported media type is rejected', body.ok === false && body.code === 'upload-rejected')
  check('a rejected upload delivers nothing', delivered.length === 0)
}

console.log('')
if (failures > 0) {
  console.error(`UPLOAD FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('UPLOAD PASSED')
