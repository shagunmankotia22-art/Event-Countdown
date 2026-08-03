import { useEvents } from '../context/EventsContext.jsx'

// Lists events the user has archived (soft-hidden from Upcoming/Past),
// with a working Restore action.
export default function Archives() {
  const { archivedEvents, unarchiveEvent, deleteEvent } = useEvents()

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6 text-on-surface">Archives</h1>

      {archivedEvents.length === 0 ? (
        <p className="text-on-surface-variant">
          Nothing archived yet. Use the ⋮ menu on any event card to archive it.
        </p>
      ) : (
        <div className="space-y-3">
          {archivedEvents.map((event) => (
            <div
              key={event.id}
              className="glass-card rounded-2xl p-4 flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <span className={`w-2 h-10 bg-${event.color} rounded-full`} />
                <div>
                  <p className="font-bold text-on-surface">{event.title}</p>
                  <p className="text-xs text-on-surface-variant">
                    {event.location} · {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => unarchiveEvent(event.id)}
                  className="px-4 py-2 rounded-full border border-white/20 text-xs text-on-surface"
                >
                  Restore
                </button>
                <button
                  onClick={() => deleteEvent(event.id)}
                  className="px-4 py-2 rounded-full bg-secondary/20 text-secondary text-xs font-bold"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
