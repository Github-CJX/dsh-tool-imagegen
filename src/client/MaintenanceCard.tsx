/**
 * The dsh-tool-imagegen storage-maintenance card: shows how much space the
 * upload work dir and the attachment store occupy, and offers a one-click
 * orphan cleanup — files no session (live or persisted) references are
 * removed, and the freed space is reported. Registered into the official
 * `settings.plugin.item` slot as its own card, beside the generator settings
 * card, bound to the loopback maintenance bridge.
 */

import { useCallback, useEffect, useState } from 'react'
import type { PropsLocale, PropsRuntime } from '@deepseek-ai/dsh-client-ui-slots'
import { MAINTENANCE_API } from './protocol.ts'
import css from './settings-card.module.css'

/** The registrant-side face the card's slot entry injects. */
export interface MaintenanceCardFace {
  /** Same-origin fetch for the loopback maintenance routes. */
  fetchFn: typeof fetch
}

/** Props the composed settings entry receives. */
export type MaintenanceCardProps =
  PropsRuntime<'settings.plugin.item'>
  & PropsLocale<'dsh-imagegen'>
  & MaintenanceCardFace

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
function areaLabel(t: MaintenanceCardProps['t'], area: AreaStats | undefined, key: 'storageUploads' | 'storageAttachments'): string {
  if (area === undefined) return `${t(key)} · ${t('loading')}`
  return `${t(key)} ${area.count} · ${formatBytes(area.bytes)}`
}

/**
 * Render the maintenance card.
 * @param props - locale copy + the loopback fetch face.
 * @returns the card, or nothing while the namespace is still loading.
 */
export function MaintenanceCard(props: MaintenanceCardProps) {
  const { t, fetchFn } = props
  const [open, setOpen] = useState(false)
  const [uploads, setUploads] = useState<AreaStats | undefined>(undefined)
  const [attachments, setAttachments] = useState<AreaStats | undefined>(undefined)
  const [running, setRunning] = useState(false)
  const [report, setReport] = useState<string | undefined>(undefined)
  const [error, setError] = useState<string | undefined>(undefined)

  const refresh = useCallback(async () => {
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
      setUploads(body.uploads)
      setAttachments(body.attachments)
      setError(undefined)
    } catch (statsError) {
      setError(statsError instanceof Error && statsError.message !== '' ? statsError.message : t('storageFailed'))
    }
  }, [fetchFn, t])

  // Load the sizes when the card opens.
  useEffect(() => {
    if (!open) return
    void refresh()
  }, [open, refresh])

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

  const title = t('storageTitle')

  return (
    <li className={css.card}>
      <button
        type="button"
        className={css.header}
        aria-expanded={open}
        aria-label={`${t(open ? 'collapse' : 'expand')}: ${title}`}
        onClick={() => { setOpen(!open) }}
      >
        <span className={css.headText}>
          <span className={css.name}>{title}</span>
          <span className={css.description}>{t('storageDescription')}</span>
        </span>
        <span className={open ? css.chevronOpen : css.chevron}>▾</span>
      </button>
      {open
        ? (
          <div className={css.body}>
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
        : null}
    </li>
  )
}
