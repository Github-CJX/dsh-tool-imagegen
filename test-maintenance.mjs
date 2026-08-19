/**
 * Unit test for lib/maintenance.js — reference collection (live + persisted)
 * and orphan pruning, against temporary directories so nothing real is ever
 * touched. The persisted-corpus path uses a real zstd-compressed JSONL log
 * (node:zlib built-in), mirroring the platform's session layout.
 */

import { mkdtemp, mkdir, readdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { zstdCompressSync } from 'node:zlib'
import { cleanupOrphans, collectFromValue, collectPersistedReferences, emptyReferences, storageStats } from './lib/maintenance.js'

let failures = 0
const check = (label, ok) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}`) }
}

// --- collectFromValue -------------------------------------------------------

{
  const refs = emptyReferences()
  collectFromValue({
    data: {
      message: {
        content: [
          { type: 'text', text: 'hello' },
          { type: 'uploaded-image', path: 'C:\\u\\uploads\\a.png', attachment: { attachmentId: 'aaa' } },
          { type: 'generated-image', attachment: { attachmentId: 'bbb' } },
          { type: 'image', attachment: { attachmentId: 'ccc' } },
          { type: 'tool-result', content: [{ type: 'uploaded-image', path: 'C:\\u\\uploads\\b.png', attachment: { attachmentId: 'ddd' } }] },
        ],
      },
    },
  }, refs)
  check('collectFromValue picks uploaded-image paths (incl. nested tool-result)', refs.paths.size === 2 && refs.paths.has('C:\\u\\uploads\\a.png'))
  check('collectFromValue picks all attachment ids', refs.ids.size === 4 && refs.ids.has('aaa') && refs.ids.has('ccc'))
}

// --- temp corpus layout -----------------------------------------------------

const root = await mkdtemp(join(tmpdir(), 'imagegen-maint-'))
const uploadDir = join(root, 'uploads')
const attachmentsDir = join(root, 'attachments', 'v1')
const sessionsDir = join(root, 'sessions')
await mkdir(uploadDir, { recursive: true })
await mkdir(join(attachmentsDir, 'objects', '11'), { recursive: true })
await mkdir(join(attachmentsDir, 'objects', '22'), { recursive: true })

// Two upload files: one referenced by a persisted session, one orphan.
await writeFile(join(uploadDir, 'keep-me.png'), Buffer.alloc(10, 1))
await writeFile(join(uploadDir, 'orphan.png'), Buffer.alloc(20, 2))
// Attachment objects: one referenced, one orphan (content-addressed names).
await writeFile(join(attachmentsDir, 'objects', '11', '1111'), Buffer.alloc(30, 3))
await writeFile(join(attachmentsDir, 'objects', '22', '2222'), Buffer.alloc(40, 4))

// Persisted session log (zstd), referencing keep-me.png + 1111.
const project = join(sessionsDir, '--test-project--')
const sessionDir = join(project, 'session-1234')
await mkdir(sessionDir, { recursive: true })
const records = [
  { data: { message: { content: [
    { type: 'uploaded-image', path: join(uploadDir, 'keep-me.png'), attachment: { attachmentId: '1111' } },
    { type: 'generated-image', attachment: { attachmentId: '1111' } }, // shared object
  ] } } },
]
await writeFile(join(sessionDir, 'session.jsonl.zstd'), zstdCompressSync(records.map((r) => JSON.stringify(r)).join('\n')))
// A corrupt log must be skipped, not fatal.
const corruptDir = join(project, 'session-corrupt')
await mkdir(corruptDir, { recursive: true })
await writeFile(join(corruptDir, 'session.jsonl.zstd'), 'not zstd at all')

// Live session referencing a THIRD upload not in any persisted log.
const stubSessions = {
  list() {
    return [{
      events: [{
        data: { message: { content: [
          { type: 'uploaded-image', path: join(uploadDir, 'live.png'), attachment: { attachmentId: '3333' } },
        ] } },
      }],
    }]
  },
}
await writeFile(join(uploadDir, 'live.png'), Buffer.alloc(50, 5))
await mkdir(join(attachmentsDir, 'objects', '33'), { recursive: true })
await writeFile(join(attachmentsDir, 'objects', '33', '3333'), Buffer.alloc(60, 6))

// --- collectPersistedReferences --------------------------------------------

{
  const refs = emptyReferences()
  await collectPersistedReferences(sessionsDir, refs)
  check('persisted log refs collected (zstd decoded)', refs.paths.has(join(uploadDir, 'keep-me.png')) && refs.ids.has('1111'))
  check('corrupt log skipped without throwing', refs.ids.has('1111'))
}

// --- stats ------------------------------------------------------------------

{
  const stats = await storageStats({ uploadsRoot: uploadDir, attachmentsRoot: attachmentsDir })
  check('stats count uploads + objects', stats.uploads.count === 3 && stats.attachments.count === 3)
  check('stats sum bytes', stats.uploads.bytes === 80 && stats.attachments.bytes === 130)
}

// --- cleanupOrphans ---------------------------------------------------------

{
  const result = await cleanupOrphans(stubSessions, {
    sessionsRoot: sessionsDir,
    uploadsRoot: uploadDir,
    attachmentsRoot: attachmentsDir,
  })
  check('cleanup removed only the orphan upload', result.uploads.removed === 1 && result.uploads.bytesFreed === 20)
  check('cleanup removed only the orphan object', result.attachments.removed === 1 && result.attachments.bytesFreed === 40)
  const uploads = await readdir(uploadDir)
  check('referenced + live uploads survive', uploads.includes('keep-me.png') && uploads.includes('live.png') && !uploads.includes('orphan.png'))
  const objects = (await readdir(join(attachmentsDir, 'objects', '11'))).concat(
    await readdir(join(attachmentsDir, 'objects', '22')),
    await readdir(join(attachmentsDir, 'objects', '33')),
  )
  check('referenced + live objects survive', objects.includes('1111') && objects.includes('3333') && !objects.includes('2222'))
}

await rm(root, { recursive: true, force: true })

console.log('')
if (failures > 0) {
  console.error(`MAINTENANCE FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('MAINTENANCE PASSED')
