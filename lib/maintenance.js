/**
 * Storage maintenance for dsh-tool-imagegen: stats + cleanup of orphaned
 * files. Orphans accumulate in two places — the upload work dir (text-model
 * reference uploads) and the platform attachment object store (generated +
 * uploaded images) — and neither is reference-managed: deleting a session
 * leaves its images behind forever.
 *
 * Cleanup is reference-aware: every live session event AND the persisted
 * corpus (~/.dsh/sessions/<project>/<id>/session.jsonl.zstd, zstd-compressed
 * JSONL) is scanned for image references — `uploaded-image` block paths
 * (work-dir files) and every block's attachment id (attachment-store objects,
 * which are content-addressed: attachmentId === sha256 === object file name).
 * Anything not referenced by ANY session is safe to remove; shared objects
 * (the same sha256 referenced by several sessions) are never touched.
 *
 * The persisted corpus is read directly (not through a service) because
 * closed sessions are invisible to `sessions.list()` — skipping them would
 * orphan-prune files a deleted-from-UI-but-persisted conversation still
 * references. zstd is node:zlib built-in, no dependency.
 *
 * Framework-free (no cordis imports) so the routes can drive it directly.
 */

import { readdir, readFile, rm, stat } from 'node:fs/promises'
import { homedir } from 'node:os'
import { basename, join, resolve } from 'node:path'
import { zstdDecompressSync } from 'node:zlib'

/** The plugin's upload work dir root (see uploads.js). */
export function uploadsRoot() {
  return join(homedir(), '.dsh', 'data', 'dsh-tool-imagegen', 'uploads')
}

/** The platform attachment object store root (matches dsh-attachment-local). */
export function attachmentsRoot() {
  return join(homedir(), '.dsh', 'attachments', 'v1')
}

/** The platform session corpus root (~/.dsh/sessions/<project>/<id>/...). */
export function sessionsRoot() {
  return join(homedir(), '.dsh', 'sessions')
}

/** A referenced-file index: work-dir paths + attachment ids, both as Sets. */
export function emptyReferences() {
  return { paths: new Set(), ids: new Set() }
}

/**
 * Collect every image reference from one parsed JSON value, recursing into
 * arrays and nested objects. Paths come from `uploaded-image` blocks; ids come
 * from any block carrying an `attachment` (platform `image` blocks included,
 * so native uploads are never pruned).
 * @param value - one JSON value (any depth).
 * @param refs - the index to accumulate into.
 */
export function collectFromValue(value, refs) {
  if (Array.isArray(value)) {
    for (const item of value) collectFromValue(item, refs)
    return
  }
  if (value === null || typeof value !== 'object') return
  if (value.type === 'uploaded-image' && typeof value.path === 'string') {
    refs.paths.add(resolve(value.path))
  }
  const attachment = value.attachment
  if (attachment !== null && typeof attachment === 'object'
      && typeof attachment.attachmentId === 'string') {
    refs.ids.add(attachment.attachmentId)
  }
  for (const item of Object.values(value)) collectFromValue(item, refs)
}

/** Collect references from one decoded JSONL record (event). */
function collectFromRecord(record, refs) {
  if (record === null || typeof record !== 'object') return
  collectFromValue(record.data?.content, refs)
  collectFromValue(record.data?.message?.content, refs)
}

/**
 * Collect references from the persisted corpus: every session JSONL under the
 * sessions root, zstd-decompressed and parsed line by line. Coarse line
 * pre-filtering avoids parsing message text that cannot carry references.
 * @param root - the sessions root directory.
 * @returns the accumulated reference index.
 */
export async function collectPersistedReferences(root, refs) {
  const projects = await readdir(root).catch(() => [])
  for (const project of projects) {
    const projectDir = join(root, project)
    const sessionDirs = await readdir(projectDir).catch(() => [])
    for (const sessionDir of sessionDirs) {
      const dir = join(projectDir, sessionDir)
      const logPath = join(dir, 'session.jsonl.zstd')
      let buffer
      try {
        buffer = await readFile(logPath)
      } catch {
        continue // no persisted log (live-only or other layout)
      }
      let text
      try {
        text = zstdDecompressSync(buffer).toString('utf8')
      } catch {
        continue // corrupt or non-zstd log; skip rather than prune wrongly
      }
      for (const line of text.split('\n')) {
        if (line === '') continue
        // Fast path: only lines that can carry a reference get parsed.
        if (line.includes('attachment') === false
            && line.includes('uploaded-image') === false
            && line.includes('generated-image') === false) continue
        let record
        try {
          record = JSON.parse(line)
        } catch {
          continue
        }
        collectFromRecord(record, refs)
      }
    }
  }
  return refs
}

