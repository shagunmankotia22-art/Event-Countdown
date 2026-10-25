import { Link } from 'react-router-dom'
import { useUpcomingHolidays } from '../hooks/usePublicHolidays.js'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { parseDateOnly, formatDate } from '../lib/datetime.js'

// Dashboard card — real data from the public-holiday API (never hard-coded).
export default function PublicHolidaysCard() {
  const { settings } = useNotifications()
  const country = settings.holidayCountry
  const { holidays, loading, error, retryable, source, refresh } = useUpcomingHolidays(country, 4)
  return <div className="panel holiday-panel">
    <div className="panel-heading"><h3><span className="material-symbols-outlined" aria-hidden="true">celebration</span>Public holidays</h3><button onClick={refresh} disabled={loading}>{loading ? 'Loading…' : 'Refresh'}</button></div>
    {loading && !holidays.length && <div className="skeleton-list" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="skeleton" />)}</div>}
    {error && <div role="alert"><p className="error-text">{error}</p>{retryable && <button className="secondary-button compact" onClick={refresh}>Retry</button>}</div>}
    {source === 'fallback' && !error && <p className="muted tiny">Limited built-in list (fixed-date national holidays only) — the live service has no data for this country.</p>}
    {!loading && !error && !holidays.length && <p className="muted small">No upcoming public holidays found for {country}.</p>}
    {holidays.map((h) => <div className={`holiday-row ${h === holidays[0] ? 'next' : ''}`} key={`${h.date}-${h.name}`}><span className="holiday-date">{formatDate(parseDateOnly(h.date), { day: 'numeric', month: 'short' })}</span><span><strong>{h.localName || h.name}</strong><small className="muted block">{formatDate(parseDateOnly(h.date), { weekday: 'long' })} · {h.countryCode}</small></span></div>)}
    <Link to="/holidays" className="text-link panel-link">All holidays <span className="material-symbols-outlined">chevron_right</span></Link>
  </div>
}
