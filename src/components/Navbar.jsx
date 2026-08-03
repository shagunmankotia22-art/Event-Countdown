import { Link } from 'react-router-dom'
import { useState, useCallback } from 'react'
import { useEvents } from '../context/EventsContext.jsx'

export default function Navbar() {
  const { events } = useEvents()
  const [query, setQuery] = useState('')

  // Controlled input pattern
  const handleSearchChange = useCallback((e) => {
    setQuery(e.target.value)
  }, [])

  const results = query
    ? events.filter((e) =>
        e.title.toLowerCase().includes(query.toLowerCase())
      )
    : []

  return (
    <header className="fixed top-0 w-full z-50 border-b border-on-surface/10 bg-surface-container/40 backdrop-blur-2xl shadow-md flex justify-between items-center px-6 py-4">
      <Link to="/" className="flex items-center gap-3">
        <span className="material-symbols-outlined text-primary">acute</span>
        <h1 className="font-display text-3xl font-extrabold tracking-tighter text-primary">
          EVENT COUNTDOWN
        </h1>
      </Link>

      <div className="hidden md:flex items-center flex-1 max-w-xl mx-8 relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant" aria-hidden="true">
          search
        </span>
        <input
          className="w-full bg-surface-container-high/50 border-none rounded-full pl-12 pr-6 py-2 text-on-surface focus:ring-2 focus:ring-primary transition-all"
          placeholder="Search milestones..."
          aria-label="Search milestones"
          type="text"
          value={query}
          onChange={handleSearchChange}
        />
        {results.length > 0 && (
          <ul className="absolute top-12 w-full glass-card rounded-2xl overflow-hidden">
            {results.map((r) => (
              <li key={r.id}>
                <Link
                  to={`/events/${r.id}`}
                  className="block px-4 py-3 hover:bg-white/5 text-sm text-on-surface"
                  onClick={() => setQuery('')}
                >
                  {r.title}
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="flex items-center gap-4">
        <Link
          to="/add"
          className="bg-primary text-on-primary px-6 py-2 rounded-full text-sm font-bold flex items-center gap-2 hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all active:scale-95"
        >
          <span className="material-symbols-outlined text-base">add</span>
          ADD EVENT
        </Link>
      </div>
    </header>
  )
}
