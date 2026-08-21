/**
 * Unit test for lib/engine.js — upstream request shaping + transient-failure
 * retry. Text-to-image must POST JSON to /images/generations; image-to-image
 * must POST multipart form-data (image file + prompt) to /images/edits,
 * WITHOUT a hand-set content-type (the boundary must be generated), since
 * OpenAI-compatible gateways reject `input_image` on generations and choke on
 * a missing/typed boundary in edits. Transient failures (network error /
 * timeout / 5xx) are retried automatically up to maxRetries (3) with
 * exponential backoff; 4xx and contract errors never retry. The upstream fetch
 * is stubbed globally (the engine only touches the network inside fetch) and
 * restored afterwards.
 */

import { generateImage, resolveOptionalParams } from './lib/engine.js'

let failures = 0
const check = (label, ok) => {
  if (ok) console.log(`  ok  ${label}`)
  else { failures += 1; console.log(`FAIL  ${label}`) }
}

const upstream = { apiUrl: 'https://relay.example/v1/', apiKey: 'sk-test' }

/** A 200 JSON response carrying one b64 image. */
function okResponse() {
  return {
    ok: true,
    status: 200,
    headers: new Headers({ 'content-type': 'application/json' }),
    async json() { return { data: [{ b64_json: Buffer.from('png-bytes').toString('base64') }] } },
  }
}

let lastRequest = null
const fakeFetch = async (url, init) => {
  lastRequest = { url, headers: init.headers, body: init.body }
  return okResponse()
}
const realFetch = globalThis.fetch
globalThis.fetch = fakeFetch

