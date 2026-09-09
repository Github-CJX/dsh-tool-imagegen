/**
 * The dsh-tool-imagegen storage-maintenance section: shows how much space the
 * upload work dir and the attachment store occupy, and offers a one-click
 * orphan cleanup — files no session (live or persisted) references are
 * removed, and the freed space is reported.
 *
 * rc.7 keyed the `settings.plugin.item` slot by settings namespace (one entry
 * per key), so this is no longer a standalone card: it renders as a section
 * INSIDE the generator settings card (see SettingsCard.tsx), bound to the
 * same loopback maintenance bridge.
 */

import { memo, useCallback, useEffect, useState } from 'react'
import type { PropsLocale } from '@deepseek-ai/dsh-client-ui-slots'
import { MAINTENANCE_API } from './protocol.ts'
import css from './settings-card.module.css'

/** The face the settings card's slot entry injects (fed from index.ts). */
export interface MaintenanceCardFace {
  /** Same-origin fetch for the loopback maintenance routes. */
  fetchFn: typeof fetch
}

/** One storage area's size summary. */
interface AreaStats {
  count: number
  bytes: number
}

/** Human-readable byte size (KiB / MiB). */
function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MiB`
}

/** Line copy for one area (e.g. "上传文件 3 个 · 2.1 MiB"). */
function areaLabel(t: PropsLocale<'dsh-imagegen'>['t'], area: AreaStats | undefined, key: 'storageUploads' | 'storageAttachments'): string {
  if (area === undefined) return `${t(key)} · ${t('loading')}`
  return `${t(key)} ${area.count} · ${formatBytes(area.bytes)}`
}

/** Props the section receives from the settings card. */
export interface StorageSectionProps extends MaintenanceCardFace {
  /** Locale copy bound by the settings card. */
  t: PropsLocale<'dsh-imagegen'>['t']
}

/**
 * Render the storage section inside the settings card body.
 * @param props - locale copy + the loopback fetch face.
 * @returns the section.
 * Memoized: its only props (`t`, `fetchFn`) are stable, so the per-keystroke
 * settings-card re-render skips this section entirely.
 */
/** Module-level stats cache: the storage section remounts whenever the card
 *  body opens; show the last inventory immediately instead of re-fetching
 *  (the host route also caches, but this avoids even the round-trip). */
interface StatsCacheValue {
  at: number
  uploads: AreaStats
  attachments: AreaStats
}
let statsCache: StatsCacheValue | undefined
const STATS_TTL_MS = 10000

export const StorageSection = memo(function StorageSection({ t, fetchFn }: StorageSectionProps) {
  const [uploads, setUploads] = useState<AreaStats | undefined>(undefined)
  const [attachments, setAttachments] = useState<AreaStats | undefined>(undefined)
  const [running, setRunning] = useState(false)
  const [report, setReport] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const refresh = useCallback(async (): Promise<void> => {
    // Serve the cached inventory when still fresh (no network round-trip).
    if (statsCache !== undefined && Date.now() - statsCache.at < STATS_TTL_MS) {
      setUploads(statsCache.uploads)
      setAttachments(statsCache.attachments)
      setError(undefined)
      return
    }
    try {
      const response = await fetchFn(MAINTENANCE_API.stats, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
      const body = await response.json() as {
        ok?: boolean
        uploads?: AreaStats
        attachments?: AreaStats
        message?: string
      }
      if (body.ok !== true) throw new Error(body.message ?? 'maintenance unavailable')
      if (body.uploads !== undefined && body.attachments !== undefined) {
        statsCache = { at: Date.now(), uploads: body.uploads, attachments: body.attachments }
      }
      setUploads(body.uploads)
      setAttachments(body.attachments)
      setError(undefined)
    } catch (statsError) {
      setError(statsError instanceof Error && statsError.message !== '' ? statsError.message : t('storageFailed'))
    }
  }, [fetchFn, t])

  // Load the sizes when the section mounts (the card body renders lazily).
  useEffect(() => {
    void refresh()
  }, [refresh])

  const onCleanup = useCallback(async () => {
    setRunning(true)
    setError(undefined)
    setReport(undefined)
    try {
      const response = await fetchFn(MAINTENANCE_API.cleanup, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: '{}',
      })
      const body = await response.json() as {
        ok?: boolean
        uploads?: { removed: number; bytesFreed: number }
        attachments?: { removed: number; bytesFreed: number }
        message?: string
      }
      if (body.ok !== true) throw new Error(body.message ?? 'cleanup failed')
      // The corpus changed: drop the cached inventory so the refresh refetches.
      statsCache = undefined
      const total = (body.uploads?.bytesFreed ?? 0) + (body.attachments?.bytesFreed ?? 0)
      setReport(t('storageCleanupDone', {
        uploads: body.uploads?.removed ?? 0,
        attachments: body.attachments?.removed ?? 0,
        bytes: formatBytes(total),
      }))
      void refresh()
    } catch (cleanupError) {
      setError(cleanupError instanceof Error && cleanupError.message !== '' ? cleanupError.message : t('storageFailed'))
    } finally {
      setRunning(false)
    }
  }, [fetchFn, t, refresh])

  return (
    <div className={css.storageSection}>
      <p className={css.storageHeading}>{t('storageTitle')}</p>
      <p className={css.storageLine}>{areaLabel(t, uploads, 'storageUploads')}</p>
      <p className={css.storageLine}>{areaLabel(t, attachments, 'storageAttachments')}</p>
      {error !== undefined ? <p className={css.failed} role="status">{error}</p> : null}
      {report !== undefined ? <p className={css.saved} role="status">{report}</p> : null}
      <div className={css.footer}>
        <button
          type="button"
          className={css.save}
          disabled={running}
          onClick={() => { void onCleanup() }}
        >
          {t(running ? 'storageCleaning' : 'storageCleanup')}
        </button>
      </div>
    </div>
  )
})
