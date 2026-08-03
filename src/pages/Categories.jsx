import { Link } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'
import { CATEGORY_META } from '../data/seedEvents.js'
import EventCard from '../components/EventCard.jsx'
import { useState } from 'react'

// Groups active events by category, with real counts computed from state
export default function Categories() {
  const { activeEvents, categoryCounts, deleteEvent, archiveEvent } = useEvents()
  const [selected, setSelected] = useState(null)

  const categories = Object.keys(CATEGORY_META)
  const filteredEvents = selected
    ? activeEvents.filter((e) => e.category === selected)
    : activeEvents

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 text-on-surface">Categories</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {categories.map((cat) => {
          const meta = CATEGORY_META[cat]
          const count = categoryCounts[cat] || 0
          const active = selected === cat
          return (
            <button
              key={cat}
              onClick={() => setSelected(active ? null : cat)}
              className={`glass-card rounded-2xl p-5 text-left transition-all ${
                active ? 'ring-2 ring-primary' : ''
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 bg-${meta.color}/20 text-${meta.color}`}>
                <span className="material-symbols-outlined">{meta.icon}</span>
              </div>
              <p className="font-bold text-on-surface">{cat}</p>
              <p className="text-xs text-on-surface-variant">{count} event{count !== 1 ? 's' : ''}</p>
            </button>
          )
        })}
      </div>

      {selected && (
        <button
          onClick={() => setSelected(null)}
          className="text-xs text-primary underline mb-4"
        >
          Clear filter — showing all categories
        </button>
      )}

      {filteredEvents.length === 0 ? (
        <p className="text-on-surface-variant">No events in this category yet.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={deleteEvent}
              onArchive={archiveEvent}
            />
          ))}
        </div>
      )}
    </div>
  )
}
