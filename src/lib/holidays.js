// Public holidays from Nager.Date (https://date.nager.at) — free, no API key.
//   GET /api/v3/AvailableCountries
//   GET /api/v3/PublicHolidays/{year}/{countryCode}
//
// Deliberately NO persistent cache (no localStorage / sessionStorage / IndexedDB / memory cache of results).
// The only shared state is the set of requests that are in flight right now, so that several components
// asking for the same country+year at the same moment trigger ONE network request. It is cleared the
// moment the request settles or is cancelled.
import { parseDateOnly } from './datetime.js'
import { FIXED_NATIONAL_HOLIDAYS } from '../data/fallbackHolidays.js'

const BASE = 'https://date.nager.at/api/v3'
const TIMEOUT_MS = 12000
const inflight = new Map()

export const DEFAULT_COUNTRY = 'IN'
export const FALLBACK_COUNTRIES = [{ countryCode: 'IN', name: 'India' }]

// One-time cleanup of the cache an earlier version of this app left in the browser.
try { localStorage.removeItem('event-countdown:holidays-cache') } catch { /* storage unavailable */ }

// kind: 'network' | 'timeout' | 'ratelimit' | 'http' | 'nodata' | 'format'
export class HolidayError extends Error {
  constructor(kind, message) { super(message); this.name = 'HolidayError'; this.kind = kind }
}
export const isRetryable = (err) => !(err instanceof HolidayError) || err.kind !== 'nodata'
export const isAbort = (err) => err?.name === 'AbortError'

// Region names come from the browser's own data (no request needed).
export function countryName(code) {
  try { return new Intl.DisplayNames(undefined, { type: 'region' }).of(code) || code } catch { return code }
}

// ---- low-level fetch ------------------------------------------------------
async function fetchJSON(path, { signal, fresh = false } = {}) {
  const controller = new AbortController()
  let timedOut = false
  const timer = setTimeout(() => { timedOut = true; controller.abort() }, TIMEOUT_MS)
  const onAbort = () => controller.abort()
  signal?.addEventListener('abort', onAbort, { once: true })
  try {
    let res
    try {
      // "no-cache" (explicit refresh only) lets the browser revalidate with the server instead of
      // reusing a stored copy; unchanged data still costs only a tiny 304. Normal loads use the browser default.
      res = await fetch(`${BASE}${path}`, { headers: { Accept: 'application/json' }, signal: controller.signal, ...(fresh ? { cache: 'no-cache' } : {}) })
    } catch (err) {
      if (timedOut) throw new HolidayError('timeout', 'The holiday service took too long to respond. Please retry.')
      if (isAbort(err)) throw err                                          // cancelled by us: not an error to show
      throw new HolidayError('network', 'Could not reach the holiday service (network error, blocked connection or no internet).')
    }
    if (res.status === 204) throw new HolidayError('nodata', 'The holiday service has no data for this country.')   // Nager answers 204 + empty body for unsupported countries
    if (res.status === 404) throw new HolidayError('nodata', 'The holiday service has no data for this country or year.')
    if (res.status === 429) throw new HolidayError('ratelimit', 'Too many requests to the holiday service. Please wait a moment and retry.')
    if (!res.ok) throw new HolidayError('http', `The holiday service returned an error (HTTP ${res.status}).`)
    let text
    try { text = await res.text() } catch (err) { if (timedOut) throw new HolidayError('timeout', 'The holiday service took too long to respond. Please retry.'); if (isAbort(err)) throw err; throw new HolidayError('network', 'The connection dropped while loading holidays. Please retry.') }
    if (!text.trim()) throw new HolidayError('nodata', 'The holiday service has no data for this country.')            // 200 with an empty body
    try { return JSON.parse(text) } catch {
      throw new HolidayError('format', /^\s*</.test(text) ? 'The holiday service returned a web page instead of data (a network filter or proxy may be blocking it).' : 'The holiday service returned data that could not be read.')
    }
  } finally { clearTimeout(timer); signal?.removeEventListener('abort', onAbort) }
}

