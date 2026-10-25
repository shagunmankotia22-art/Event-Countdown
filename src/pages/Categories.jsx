import { useState } from 'react'
import { useEvents } from '../context/EventsContext.jsx'
import { CATEGORY_META } from '../data/seedEvents.js'
import EventCard from '../components/EventCard.jsx'

export default function Categories() {
  const { activeEvents, categoryCounts, deleteEvent, archiveEvent, toggleFavorite } = useEvents()
  const [selected, setSelected] = useState(null)
  const names = [...new Set([...Object.keys(CATEGORY_META), ...Object.keys(categoryCounts)])]
  const list = selected ? activeEvents.filter((e) => e.category === selected) : activeEvents
  return <div className="simple-page"><div className="page-heading"><p className="eyebrow">BROWSE</p><h1>Categories</h1><p className="muted">Counts come from your saved events.</p></div>
    <div className="category-grid">{names.map((name) => { const meta = CATEGORY_META[name]; const count = categoryCounts[name] || 0; const on = selected === name
      return <button key={name} onClick={() => setSelected(on ? null : name)} className={`category-tile ${on ? 'on' : ''}`} aria-pressed={on}><span className="stat-icon"><span className="material-symbols-outlined">{meta?.icon || 'label'}</span></span><strong>{name}</strong><small className="muted">{count} event{count === 1 ? '' : 's'}</small></button> })}</div>
    {selected && <button className="text-button" onClick={() => setSelected(null)}>Clear filter — show all categories</button>}
    {list.length === 0 ? <div className="empty-state"><span className="material-symbols-outlined">category</span><h3>No events in this category</h3></div> : <div className="event-grid">{list.map((e) => <EventCard key={e.id} event={e} onDelete={deleteEvent} onArchive={archiveEvent} onFavorite={toggleFavorite} />)}</div>}</div>
}
