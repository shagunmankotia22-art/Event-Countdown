import { Link } from 'react-router-dom'

// Renders a list from props — demonstrates rendering lists + conditional rendering
export default function MilestoneList({ events }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-on-surface-variant p-4">
        No milestones in this window.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      {events.map((event) => (
        <Link
          key={event.id}
          to={`/events/${event.id}`}
          className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/5 transition-colors"
        >
          <div className={`w-2 h-12 bg-${event.color} rounded-full`} />
          <div className="flex-1">
            <h4 className="text-sm font-bold text-on-surface">{event.title}</h4>
            <p className="text-xs text-on-surface-variant">
              {event.location} · {new Date(event.date).toLocaleDateString()}
            </p>
          </div>
        </Link>
      ))}
    </div>
  )
}