/**
 * Collect the full reference index: live sessions (in-memory events) plus the
 * persisted corpus (closed conversations). Live events carry the freshest
 * state (including messages still landing), persisted logs cover everything
 * else; both are required for safe pruning.
 * @param sessions - the sessions service (sessions.list()).
 * @param root - the persisted corpus root.
 * @returns {Promise<{paths: Set<string>, ids: Set<string>}>}
 */
export async function collectReferences(sessions, root) {
  const refs = emptyReferences()
  for (const session of sessions.list()) {
    for (const event of session.events ?? []) {
      collectFromRecord(event, refs)
    }
  }
  await collectPersistedReferences(root, refs)
  return refs
}

/** One directory's file inventory: count + total bytes of regular files. */
async function inventory(directory) {
  let count = 0
  let bytes = 0
  for (const name of await readdir(directory).catch(() => [])) {
    const path = join(directory, name)
    try {
      const info = await stat(path)
      if (info.isFile()) {
        count += 1
        bytes += info.size
      }
    } catch {
      // vanish race or unreadable entry: skip
    }
  }
  return { count, bytes }
}

/**
 * Directory stats without reference analysis: the plugin upload dir and the
 * attachment object store.
 * @param roots - optional override { uploadsRoot, attachmentsRoot } (tests).
 * @returns {Promise<{uploads: {count, bytes}, attachments: {count, bytes}>}
 */
export async function storageStats(roots) {
  const uploadDir = roots?.uploadsRoot ?? uploadsRoot()
  const uploads = await inventory(uploadDir)
  // Object store is two-level (objects/<prefix>/<sha256>); sum the buckets.
  const objectsRoot = join(roots?.attachmentsRoot ?? attachmentsRoot(), 'objects')
  let count = 0
  let bytes = 0
  for (const bucket of await readdir(objectsRoot).catch(() => [])) {
    if (bucket.length !== 2) continue // defense: only 2-char prefix buckets
    const part = await inventory(join(objectsRoot, bucket))
    count += part.count
    bytes += part.bytes
  }
  return { uploads, attachments: { count, bytes } }
}

/**
 * Remove unreferenced files: work-dir uploads not referenced by any session
 * path, and attachment objects whose sha256 (=== attachmentId) no session
 * references. Shared objects are never touched (the id set is global).
 * @param sessions - the sessions service.
 * @param roots - optional override { sessionsRoot, uploadsRoot,
 *   attachmentsRoot } (tests).
 * @returns {Promise<{uploads: {removed, bytesFreed}, attachments: {removed, bytesFreed}>}
 */
export async function cleanupOrphans(sessions, roots) {
  const sessionRoot = roots?.sessionsRoot ?? sessionsRoot()
  const uploadDir = roots?.uploadsRoot ?? uploadsRoot()
  const refs = await collectReferences(sessions, sessionRoot)
  const uploads = await pruneDirectory(uploadDir, (path) => refs.paths.has(resolve(path)))
  const objectsRoot = join(roots?.attachmentsRoot ?? attachmentsRoot(), 'objects')
  let removed = 0
  let bytesFreed = 0
  for (const bucket of await readdir(objectsRoot).catch(() => [])) {
    if (bucket.length !== 2) continue
    const part = await pruneDirectory(join(objectsRoot, bucket), (path) => refs.ids.has(basename(path)))
    removed += part.removed
    bytesFreed += part.bytesFreed
  }
  return {
    uploads,
    attachments: { removed, bytesFreed },
  }
}

/**
 * Delete every file in one directory whose predicate says it is unreferenced.
 * @param directory - the directory to prune (non-recursive).
 * @param referenced - predicate: true keeps the file.
 * @returns {Promise<{removed: number, bytesFreed: number}>}
 */
async function pruneDirectory(directory, referenced) {
  let removed = 0
  let bytesFreed = 0
  for (const name of await readdir(directory).catch(() => [])) {
    const path = join(directory, name)
    try {
      const info = await stat(path)
      if (!info.isFile() || referenced(path)) continue
      await rm(path, { force: true })
      removed += 1
      bytesFreed += info.size
    } catch {
      // vanish race or unreadable entry: skip
    }
  }
  return { removed, bytesFreed }
}
