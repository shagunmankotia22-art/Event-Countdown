import { useEvents } from '../context/EventsContext.jsx'
import EventCard from '../components/EventCard.jsx'

export default function PastEvents() {
  const { pastEvents, deleteEvent } = useEvents()

  return (
    <div>
      <h1 className="text-2xl font-display font-bold mb-6">Past Events</h1>
      {pastEvents.length === 0 ? (
        <p className="text-on-surface-variant">Nothing here yet — completed events will show up once their date passes.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pastEvents.map((event) => (
            <EventCard key={event.id} event={event} onDelete={deleteEvent} />
          ))}
        </div>
      )}
    </div>
  )
}
