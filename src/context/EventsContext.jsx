import { createContext, useContext, useMemo, useCallback, useState } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { useAuth } from './AuthContext.jsx'
import { seedEvents, CATEGORY_META } from '../data/seedEvents.js'
import { scopedKey, LEGACY_EVENTS_KEY, readJSON, writeJSON } from '../lib/storage.js'
import { migrateLegacyReminder, isEventPast, isEventToday, eventStart, MS } from '../lib/datetime.js'
import { holidayKey } from '../lib/holidays.js'

const EventsContext = createContext(null)

// Safe migration: older records had a single `reminder` string ('60'); now `reminders` is a list of minutes.
function normalizeEvent(event) {
  const { reminder, ...rest } = event
  return { favorite: false, time: '', ...rest, tasks: Array.isArray(event.tasks) ? event.tasks : [], reminders: migrateLegacyReminder(event) }
}

const newId = () => `evt-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`

export function EventsProvider({ children }) {
  const { scope, isLocalMode } = useAuth()
  const storageKey = scopedKey(LEGACY_EVENTS_KEY, scope)
  // Local/guest mode keeps the original behaviour (seed data on first run); accounts start empty.
  const [stored, setStored] = useLocalStorage(storageKey, scope === 'guest' ? seedEvents : [])
  const events = useMemo(() => (Array.isArray(stored) ? stored.map(normalizeEvent) : []), [stored])
  const commit = useCallback((fn) => setStored((prev) => fn(Array.isArray(prev) ? prev : []).map(normalizeEvent)), [setStored])

  const addEvent = useCallback((e) => commit((prev) => [...prev, { ...e, id: newId(), createdAt: new Date().toISOString(), archived: false, favorite: false, tasks: e.tasks || [], reminders: e.reminders || [] }]), [commit])
  const updateEvent = useCallback((id, updates) => commit((prev) => prev.map((ev) => {
    if (ev.id !== id) return ev
    const merged = { ...ev, ...updates, id }
    if ('reminders' in updates) delete merged.reminder
    return merged
  })), [commit])
  const deleteEvent = useCallback((id) => commit((prev) => prev.filter((e) => e.id !== id)), [commit])
  const archiveEvent = useCallback((id) => commit((prev) => prev.map((e) => e.id === id ? { ...e, archived: true } : e)), [commit])
  const unarchiveEvent = useCallback((id) => commit((prev) => prev.map((e) => e.id === id ? { ...e, archived: false } : e)), [commit])
  const toggleFavorite = useCallback((id) => commit((prev) => prev.map((e) => e.id === id ? { ...e, favorite: !e.favorite } : e)), [commit])
  const getEventById = useCallback((id) => events.find((e) => e.id === id), [events])

  // Import a public holiday as an all-day event. Returns 'added' | 'exists'. Never duplicates.
  const addHolidayEvent = useCallback((holiday, countryName, reminders = []) => {
    const key = holidayKey(holiday)
    if (events.some((e) => e.holidayKey === key)) return 'exists'
    const [y, m, d] = holiday.date.split('-').map(Number)
    const meta = CATEGORY_META.Holiday
    commit((prev) => {
      if (prev.some((e) => e.holidayKey === key)) return prev      // guards double-clicks
      return [...prev, { id: newId(), title: holiday.localName || holiday.name, category: 'Holiday', location: countryName || holiday.countryCode,
        date: new Date(y, m - 1, d).toISOString(), allDay: true, holidayKey: key, notes: `Public holiday: ${holiday.name} (${holiday.countryCode}).`,
        color: meta.color, icon: meta.icon, image: meta.image, createdAt: new Date().toISOString(), archived: false, favorite: false, tasks: [], reminders }]
    })
    return 'added'
  }, [events, commit])

  // ---- Offer to bring pre-account local events into a new account (never automatic) ----
  const importFlagKey = scopedKey('event-countdown:legacy-import', scope)
  const [importState, setImportState] = useState(() => readJSON(importFlagKey, ''))
  const legacyCandidates = useMemo(() => {
    if (scope === 'guest' || importState) return []
    const legacy = readJSON(LEGACY_EVENTS_KEY, [])
    if (!Array.isArray(legacy)) return []
    const have = new Set(events.map((e) => e.id))
    return legacy.filter((e) => e && e.id && !have.has(e.id))
  }, [scope, importState, events])
  const importLegacyEvents = useCallback(() => {
    const legacy = readJSON(LEGACY_EVENTS_KEY, [])
    commit((prev) => { const have = new Set(prev.map((e) => e.id)); return [...prev, ...legacy.filter((e) => e && e.id && !have.has(e.id))] })
    writeJSON(importFlagKey, 'imported'); setImportState('imported')
  }, [commit, importFlagKey])
  const dismissLegacyImport = useCallback(() => { writeJSON(importFlagKey, 'dismissed'); setImportState('dismissed') }, [importFlagKey])

  // ---- Derived data (all statistics come from the real event list) ----
  const activeEvents = useMemo(() => events.filter((e) => !e.archived), [events])
  const byDate = (dir) => (a, b) => (eventStart(a) - eventStart(b)) * dir
  const upcomingEvents = useMemo(() => activeEvents.filter((e) => !isEventPast(e)).sort(byDate(1)), [activeEvents])
  const pastEvents = useMemo(() => activeEvents.filter((e) => isEventPast(e)).sort(byDate(-1)), [activeEvents])
  const archivedEvents = useMemo(() => events.filter((e) => e.archived).sort(byDate(-1)), [events])
  const favoriteEvents = useMemo(() => activeEvents.filter((e) => e.favorite), [activeEvents])
  const categoryCounts = useMemo(() => activeEvents.reduce((map, e) => ({ ...map, [e.category]: (map[e.category] || 0) + 1 }), {}), [activeEvents])
  const stats = useMemo(() => ({ total: activeEvents.length, upcoming: upcomingEvents.length, completed: pastEvents.length, archived: archivedEvents.length, today: activeEvents.filter((e) => isEventToday(e) && !isEventPast(e)).length }), [activeEvents, upcomingEvents, pastEvents, archivedEvents])
  const within = (days) => upcomingEvents.filter((e) => eventStart(e) - Date.now() <= days * MS.DAY).length
  const nextSevenDays = useMemo(() => within(7), [upcomingEvents]) // eslint-disable-line react-hooks/exhaustive-deps
  const nextThirtyDays = useMemo(() => within(30), [upcomingEvents]) // eslint-disable-line react-hooks/exhaustive-deps
  const storageInfo = useMemo(() => {
    let bytes = 0
    try { const raw = window.localStorage.getItem(storageKey); bytes = raw ? new Blob([raw]).size : 0 } catch { bytes = 0 }
    return { usedKB: (bytes / 1024).toFixed(1), quotaMB: '5', percentUsed: Math.min(100, bytes / (5 * 1024 * 1024) * 100) }
  }, [events, storageKey])

  const value = { events, activeEvents, upcomingEvents, pastEvents, archivedEvents, favoriteEvents, categoryCounts, stats, nextSevenDays, nextThirtyDays, storageInfo,
    addEvent, updateEvent, deleteEvent, archiveEvent, unarchiveEvent, toggleFavorite, getEventById, addHolidayEvent,
    legacyEventCount: legacyCandidates.length, importLegacyEvents, dismissLegacyImport, isLocalMode }
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents must be used within EventsProvider')
  return ctx
}