// Share ONE request between callers that ask for the same thing at the same time. If every caller cancels,
// the underlying request is aborted. Nothing is stored after it settles.
function shared(key, signal, run) {
  let entry = inflight.get(key)
  if (!entry) {
    const controller = new AbortController()
    entry = { controller, refs: 0 }
    entry.promise = run(controller.signal).finally(() => { if (inflight.get(key) === entry) inflight.delete(key) })
    entry.promise.catch(() => {})
    inflight.set(key, entry)
  }
  const e = entry
  e.refs += 1
  return new Promise((resolve, reject) => {
    const abort = () => {
      e.refs -= 1
      if (e.refs <= 0) { if (inflight.get(key) === e) inflight.delete(key); e.controller.abort() }
      reject(new DOMException('Aborted', 'AbortError'))
    }
    if (signal?.aborted) return abort()
    signal?.addEventListener('abort', abort, { once: true })
    e.promise.then(
      (v) => { signal?.removeEventListener('abort', abort); resolve(v) },
      (err) => { signal?.removeEventListener('abort', abort); reject(err) }
    )
  })
}

// ---- parsing / validation -----------------------------------------------
const unwrap = (json, key) => (Array.isArray(json) ? json : Array.isArray(json?.[key]) ? json[key] : null)

function sanitizeHoliday(h, country) {
  if (!h || typeof h.date !== 'string' || !parseDateOnly(h.date)) return null
  const name = h.name || h.localName
  if (!name) return null
  return { date: h.date, name: String(name), localName: String(h.localName || name), countryCode: String(h.countryCode || country),
    global: h.global !== false, types: Array.isArray(h.types) ? h.types : [] }
}

function normalizeList(raw, country) {
  const seen = new Set()
  return raw.filter((h) => !Array.isArray(h?.types) || h.types.length === 0 || h.types.includes('Public'))
    .map((h) => sanitizeHoliday(h, country)).filter(Boolean)
    .filter((h) => { const k = `${h.date}|${h.name}`; if (seen.has(k)) return false; seen.add(k); return true })   // no duplicate markers
    .sort((a, b) => a.date.localeCompare(b.date))
}

export function fixedHolidays(country, year) {
  const set = FIXED_NATIONAL_HOLIDAYS[country]
  if (!set) return null
  const p = (n) => String(n).padStart(2, '0')
  return set.items.map((i) => ({ date: `${year}-${p(i.month)}-${p(i.day)}`, name: i.name, localName: i.name, countryCode: country, global: true, types: ['Public'] }))
}

// ---- public API ------------------------------------------------------------
export async function loadCountries({ signal } = {}) {
  const json = await shared('countries', signal, (s) => fetchJSON('/AvailableCountries', { signal: s }))
  const list = unwrap(json, 'countries')
  if (!list) throw new HolidayError('format', 'The holiday service returned an unexpected country list.')
  const clean = list.filter((c) => c && c.countryCode && c.name).map((c) => ({ countryCode: String(c.countryCode), name: String(c.name) }))
    .sort((a, b) => a.name.localeCompare(b.name))
  if (!clean.length) throw new HolidayError('nodata', 'The holiday service returned an empty country list.')
  return clean
}

// Resolves to { holidays, source: 'live' | 'fallback', note }.
//   live     = exactly what the API returned.
//   fallback = small offline list, used only when the API has no data for that country (HolidayError 'nodata').
// Any other failure (network, timeout, HTTP error, bad data) is thrown — fallback data is never used to hide an outage.
// `fresh: true` (Refresh button) asks the browser to revalidate rather than reuse its stored copy.
export async function loadHolidays(country, year, { signal, fresh = false } = {}) {
  if (!/^[A-Za-z]{2}$/.test(String(country || ''))) throw new HolidayError('nodata', 'Choose a valid country.')
  const code = country.toUpperCase()
  if (!Number.isInteger(year) || year < 1900 || year > 2200) throw new HolidayError('nodata', 'Choose a valid year.')
  try {
    const json = await shared(`${code}:${year}:${fresh ? 'fresh' : 'normal'}`, signal, (s) => fetchJSON(`/PublicHolidays/${year}/${code}`, { signal: s, fresh }))
    const raw = unwrap(json, 'holidays')
    if (!raw) throw new HolidayError('format', 'The holiday service returned an unexpected response format.')
    const holidays = normalizeList(raw, code)
    if (!holidays.length) throw new HolidayError('nodata', `The holiday service returned no public holidays for ${countryName(code)} in ${year}.`)
    return { holidays, source: 'live', note: '' }
  } catch (err) {
    if (err instanceof HolidayError && err.kind === 'nodata') {
      const local = fixedHolidays(code, year)
      if (local) return { holidays: local, source: 'fallback', note: `The live holiday service has no data for ${countryName(code)}. Showing only the fixed-date national holidays from a small built-in list. It is incomplete: festival and other variable-date holidays are not included.` }
    }
    throw err
  }
}

export const holidayKey = (h) => `${h.countryCode}:${h.date}:${h.name}`
