/**
 * Read one live session's event log across DSH session-API generations.
 *
 * DSH ≤ 2.0.9 exposed the log as a plain `session.events` array. The current
 * session service (`@deepseek-ai/dsh-session`'s `Session`) keeps the log
 * private and hands out materialized snapshots instead: `snapshotEvents(from,
 * to)` (the whole log with no arguments) and `ownEvents()` (this session's
 * slice after a fork-inherited prefix). Reading `session.events` there yields
 * `undefined`, and every consumer that iterated it threw
 * `TypeError: events is not iterable` — which surfaced as an attachment bridge
 * that could never serve a byte.
 *
 * Authorization scans want the WHOLE log (a forked session inherits its
 * parent's image blocks), so the snapshot accessor is preferred and
 * `ownEvents()` is only a last-resort fallback. An unserializable shape
 * degrades to an empty list: a missing reference is a 404 ("not referenced"),
 * never a crash.
 */

/**
 * Resolve one session's event list.
 * @param {object|undefined} session - a session service handle (`sessions.get(id)`), or undefined.
 * @returns {readonly object[]} the session's events in log order (empty when unknown).
 */
export function sessionEvents(session) {
  if (session === undefined || session === null) return []
  // Current API: the materialized immutable snapshot of the whole log.
  if (typeof session.snapshotEvents === 'function') {
    const events = session.snapshotEvents()
    if (Array.isArray(events)) return events
  }
  // Legacy API (DSH ≤ 2.0.9): the log itself.
  if (Array.isArray(session.events)) return session.events
  // Fork-aware fallback: this session's own slice. Misses an inherited
  // prefix, so it is never the first choice.
  if (typeof session.ownEvents === 'function') {
    const events = session.ownEvents()
    if (Array.isArray(events)) return events
  }
  return []
}
