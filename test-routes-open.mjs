/**
 * Unit test for the local-open bridge's temp-file naming — lib/routes.js
 * makeOpenRoute. Regression for the "Windows 找不到文件" bug: the platform's
 * attachment ids look like "sha256:<hex>", and the raw colon in a Windows
 * file name silently redirects the write into an NTFS alternate data stream
 * (the file the opener then looks for does not exist). The id must be
 * sanitized to a Windows-safe name; the spawn side (quote handling) is
 * exercised end-to-end by hand.
 */

import { tempFileName } from './lib/routes.js'

let failures = 0
const check = (label, ok) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}`) }
}

// sha256: prefix — the exact shape that broke before.
{
  const name = tempFileName('sha256:1ac037db20698c6f8b', 'image/png')
  check('sha256: id has its colon sanitized to underscore', name.includes(':') === false && name === 'dsh-imagegen-sha256_1ac037db20698c6f8b.png')
  check('temp name stays under Windows path limits', name.length <= 200)
}

// Other Windows-hostile characters never reach the file name.
check('hostile characters are replaced', tempFileName('a/b\\c:d*e?f"g<h>i|j', 'image/png') === 'dsh-imagegen-a_b_c_d_e_f_g_h_i_j.png')

// Extension mapping per media type.
check('jpeg maps to jpg', tempFileName('id', 'image/jpeg').endsWith('.jpg'))
check('webp maps to webp', tempFileName('id', 'image/webp').endsWith('.webp'))
check('gif maps to gif', tempFileName('id', 'image/gif').endsWith('.gif'))
check('unknown media type falls back to png', tempFileName('id', 'application/octet-stream').endsWith('.png'))

// No path separators can be smuggled in through the id — and the fixed
// "dsh-imagegen-" prefix means the name never starts with dot-components
// (no directory-traversal shape).
{
  const name = tempFileName('..\\..\\evil', 'image/png')
  check('no separators survive (name is a bare file name)', name === 'dsh-imagegen-.._.._evil.png')
  check('name never starts with a dot-component', name.startsWith('..') === false && name.startsWith('dsh-imagegen-'))
}

console.log('')
if (failures > 0) {
  console.error(`ROUTES-OPEN FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('ROUTES-OPEN PASSED')
