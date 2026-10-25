import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEvents } from '../context/EventsContext.jsx'
import { useSearch } from '../context/SearchContext.jsx'
import EventCard from '../components/EventCard.jsx'
import StatsCards from '../components/StatsCards.jsx'
import CalendarWidget from '../components/CalendarWidget.jsx'
import PublicHolidaysCard from '../components/PublicHolidaysCard.jsx'
import { eventStart, isEventPast, isEventToday, MS } from '../lib/datetime.js'

const ALL = 'All categories'
const STATUSES = ['Upcoming', 'Today', 'Next 7 days', 'Favorites', 'Past', 'All active']
const PAGE_SIZE = 6

export default function Dashboard() {
  const { activeEvents, stats, nextThirtyDays, deleteEvent, archiveEvent, toggleFavorite, legacyEventCount, importLegacyEvents, dismissLegacyImport } = useEvents()
  const { userName } = useAuth()
  const { query, clear } = useSearch()
  const [category, setCategory] = useState(ALL)
  const [status, setStatus] = useState('Upcoming')
  const [sort, setSort] = useState('Nearest date')
  const [page, setPage] = useState(1)

  const categories = useMemo(() => [ALL, ...new Set(activeEvents.map((e) => e.category))], [activeEvents])
  useEffect(() => { setPage(1) }, [query])

  const filtered = useMemo(() => {
    const now = Date.now()
    const q = query.trim().toLowerCase()
    let list = activeEvents.filter((e) => {
      if (status === 'Upcoming') return !isEventPast(e, now)
      if (status === 'Today') return isEventToday(e, now) && !isEventPast(e, now)
      if (status === 'Next 7 days') return !isEventPast(e, now) && eventStart(e) - now <= 7 * MS.DAY
      if (status === 'Favorites') return e.favorite
      if (status === 'Past') return isEventPast(e, now)
      return true
    })
    if (category !== ALL) list = list.filter((e) => e.category === category)
    if (q) list = list.filter((e) => `${e.title} ${e.location || ''}`.toLowerCase().includes(q))
    const by = { 'Nearest date': (a, b) => eventStart(a) - eventStart(b), 'Furthest date': (a, b) => eventStart(b) - eventStart(a),
      'Title A–Z': (a, b) => a.title.localeCompare(b.title), 'Recently created': (a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0) }
    return [...list].sort(by[sort])
  }, [activeEvents, category, status, sort, query])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, pageCount)
  const visible = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)
  const filtersActive = category !== ALL || status !== 'Upcoming' || sort !== 'Nearest date'
  const clearFilters = () => { setCategory(ALL); setStatus('Upcoming'); setSort('Nearest date'); setPage(1) }
  const hour = new Date().getHours()

  return <div className="dashboard-page">
    {legacyEventCount > 0 && <div className="banner" role="region" aria-label="Import local events"><span className="material-symbols-outlined">inventory</span><div><strong>{legacyEventCount} event{legacyEventCount === 1 ? '' : 's'} found on this device</strong><p>These were saved before accounts existed. Import a copy into this account? The originals stay untouched.</p></div><div className="banner-actions"><button className="primary-button compact" onClick={importLegacyEvents}>Import</button><button className="secondary-button compact" onClick={dismissLegacyImport}>Not now</button></div></div>}
    <section className="welcome-row"><div><p className="eyebrow">{new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' }).toUpperCase()}</p><h1>Good {hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'}, {userName || 'there'}! <span>☀️</span></h1><p className="muted">You have {stats.upcoming} upcoming event{stats.upcoming === 1 ? '' : 's'}{stats.today ? `, ${stats.today} happening today` : ''}.</p></div><Link to="/add" className="primary-button"><span className="material-symbols-outlined">add</span>Add Event</Link></section>
    <StatsCards stats={stats} nextThirtyDays={nextThirtyDays} />
    <div className="dashboard-columns"><section className="main-column">
      <div className="section-heading"><div><h2>{query ? 'Search results' : 'Your events'}</h2><p className="muted">{query ? <>{filtered.length} result{filtered.length === 1 ? '' : 's'} for “{query}”</> : 'Keep every important moment in sight.'}</p></div><Link to="/calendar" className="text-link">View calendar <span className="material-symbols-outlined">chevron_right</span></Link></div>
      <div className="filters-panel" role="group" aria-label="Filters and sorting">
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1) }} aria-label="Filter by category">{categories.map((c) => <option key={c}>{c}</option>)}</select>
        <select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1) }} aria-label="Filter by status">{STATUSES.map((s) => <option key={s}>{s}</option>)}</select>
        <select value={sort} onChange={(e) => { setSort(e.target.value); setPage(1) }} aria-label="Sort events"><option>Nearest date</option><option>Furthest date</option><option>Title A–Z</option><option>Recently created</option></select>
        {(filtersActive || query) && <button className="clear-button" onClick={() => { clearFilters(); clear() }}>Clear all</button>}
      </div>
      {visible.length ? <div className="event-grid">{visible.map((e) => <EventCard key={e.id} event={e} onDelete={deleteEvent} onArchive={archiveEvent} onFavorite={toggleFavorite} />)}</div>
        : <div className="empty-state"><span className="material-symbols-outlined">{query ? 'search_off' : 'event_busy'}</span>
          <h3>{query ? `No events match “${query}”` : activeEvents.length ? 'No matching events' : 'No events yet'}</h3>
          <p>{query ? 'Searching title and location with your current filters.' : activeEvents.length ? 'Try changing the filters.' : 'Create your first event to start a countdown.'}</p>
          <div className="empty-actions">{query && <button className="secondary-button" onClick={clear}>Clear search</button>}{filtersActive && <button className="secondary-button" onClick={clearFilters}>Reset filters</button>}{!query && <Link to="/add" className="primary-button">Create an event</Link>}</div></div>}
      {filtered.length > PAGE_SIZE && <nav className="pagination" aria-label="Pagination"><button disabled={safePage === 1} onClick={() => setPage(safePage - 1)}>‹ Previous</button><span>Page {safePage} of {pageCount}</span><button disabled={safePage === pageCount} onClick={() => setPage(safePage + 1)}>Next ›</button></nav>}
    </section>
    <aside className="right-column"><CalendarWidget /><PublicHolidaysCard /><div className="side-tip"><span className="material-symbols-outlined">tips_and_updates</span><div><strong>Make every moment count</strong><p>Add a checklist and reminders to an event to stay on track.</p></div></div></aside></div>
  </div>
}
