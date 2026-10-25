// Per-account storage keys. The legacy single-user keys (e.g. "event-countdown:events")
// stay in use for local/guest mode, so existing data is never moved or lost.
export const scopedKey = (base, scope) => (!scope || scope === 'guest' ? base : `${base}::${scope}`)
export const LEGACY_EVENTS_KEY = 'event-countdown:events'

export function readJSON(key, fallback) {
  try { const raw = localStorage.getItem(key); return raw === null ? fallback : JSON.parse(raw) } catch { return fallback }
}
export function writeJSON(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); return true } catch { return false }
}
