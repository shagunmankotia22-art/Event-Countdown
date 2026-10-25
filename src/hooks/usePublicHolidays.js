import { useCallback, useEffect, useRef, useState } from 'react'
import { loadCountries, loadHolidays, isAbort, isRetryable, FALLBACK_COUNTRIES } from '../lib/holidays.js'
import { parseDateOnly, startOfLocalDay } from '../lib/datetime.js'

const IDLE = { holidays: [], loading: false, error: '', retryable: true, source: 'live', note: '' }

// Holidays for one country+year. Fetches when mounted, when country/year change, and on refresh().
// The previous selection's data is never shown for a new selection, and any obsolete request is aborted.
export function usePublicHolidays(country, year) {
  const key = country ? `${country}:${year}` : ''
  const [tick, setTick] = useState(0)
  const freshRef = useRef(false)
  const [state, setState] = useState({ key: '', ...IDLE })

  useEffect(() => {
    if (!key) return undefined
    const controller = new AbortController()
    const fresh = freshRef.current      // true only for the load triggered by Refresh
    freshRef.current = false
    setState({ key, ...IDLE, loading: true })
    loadHolidays(country, year, { signal: controller.signal, fresh })
      .then((r) => setState({ key, ...IDLE, holidays: r.holidays, source: r.source, note: r.note }))
      .catch((e) => { if (!isAbort(e)) setState({ key, ...IDLE, error: e.message || 'Could not load holidays.', retryable: isRetryable(e) }) })
    return () => controller.abort()                         // selection changed or component unmounted
  }, [key, tick]) // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = useCallback(() => { freshRef.current = true; setTick((t) => t + 1) }, [])
  const current = state.key === key
  // While the data on hand belongs to another selection, report loading + nothing.
  return key
    ? (current ? { ...state, refresh } : { ...IDLE, loading: true, refresh })
    : { ...IDLE, refresh }
}

// Next `limit` upcoming holidays; reaches into next year only when this year runs out.
export function useUpcomingHolidays(country, limit = 4) {
  const year = new Date().getFullYear()
  const current = usePublicHolidays(country, year)
  const today = startOfLocalDay().getTime()
  const upcoming = (list) => list.filter((h) => { const d = parseDateOnly(h.date); return d && d.getTime() >= today })
  const needNext = !current.loading && !current.error && upcoming(current.holidays).length < limit
  const next = usePublicHolidays(needNext ? country : null, year + 1)
  const holidays = [...upcoming(current.holidays), ...(needNext ? upcoming(next.holidays) : [])].slice(0, limit)
  return { holidays, loading: current.loading || (needNext && next.loading), error: current.error, retryable: current.retryable, source: current.source, note: current.note, refresh: current.refresh }
}

export function useCountries() {
  const [state, setState] = useState({ countries: FALLBACK_COUNTRIES, loading: true, error: '' })
  useEffect(() => {
    const controller = new AbortController()
    loadCountries({ signal: controller.signal })
      .then((countries) => setState({ countries, loading: false, error: '' }))
      .catch((e) => { if (!isAbort(e)) setState({ countries: FALLBACK_COUNTRIES, loading: false, error: e.message }) })
    return () => controller.abort()
  }, [])
  return state
}
