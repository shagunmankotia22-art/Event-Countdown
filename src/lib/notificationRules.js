// Pure rules that decide which notifications should exist right now.
// No React / storage / browser APIs in here, so the logic is easy to test.
import { eventStart, isEventPast, isEventToday, localDateKey, describeTimeLeft, formatEventWhen, reminderLabel, parseDateOnly, startOfLocalDay, MS } from './datetime.js'

export const DEFAULT_SETTINGS = {
  remindersEnabled: true,
  defaultOffsets: [1440, 60],      // applied to NEW events (each event keeps its own list)
  notifyToday: true,
  notifyUpcoming: true,
  notifyTasks: true,
  notifyHolidays: true,
  upcomingDays: 3,
  holidayCountry: 'IN',
  browserEnabled: false
}

const timeOnly = (d) => d.toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })

// returns { create: [...candidates], silent: [keys] }
// `isFired(key)` tells us whether a notification for that key was already produced.
export function evaluateEvents(events, settings, now, isFired) {
  const create = []
  const silent = []
  const todayKey = localDateKey(new Date(now))
  const horizon = (settings.upcomingDays || 3) * MS.DAY

  for (const event of events) {
    const start = eventStart(event)
    if (!start || event.archived || isEventPast(event, now)) continue
    const startMs = start.getTime()
    const msLeft = startMs - now
    const base = { eventId: event.id, eventStart: event.date }

    // 1) Reminders — one notification per event + start time + interval.
    if (settings.remindersEnabled && msLeft > 0) {
      const due = (event.reminders || []).filter((m) => now >= startMs - m * MS.MINUTE).sort((a, b) => a - b)
      if (due.length) {
        const keyOf = (m) => `rem:${event.id}:${startMs}:${m}`
        const newest = due[0]                     // smallest offset = the most recent trigger
        due.forEach((m) => { if (m !== newest && !isFired(keyOf(m))) silent.push(keyOf(m)) })   // skip stale catch-up spam
        if (!isFired(keyOf(newest))) {
          create.push({ ...base, key: keyOf(newest), type: 'reminder', title: `${event.title} starts in ${describeTimeLeft(msLeft)}`,
            body: `${reminderLabel(newest)} reminder · ${formatEventWhen(event)}${event.location ? ` · ${event.location}` : ''}` })
        }
      }
    }

    // 2) Happening today
    if (settings.notifyToday && isEventToday(event, now)) {
      const key = `today:${event.id}:${todayKey}:${startMs}`
      if (!isFired(key)) create.push({ ...base, key, type: 'today', title: `${event.title} is today`, body: `${event.allDay ? 'All day' : `Starts at ${timeOnly(start)}`}${event.location ? ` · ${event.location}` : ''}` })
    } else if (settings.notifyUpcoming && msLeft > 0 && msLeft <= horizon) {
      // 3) Coming up soon (not already covered by "today")
      const key = `upcoming:${event.id}:${startMs}`
      if (!isFired(key)) create.push({ ...base, key, type: 'upcoming', title: `${event.title} is coming up`, body: `In ${describeTimeLeft(msLeft)} · ${formatEventWhen(event)}` })
    }

    // 4) Unfinished preparation tasks (at most once per event per day)
    if (settings.notifyTasks && msLeft > 0 && msLeft <= horizon) {
      const tasks = event.tasks || []
      const open = tasks.filter((t) => !t.completed).length
      const key = `tasks:${event.id}:${todayKey}`
      if (open > 0 && !isFired(key)) create.push({ ...base, key, type: 'tasks', title: `Finish preparing for ${event.title}`, body: `${open} of ${tasks.length} preparation task${tasks.length === 1 ? '' : 's'} still open.` })
    }
  }
  return { create, silent }
}

// Public holiday heads-up for today / tomorrow. `holidays` come from the real API/cache.
export function evaluateHolidays(holidays, countryName, settings, now, isFired) {
  if (!settings.notifyHolidays) return []
  const today = startOfLocalDay(new Date(now)).getTime()
  const out = []
  for (const h of holidays) {
    const d = parseDateOnly(h.date)
    if (!d) continue
    const diffDays = Math.round((d.getTime() - today) / MS.DAY)
    if (diffDays !== 0 && diffDays !== 1) continue
    const key = `holiday:${h.countryCode}:${h.date}:${h.name}`
    if (isFired(key)) continue
    out.push({ key, type: 'holiday', title: `${h.localName || h.name} ${diffDays === 0 ? 'is today' : 'is tomorrow'}`, body: `Public holiday${countryName ? ` · ${countryName}` : ''}${h.name !== h.localName ? ` (${h.name})` : ''}`, eventId: null, eventStart: null })
  }
  return out
}

// Should a stored notification be removed because the event it points to changed or vanished?
export function isObsolete(n, eventsById) {
  if (!n.eventId) return false
  const ev = eventsById.get(n.eventId)
  if (!ev) return true                                                    // event deleted
  if (['reminder', 'upcoming', 'today'].includes(n.type) && n.eventStart && n.eventStart !== ev.date) return true   // rescheduled
  if (n.type === 'tasks' && !n.read && (ev.tasks || []).every((t) => t.completed)) return true                    // all done
  return false
}
