import { useState, useMemo, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'

const WEEKDAYS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
]

// Functional month calendar. Highlights days that have events,
// and clicking a day shows that day's events below the grid.
export default function CalendarWidget() {
  const { events } = useEvents()
  const [cursor, setCursor] = useState(() => {
    const now = new Date()
    return new Date(now.getFullYear(), now.getMonth(), 1)
  })
  const [selectedDay, setSelectedDay] = useState(null)

  const goPrevMonth = useCallback(() => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
    setSelectedDay(null)
  }, [])

  const goNextMonth = useCallback(() => {
    setCursor((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
    setSelectedDay(null)
  }, [])

  // Map of "YYYY-M-D" -> events on that day (recomputed only when events/month change)
  const eventsByDay = useMemo(() => {
    const map = {}
    events.forEach((event) => {
      const d = new Date(event.date)
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!map[key]) map[key] = []
      map[key].push(event)
    })
    return map
  }, [events])

  const gridDays = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstOfMonth = new Date(year, month, 1)
    // Convert Sunday=0..Saturday=6 into Monday-first index
    const startOffset = (firstOfMonth.getDay() + 6) % 7
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const days = []
    for (let i = 0; i < startOffset; i++) days.push(null)
    for (let d = 1; d <= daysInMonth; d++) days.push(d)
    return days
  }, [cursor])

  const today = new Date()
  const isToday = (day) =>
    day &&
    cursor.getFullYear() === today.getFullYear() &&
    cursor.getMonth() === today.getMonth() &&
    day === today.getDate()

  const dayKey = (day) => `${cursor.getFullYear()}-${cursor.getMonth()}-${day}`
  const selectedEvents = selectedDay ? eventsByDay[dayKey(selectedDay)] || [] : []

  return (
    <div className="glass-card rounded-[2rem] p-6 mb-8">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-bold text-on-surface">
          {MONTH_NAMES[cursor.getMonth()]} {cursor.getFullYear()}
        </h3>
        <div className="flex gap-1">
          <button
            onClick={goPrevMonth}
            className="p-1 hover:text-primary transition-colors"
            aria-label="Previous month"
          >
            <span className="material-symbols-outlined">chevron_left</span>
          </button>
          <button
            onClick={goNextMonth}
            className="p-1 hover:text-primary transition-colors"
            aria-label="Next month"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((wd, i) => (
          <div key={i} className="text-center text-xs text-on-surface-variant/50">
            {wd}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {gridDays.map((day, idx) => {
          if (!day) return <div key={idx} className="aspect-square" />

          const hasEvents = Boolean(eventsByDay[dayKey(day)])
          const selected = selectedDay === day

          return (
            <button
              key={idx}
              onClick={() => setSelectedDay(selected ? null : day)}
              className={`aspect-square flex items-center justify-center text-sm rounded-full transition-colors relative
                ${selected ? 'bg-primary text-on-primary font-bold' : ''}
                ${!selected && isToday(day) ? 'ring-2 ring-primary/40' : ''}
                ${!selected ? 'hover:bg-primary/20 text-on-surface' : ''}
              `}
              aria-label={`${MONTH_NAMES[cursor.getMonth()]} ${day}${hasEvents ? ', has events' : ''}`}
            >
              {day}
              {hasEvents && !selected && (
                <span className="absolute bottom-1 w-1 h-1 bg-secondary rounded-full" />
              )}
            </button>
          )
        })}
      </div>

      {selectedDay && (
        <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
          {selectedEvents.length === 0 ? (
            <p className="text-xs text-on-surface-variant">
              No events on {MONTH_NAMES[cursor.getMonth()]} {selectedDay}.
            </p>
          ) : (
            selectedEvents.map((event) => (
              <Link
                key={event.id}
                to={`/events/${event.id}`}
                className="flex items-center gap-3 p-2 rounded-xl hover:bg-white/5"
              >
                <span className={`w-2 h-2 rounded-full bg-${event.color}`} />
                <span className="text-sm">{event.title}</span>
              </Link>
            ))
          )}
        </div>
      )}
    </div>
  )
}
