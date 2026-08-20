/**
 * Work-directory manager for user-uploaded reference images.
 *
 * When a text-only model is active the platform's native composer upload is
 * hard-rejected (apiproxy returns MODEL_DOES_NOT_SUPPORT_IMAGES for prompts
 * whose content contains an `image` block), so this plugin's own upload bridge
 * lands the bytes here. The file must OUTLIVE the request: the model later
 * references it by path through the generate_image `image` parameter, so the
 * engine can feed it back to the upstream as `input_image`. A temp file would
 * not survive across turns.
 *
 * The work dir lives OUTSIDE the plugin git repo (under ~/.dsh/data) so a
 * reinstall / rebuild never wipes pending uploads and the repo stays clean.
 * Framework-free (no cordis imports) so the tool can drive it directly.
 */

import { randomBytes } from 'node:crypto'
import { mkdir, readFile, writeFile } from 'node:fs/promises'
import { homedir } from 'node:os'
import { join, resolve, sep } from 'node:path'

/** Root of the upload work dir (created on demand). */
export function uploadsRoot() {
  return join(homedir(), '.dsh', 'data', 'dsh-tool-imagegen', 'uploads')
}

/** Media type to file-extension hint (display only; decode is content-driven). */
function extensionOf(mediaType) {
  switch (mediaType) {
    case 'image/png': return 'png'
    case 'image/jpeg': return 'jpg'
    case 'image/webp': return 'webp'
    case 'image/gif': return 'gif'
    default: return 'bin'
  }
}

/**
 * Persist one uploaded image in the work dir.
 * @param {Buffer} data - the decoded image bytes.
 * @param {string} mediaType - one of the platform image media types.
 * @param {string} [prefix] - file-name prefix ('upload' by default; generated
 *   results use 'generated' so the two classes stay distinguishable).
 * @returns {Promise<{name: string, path: string}>} the file name (for the
 *   uploaded-image block) and absolute path (the generate_image handle).
 */
export async function saveUpload(data, mediaType, prefix = 'upload') {
  const root = uploadsRoot()
  await mkdir(root, { recursive: true })
  const stamp = Date.now().toString(36)
  const nonce = randomBytes(6).toString('hex')
  const name = `${prefix}-${stamp}-${nonce}.${extensionOf(mediaType)}`
  const path = join(root, name)
  await writeFile(path, data)
  return { name, path }
}

/**
 * Resolve a possibly user-supplied reference to an absolute path, guarding
 * against path traversal: the resolved path must stay under the work dir root.
 * A reference may be a bare file name (client-provided, relative to the root)
 * or an absolute path (tool-provided, still re-verified here).
 * @param {string} root - the work dir root (uploadsRoot()).
 * @param {string} reference - file name or path.
 * @returns {string} the absolute, containment-checked path.
 */
export function resolveUpload(root, reference) {
  if (typeof reference !== 'string' || reference === '') {
    throw new Error('无效的图片引用：引用为空')
  }
  const base = resolve(root)
  const target = resolve(base, reference)
  if (target !== base && !target.startsWith(base + sep)) {
    throw new Error('无效的图片引用：路径超出上传目录')
  }
  return target
}

/**
 * Read one uploaded image by reference (bare file name or absolute path).
 * @param {string} reference - file name or path within the work dir.
 * @returns {Promise<{data: Buffer, path: string}>} the bytes and resolved path.
 */
export async function readUpload(reference) {
  const root = uploadsRoot()
  const path = resolveUpload(root, reference)
  const data = await readFile(path)
  return { data, path }
}