try {
  // --- text-to-image: JSON /images/generations ------------------------------

  await generateImage(upstream, { model: 'gpt-image-2', prompt: '一只猫', size: '1024x1024', n: 1 })
  check('text-only request hits /images/generations', lastRequest.url === 'https://relay.example/v1/images/generations')
  check('text-only request sets JSON content-type', lastRequest.headers['content-type'] === 'application/json')
  const jsonBody = JSON.parse(lastRequest.body)
  check('text-only body carries prompt/model/size', jsonBody.prompt === '一只猫' && jsonBody.model === 'gpt-image-2' && jsonBody.size === '1024x1024')
  check('text-only body carries NO input_image', jsonBody.input_image === undefined)

  // --- optional upstream parameters are forwarded ------------------------------

  await generateImage(upstream, {
    model: 'gpt-image-2', prompt: '一只猫', size: '', n: 1,
    quality: 'high', output_format: 'webp', background: 'auto', style: 'vivid', moderation: 'high', watermark: 'none',
  })
  const paramsBody = JSON.parse(lastRequest.body)
  check('text-only body forwards all 6 optional params',
    paramsBody.quality === 'high' && paramsBody.output_format === 'webp' && paramsBody.background === 'auto'
    && paramsBody.style === 'vivid' && paramsBody.moderation === 'high' && paramsBody.watermark === 'none')
  check('background literal "auto" is NOT dropped (it is a legal enum for this param)',
    paramsBody.background === 'auto')

  await generateImage(upstream, { model: 'gpt-image-2', prompt: '一只猫', size: '', n: 1 })
  const emptyBody = JSON.parse(lastRequest.body)
  check('optional params omitted when empty (empty string -> upstream default)',
    emptyBody.quality === undefined && emptyBody.output_format === undefined && emptyBody.background === undefined
    && emptyBody.style === undefined && emptyBody.moderation === undefined && emptyBody.watermark === undefined)

  // --- image-to-image: multipart /images/edits --------------------------------

  await generateImage(upstream, {
    model: 'gpt-image-2',
    prompt: '把猫改成蓝色',
    size: '',
    n: 1,
    quality: 'high', output_format: 'webp', background: 'auto', style: 'vivid', moderation: 'high', watermark: 'none',
    image: { b64: Buffer.from('reference-png').toString('base64'), mime: 'image/png' },
  })
  check('image request hits /images/edits', lastRequest.url === 'https://relay.example/v1/images/edits')
  check('image request does NOT set content-type (FormData boundary)', lastRequest.headers['content-type'] === undefined)
  check('image request body is a FormData', lastRequest.body instanceof FormData)
  const form = lastRequest.body
  check('form carries model + prompt', form.get('model') === 'gpt-image-2' && form.get('prompt') === '把猫改成蓝色')
  const imageEntry = form.get('image')
  check('form carries the image as a named file', imageEntry !== null && typeof imageEntry === 'object' && 'name' in imageEntry)

  // the multipart body built above forwards the 6 optional params
  check('multipart forwards optional params',
    form.get('quality') === 'high' && form.get('output_format') === 'webp' && form.get('background') === 'auto'
    && form.get('style') === 'vivid' && form.get('moderation') === 'high' && form.get('watermark') === 'none')

  await generateImage(upstream, {
    model: 'gpt-image-2', prompt: '把猫改成蓝色', size: '', n: 1,
    image: { b64: Buffer.from('reference-png').toString('base64'), mime: 'image/png' },
  })
  const formEmpty = lastRequest.body
  check('multipart omits optional params when empty', formEmpty.get('style') === null && formEmpty.get('quality') === null)

  // --- switch-gated optional parameters (output_format/style/watermark) -------
  // The reference gateway rejects these three, so while their enable switch is
  // off the resolved value is forced '' — never forwarded, even if the model
  // passes one (stale schema) or a setting is stored. enable switches ON restores
  // the model-first merge.

  {
    const cfg = {
      quality: 'medium', output_format: 'webp', background: 'auto', style: 'natural', moderation: 'high', watermark: 'none',
      output_format_enabled: false, style_enabled: false, watermark_enabled: false,
    }
    const p = resolveOptionalParams(cfg, {})
    check('disabled switches force the gated params empty (settings stored but off)',
      p.quality === 'medium' && p.background === 'auto' && p.moderation === 'high'
      && p.output_format === '' && p.style === '' && p.watermark === '')
    const p2 = resolveOptionalParams(cfg, { output_format: 'jpeg', style: 'vivid', watermark: 'triw' })
    check('disabled switches drop gated params even when the model passes them',
      p2.output_format === '' && p2.style === '' && p2.watermark === '')
  }

  {
    const cfg = {
      quality: 'medium', output_format: 'webp', background: 'auto', style: 'natural', moderation: 'high', watermark: 'none',
      output_format_enabled: true, style_enabled: true, watermark_enabled: true,
    }
    const p = resolveOptionalParams(cfg, { output_format: 'jpeg', style: 'vivid', watermark: 'triw' })
    check('enabled switches: model arg wins over the setting',
      p.output_format === 'jpeg' && p.style === 'vivid' && p.watermark === 'triw')
    const p2 = resolveOptionalParams(cfg, {})
    check('enabled switches: empty model arg falls back to the setting',
      p2.output_format === 'webp' && p2.style === 'natural' && p2.watermark === 'none')
    const p3 = resolveOptionalParams(cfg, { output_format: '  ' })
    check('enabled switches: whitespace model arg counts as empty (setting used)',
      p3.output_format === 'webp')
  }

  {
    const cfg = {
      quality: '', output_format: '', background: '', style: '', moderation: '', watermark: '',
      output_format_enabled: true, style_enabled: true, watermark_enabled: true,
    }
    const p = resolveOptionalParams(cfg, {})
    check('everything empty stays empty (empty string -> upstream default)',
      p.quality === '' && p.output_format === '' && p.background === '' && p.style === '' && p.moderation === '' && p.watermark === '')
  }

  // -- jpeg/webp/gif extension mapping ----------------------------------------
  for (const [mime, ext] of [['image/jpeg', 'jpg'], ['image/webp', 'webp'], ['image/gif', 'gif'], ['image/png', 'png']]) {
    await generateImage(upstream, {
      model: 'gpt-image-2', prompt: 'x', size: '', n: 1,
      image: { b64: Buffer.from('x').toString('base64'), mime },
    })
    const name = String(lastRequest.body.get('image')?.name ?? '')
    check(`image extension maps ${mime} -> ${ext}`, name === `reference.${ext}`)
  }

  // --- response normalization is shared ---------------------------------------

  const result = await generateImage(upstream, { model: 'gpt-image-2', prompt: 'x', size: '', n: 1 })
  check('generation returns normalized b64 payload', result.images.length === 1 && result.images[0].b64 === Buffer.from('png-bytes').toString('base64'))

  // --- auth header is always the bearer ----------------------------------------

  check('auth header carried on both paths', lastRequest.headers.authorization === 'Bearer sk-test')

  // --- transient-failure retry (max 3 retries, exponential backoff) ------------

  // Network errors: two failures, then success → the third call succeeds.
  {
    let calls = 0
    globalThis.fetch = async () => {
      calls += 1
      if (calls < 3) throw new TypeError('fetch failed')
      return okResponse()
    }
    const result = await generateImage(upstream, { model: 'gpt-image-2', prompt: 'x', size: '', n: 1, retryDelayMs: 0 })
    check('network error is retried and recovers', calls === 3 && result.images.length === 1)
  }

  // Gateway 5xx: retried the same way (but only >= 500).
  {
    let calls = 0
    globalThis.fetch = async () => {
      calls += 1
      if (calls < 3) {
        return {
          ok: false,
          status: 502,
          headers: new Headers({ 'content-type': 'text/html' }),
          async json() { throw new Error('not json') },
        }
      }
      return okResponse()
    }
    await generateImage(upstream, { model: 'gpt-image-2', prompt: 'x', size: '', n: 1, retryDelayMs: 0 })
    check('5xx (even with HTML body) is retried and recovers', calls === 3)
  }

  // Exhausted budget: the last transient error surfaces with a retry note.
  {
    let calls = 0
    globalThis.fetch = async () => {
      calls += 1
      throw new TypeError('fetch failed')
    }
    const error = await generateImage(upstream, { model: 'gpt-image-2', prompt: 'x', size: '', n: 1, retryDelayMs: 0 })
      .then(() => undefined, (thrown) => thrown)
    check('exhausted retries throw after maxRetries attempts', calls === 4)
    check('exhausted error is upstream-unreachable with a retry note',
      error?.code === 'upstream-unreachable' && /已自动重试 3 次/.test(String(error?.message)))
  }

  // 4xx never retries (retrying cannot fix a bad request or auth problem).
  {
    let calls = 0
    globalThis.fetch = async () => {
      calls += 1
      return {
        ok: false,
        status: 400,
        headers: new Headers({ 'content-type': 'application/json' }),
        async json() { return { error: { message: 'Unknown model' } } },
      }
    }
    const error = await generateImage(upstream, { model: 'gpt-image-2', prompt: 'x', size: '', n: 1, retryDelayMs: 0 })
      .then(() => undefined, (thrown) => thrown)
    check('4xx is rejected without retry', calls === 1)
    check('4xx error is upstream-rejected with the upstream message',
      error?.code === 'upstream-rejected' && error?.message === 'Unknown model')
  }

  // Non-JSON 200 response (contract problem) never retries either.
  {
    let calls = 0
    globalThis.fetch = async () => {
      calls += 1
      return {
        ok: true,
        status: 200,
        headers: new Headers({ 'content-type': 'text/plain' }),
        async json() { throw new Error('not json') },
      }
    }
    const error = await generateImage(upstream, { model: 'gpt-image-2', prompt: 'x', size: '', n: 1, retryDelayMs: 0 })
      .then(() => undefined, (thrown) => thrown)
    check('non-JSON 200 is rejected without retry', calls === 1 && error?.code === 'upstream-invalid')
  }
} finally {
  globalThis.fetch = realFetch
}

console.log('')
if (failures > 0) {
  console.error(`ENGINE FAILED: ${failures} failure(s)`)
  process.exit(1)
}
console.log('ENGINE PASSED')
