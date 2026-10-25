import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'
import { localDateKey, formatEventWhen, parseDateOnly, formatDate } from '../lib/datetime.js'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { usePublicHolidays } from '../hooks/usePublicHolidays.js'
import { holidayKey } from '../lib/holidays.js'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']

// Month calendar. Days with events are marked; selecting a day lists that day's events.
export default function CalendarWidget() {
  const { activeEvents } = useEvents()
  const { settings } = useNotifications()
  const [cursor, setCursor] = useState(() => { const n = new Date(); return new Date(n.getFullYear(), n.getMonth(), 1) })
  const [selected, setSelected] = useState(null)
  const shift = (d) => { setCursor((p) => new Date(p.getFullYear(), p.getMonth() + d, 1)); setSelected(null) }

  const byDay = useMemo(() => {
    const map = {}
    activeEvents.forEach((e) => { const k = localDateKey(e.date); if (k) (map[k] = map[k] || []).push(e) })
    return map
  }, [activeEvents])

  const year = cursor.getFullYear(); const month = cursor.getMonth()
  const { holidays, loading: holidaysLoading, error: holidaysError } = usePublicHolidays(settings.holidayCountry || 'IN', year)
  // Holidays the user already imported as an event are shown once (as the event), not twice.
  const importedKeys = useMemo(() => new Set(activeEvents.map((e) => e.holidayKey).filter(Boolean)), [activeEvents])
  const holidaysByDay = useMemo(() => {
    const map = {}
    holidays.filter((h) => !importedKeys.has(holidayKey(h))).forEach((h) => { const k = h.date; (map[k] = map[k] || []).push(h) })
    return map
  }, [holidays, importedKeys])
  const lead = (new Date(year, month, 1).getDay() + 6) % 7
  const total = new Date(year, month + 1, 0).getDate()
  const cells = [...Array(lead).fill(null), ...Array.from({ length: total }, (_, i) => i + 1)]
  const key = (d) => localDateKey(new Date(year, month, d))
  const todayKey = localDateKey(new Date())
  const selectedKey = selected ? key(selected) : null
  const dayEvents = selected ? byDay[selectedKey] || [] : []
  const dayHolidays = selected ? holidaysByDay[selectedKey] || [] : []

  return <div className="panel calendar-widget">
    <div className="panel-heading"><h3>{MONTHS[month]} {year}</h3><div className="cal-nav"><button className="icon-button" onClick={() => shift(-1)} aria-label="Previous month"><span className="material-symbols-outlined">chevron_left</span></button><button className="icon-button" onClick={() => shift(1)} aria-label="Next month"><span className="material-symbols-outlined">chevron_right</span></button></div></div>
    <div className="cal-grid cal-weekdays" aria-hidden="true">{WEEKDAYS.map((w, i) => <span key={i}>{w}</span>)}</div>
    <div className="cal-grid">{cells.map((day, i) => {
      if (!day) return <span key={i} />
      const dayKey = key(day); const has = Boolean(byDay[dayKey]); const hasHoliday = Boolean(holidaysByDay[dayKey]); const sel = selected === day
      return <button key={i} onClick={() => setSelected(sel ? null : day)} className={`cal-day ${sel ? 'selected' : ''} ${!sel && dayKey === todayKey ? 'today' : ''}`} aria-pressed={sel} aria-label={`${MONTHS[month]} ${day}${has ? `, ${byDay[dayKey].length} event${byDay[dayKey].length > 1 ? 's' : ''}` : ''}${hasHoliday ? ', public holiday' : ''}`}>{day}{has && !sel && <i className="cal-dot" />}{hasHoliday && !sel && <i className={`cal-holiday-dot ${has ? 'with-event' : ''}`} />}</button>
    })}</div>
    {selected && <div className="cal-events">{dayEvents.length === 0 && dayHolidays.length === 0 && <p className="muted small">No events or public holidays on {MONTHS[month]} {selected}.</p>}{dayEvents.map((e) => <Link key={e.id} to={`/events/${e.id}`} className="cal-event"><i /><span><strong>{e.title}</strong><small className="muted block">{formatEventWhen(e)}</small></span></Link>)}{dayHolidays.map((h) => <div key={`${h.date}-${h.name}`} className="cal-event cal-holiday-event"><i /><span><strong>{h.localName || h.name}</strong><small className="muted block">Public holiday · {formatDate(parseDateOnly(h.date), { weekday: 'long' })}</small></span></div>)}</div>}
    {holidaysLoading && <p className="muted tiny">Loading public holidays…</p>}{holidaysError && <p className="muted tiny">Public holidays are temporarily unavailable.</p>}
  </div>
}
