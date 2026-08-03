import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown.js'

// Reusable card component — receives event + action handlers via props
export default function EventCard({ event, onDelete, onArchive }) {
  const { days, isPast } = useCountdown(event.date)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close the menu when clicking outside it
  useEffect(() => {
    function handleClickOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Real elapsed-time progress: % of time passed between when the
  // event was created and its target date.
  const progressPercent = (() => {
    const created = new Date(event.createdAt || event.date).getTime()
    const target = new Date(event.date).getTime()
    const now = Date.now()
    if (target <= created) return 100
    return Math.min(100, Math.max(0, ((now - created) / (target - created)) * 100))
  })()

  return (
    <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <div className={`category-bar bg-${event.color}`} />

      <div className="flex justify-between items-start mb-4">
        <div className={`w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-${event.color}`}>
          <span className="material-symbols-outlined">{event.icon}</span>
        </div>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-primary transition-colors"
            aria-label="Event options"
            aria-expanded={menuOpen}
          >
            <span className="material-symbols-outlined text-lg">more_vert</span>
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-9 z-30 glass-modal rounded-xl overflow-hidden w-36 text-sm">
              {onArchive && (
                <button
                  onClick={() => { onArchive(event.id); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2 text-on-surface hover:bg-white/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">archive</span>
                  Archive
                </button>
              )}
              {onDelete && (
                <button
                  onClick={() => { onDelete(event.id); setMenuOpen(false) }}
                  className="w-full text-left px-4 py-2 text-secondary hover:bg-white/10 flex items-center gap-2"
                >
                  <span className="material-symbols-outlined text-base">delete</span>
                  Delete
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {event.image && (
        <div className="h-40 w-full rounded-2xl overflow-hidden mb-6">
          <img
            src={event.image}
            alt=""
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        </div>
      )}

      <Link to={`/events/${event.id}`}>
        <h3 className="text-xl font-bold mb-1 text-on-surface hover:text-primary transition-colors">
          {event.title}
        </h3>
      </Link>
      <p className="text-xs text-on-surface-variant mb-4">{event.location}</p>

      <div className="flex items-end gap-1 mb-2">
        <span className="monospaced-timer text-3xl font-bold text-on-surface">
          {isPast ? '—' : String(days).padStart(2, '0')}
        </span>
        <span className="text-xs text-on-surface-variant mb-1 uppercase">
          {isPast ? 'Completed' : 'Days To Go'}
        </span>
      </div>

      <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden">
        <div
          className={`h-full bg-${event.color} rounded-full transition-all`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  )
}
