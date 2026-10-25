import { useMemo, useState } from 'react'
import { usePublicHolidays, useCountries } from '../hooks/usePublicHolidays.js'
import { useEvents } from '../context/EventsContext.jsx'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { holidayKey, countryName as regionName, FALLBACK_COUNTRIES } from '../lib/holidays.js'
import { parseDateOnly, startOfLocalDay, formatDate } from '../lib/datetime.js'

export default function PublicHolidays() {
  const { settings, updateSettings } = useNotifications()
  const { events, addHolidayEvent } = useEvents()
  const thisYear = new Date().getFullYear()
  const [country, setCountry] = useState(settings.holidayCountry)
  const [year, setYear] = useState(thisYear)
  const [upcomingOnly, setUpcomingOnly] = useState(false)
  const [message, setMessage] = useState('')
  const { countries: available, error: countriesError } = useCountries()
  const { holidays, loading, error, retryable, source, note, refresh } = usePublicHolidays(country, year)
  // Countries the live service covers, plus any built-in-fallback country the service lacks (shown with an honest label).
  const countries = useMemo(() => {
    const extra = FALLBACK_COUNTRIES.filter((f) => !available.some((c) => c.countryCode === f.countryCode)).map((f) => ({ ...f, name: `${f.name} (limited built-in list)` }))
    return [...available, ...extra]
  }, [available])
  const countryName = available.find((c) => c.countryCode === country)?.name || regionName(country)
  const today = startOfLocalDay().getTime()
  const imported = useMemo(() => new Set(events.map((e) => e.holidayKey).filter(Boolean)), [events])

  const list = useMemo(() => holidays.filter((h) => !upcomingOnly || parseDateOnly(h.date).getTime() >= today), [holidays, upcomingOnly, today])
  const nextHoliday = holidays.find((h) => parseDateOnly(h.date).getTime() >= today)
  const choose = (code) => { setCountry(code); updateSettings({ holidayCountry: code }) }   // also used for holiday notifications
  const add = (h) => { const r = addHolidayEvent(h, countryName, settings.defaultOffsets); setMessage(r === 'exists' ? `“${h.localName || h.name}” is already in your events.` : `Added “${h.localName || h.name}” to your events.`); setTimeout(() => setMessage(''), 3000) }
  const years = [thisYear - 1, thisYear, thisYear + 1]

  return <div className="simple-page narrow-page wide">
    <div className="page-heading row"><div><p className="eyebrow">WORLD CALENDAR</p><h1>Public holidays</h1><p className="muted">Fetched from the Nager.Date public-holiday API each time you open this page, change the selection or press Refresh.</p></div>
      <button className="secondary-button" onClick={refresh} disabled={loading}><span className="material-symbols-outlined">refresh</span>{loading ? 'Loading…' : 'Refresh'}</button></div>
    <div className="filters-panel" role="group" aria-label="Holiday filters">
      <label className="inline-field"><span>Country</span><select value={country} onChange={(e) => choose(e.target.value)}>{countries.some((c) => c.countryCode === country) ? null : <option value={country}>{regionName(country)}</option>}{countries.map((c) => <option key={c.countryCode} value={c.countryCode}>{c.name}</option>)}</select></label>
      <label className="inline-field"><span>Year</span><select value={year} onChange={(e) => setYear(Number(e.target.value))}>{years.map((y) => <option key={y}>{y}</option>)}</select></label>
      <label className="switch-label"><input type="checkbox" checked={upcomingOnly} onChange={(e) => setUpcomingOnly(e.target.checked)} /><span>Upcoming only</span></label>
    </div>
    {countriesError && <p className="muted small">Couldn't load the full country list ({countriesError}). Showing your current country only.</p>}
    {message && <p className="success-text" role="status">{message}</p>}
    {source === 'fallback' && !loading && !error && <div className="notice-box warn" role="status"><span className="material-symbols-outlined">info</span><p><strong>Not live data.</strong> {note}</p></div>}
    {nextHoliday && !loading && !error && year === thisYear && <div className="next-holiday"><span className="material-symbols-outlined">event_upcoming</span><div><small>NEXT UP</small><strong>{nextHoliday.localName || nextHoliday.name}</strong><span>{formatDate(parseDateOnly(nextHoliday.date), { weekday: 'long', day: 'numeric', month: 'long' })} · {countryName}</span></div></div>}
    {loading && !holidays.length && <div className="panel" aria-busy="true"><div className="skeleton-list">{[0, 1, 2, 3, 4].map((i) => <div key={i} className="skeleton tall" />)}</div></div>}
    {error && <div className="empty-state" role="alert"><span className="material-symbols-outlined">cloud_off</span><h3>{retryable ? "Couldn't load holidays" : 'No holiday data'}</h3><p>{error}</p>{retryable ? <button className="primary-button" onClick={refresh}>Retry</button> : <p className="muted small">Try a different country or year.</p>}</div>}
    {!loading && !error && !list.length && <div className="empty-state"><span className="material-symbols-outlined">event_busy</span><h3>No holidays found</h3><p>{upcomingOnly ? `No more holidays remain in ${year} for ${countryName}.` : `The API returned no public holidays for ${countryName} in ${year}.`}</p></div>}
    {list.length > 0 && <ul className="panel flush holiday-list">{list.map((h) => { const d = parseDateOnly(h.date); const isNext = h === nextHoliday && year === thisYear; const done = imported.has(holidayKey(h))
      return <li key={`${h.date}-${h.name}`} className={`holiday-item ${isNext ? 'next' : ''} ${d.getTime() < today ? 'past' : ''}`}>
        <div className="holiday-date big"><b>{d.getDate()}</b><small>{d.toLocaleDateString(undefined, { month: 'short' })}</small></div>
        <div className="holiday-info"><strong>{h.localName || h.name}</strong>{h.name !== h.localName && <small className="muted block">{h.name}</small>}<small className="muted block">{d.toLocaleDateString(undefined, { weekday: 'long' })} · {countryName}{!h.global && ' · Regional'}</small></div>
        {isNext && <span className="chip accent">Next</span>}
        <button className={done ? 'secondary-button compact' : 'primary-button compact'} onClick={() => add(h)} disabled={done}>{done ? <><span className="material-symbols-outlined">check</span>Added</> : <><span className="material-symbols-outlined">add</span>Add to events</>}</button></li> })}</ul>}
    <p className="muted tiny">Source: date.nager.at. Coverage varies by country and some countries have no data; regional holidays are marked. Nothing is stored — each visit and every Refresh asks the service again.</p>
  </div>
}
