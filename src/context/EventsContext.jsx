import { createContext, useContext, useMemo, useCallback } from 'react'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { seedEvents } from '../data/seedEvents.js'

const EventsContext = createContext(null)

export function EventsProvider({ children }) {
  const [events, setEvents] = useLocalStorage('event-countdown:events', seedEvents)

  // useCallback: stable function identity passed down to many child components
  const addEvent = useCallback((newEvent) => {
    setEvents((prev) => [
      ...prev,
      { ...newEvent, id: `evt-${Date.now()}` }
    ])
  }, [setEvents])

  const deleteEvent = useCallback((id) => {
    setEvents((prev) => prev.filter((e) => e.id !== id))
  }, [setEvents])

  const getEventById = useCallback(
    (id) => events.find((e) => e.id === id),
    [events]
  )

  // useMemo: only recompute derived lists when `events` actually changes
  const upcomingEvents = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
  }, [events])

  const pastEvents = useMemo(() => {
    const now = Date.now()
    return events
      .filter((e) => new Date(e.date).getTime() < now)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
  }, [events])

  const stats = useMemo(() => ({
    total: events.length,
    upcoming: upcomingEvents.length,
    completed: pastEvents.length
  }), [events, upcomingEvents, pastEvents])

  const value = {
    events,
    upcomingEvents,
    pastEvents,
    stats,
    addEvent,
    deleteEvent,
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
