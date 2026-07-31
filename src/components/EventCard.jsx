import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown.js'

// Reusable card component — receives event + optional onDelete via props
export default function EventCard({ event, onDelete }) {
  const { days, isPast } = useCountdown(event.date)

  return (
    <div className="glass-card rounded-[2rem] p-6 relative overflow-hidden group hover:shadow-2xl transition-all duration-500">
      <div className={`category-bar bg-${event.color}`} />
      <div className="flex justify-between items-start mb-6">
        <div className={`w-12 h-12 glass-card rounded-2xl flex items-center justify-center text-${event.color}`}>
          <span className="material-symbols-outlined">{event.icon}</span>
        </div>
        {onDelete && (
          <button
            onClick={() => onDelete(event.id)}
            className="w-8 h-8 flex items-center justify-center text-on-surface-variant hover:text-secondary transition-colors"
            aria-label={`Delete ${event.title}`}
          >
            <span className="material-symbols-outlined text-lg">delete</span>
          </button>
        )}
      </div>

      <Link to={`/events/${event.id}`}>
        <h3 className="text-xl font-bold mb-1 hover:text-primary transition-colors">
          {event.title}
        </h3>
      </Link>
      <p className="text-xs text-on-surface-variant mb-4">{event.location}</p>

      <div className="flex items-end gap-1">
        <span className="monospaced-timer text-3xl font-bold text-on-surface">
          {isPast ? '—' : String(days).padStart(2, '0')}
        </span>
        <span className="text-xs text-on-surface-variant mb-1 uppercase">
          {isPast ? 'Completed' : 'Days To Go'}
        </span>
      </div>
    </div>
  )
}
