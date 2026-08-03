import { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { seedEvents } from '../data/seedEvents.js'

const EventsContext = createContext(null)
const STORAGE_KEY = 'event-countdown:events'

export function EventsProvider({ children }) {
  const [events, setEvents] = useLocalStorage(STORAGE_KEY, seedEvents)

  const addEvent = useCallback((newEvent) => {
    setEvents((prev) => [
      ...prev,
      {
        ...newEvent,
        id: `evt-${Date.now()}`,
        createdAt: new Date().toISOString(),
        archived: false
      }
    ])
  }, [setEvents])

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [setEvents])

  const archiveEvent = useCallback((id) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, archived: true } : e)))
  }, [setEvents])

  const unarchiveEvent = useCallback((id) => {
    setEvents((prev) => prev.map((e) => (e.id === id ? { ...e, archived: false } : e)))
  }, [setEvents])

  const getEventById = useCallback(
    (id) => events.find((e) => e.id === id),
    [events]
  )

  // useMemo: only recompute derived lists when `events` actually changes
  const activeEvents = useMemo(() => events.filter((e) => !e.archived), [events])

  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    return activeEvents
      .filter((e) => new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [activeEvents])

  const pastEvents = useMemo(() => {
    const now = Date.now()
    return activeEvents
      .filter((e) => new Date(e.date).getTime() < now)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [activeEvents])

  const archivedEvents = useMemo(
    () => events.filter((e) => e.archived).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [events]
  )

  // Groups active events by category, with counts — powers the Categories page
  const categoryCounts = useMemo(() => {
    const map = {}
    activeEvents.forEach((e) => {
      map[e.category] = (map[e.category] || 0) + 1
    })
    return map
  }, [activeEvents])

  const stats = useMemo(() => ({
    total: activeEvents.length,
    upcoming: upcomingEvents.length,
    completed: pastEvents.length,
    archived: archivedEvents.length
  }), [activeEvents, upcomingEvents, pastEvents, archivedEvents])

  // Real, computed storage usage — not decorative. Reads the actual
  // serialized size of this app's localStorage key.
  const storageInfo = useMemo(() => {
    let bytes = 0
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      bytes = raw ? new Blob([raw]).size : 0
    } catch {
      bytes = 0
    }
    const quotaBytes = 5 * 1024 * 1024 // typical localStorage quota is ~5MB
    return {
      usedKB: (bytes / 1024).toFixed(1),
      quotaMB: (quotaBytes / (1024 * 1024)).toFixed(0),
      percentUsed: Math.min(100, (bytes / quotaBytes) * 100)
    }
  }, [events])

  const value = {
    events,
    activeEvents,
    upcomingEvents,
    pastEvents,
    archivedEvents,
    categoryCounts,
    stats,
    storageInfo,
    addEvent,
    deleteEvent,
    archiveEvent,
    unarchiveEvent,
    getEventById
  }

  return (
    <EventsContext.Provider value={value}>
      {children}
    </EventsContext.Provider>
  )
}

export function useEvents() {
  const ctx = useContext(EventsContext)
  if (!ctx) throw new Error('useEvents must be used within EventsProvider')
  return ctx
}
