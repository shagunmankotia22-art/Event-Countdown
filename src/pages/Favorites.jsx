import { useEvents } from '../context/EventsContext.jsx'
import EventCard from '../components/EventCard.jsx'
export default function Favorites() {
  const { favoriteEvents, toggleFavorite, deleteEvent, archiveEvent } = useEvents()
  return <div className="simple-page"><div className="page-heading"><p className="eyebrow">YOUR SHORTLIST</p><h1>Favorite events <span className="pink-text">♥</span></h1><p className="muted">The moments you want to keep close.</p></div>{favoriteEvents.length ? <div className="event-grid">{favoriteEvents.map((event) => <EventCard key={event.id} event={event} onFavorite={toggleFavorite} onDelete={deleteEvent} onArchive={archiveEvent} />)}</div> : <div className="empty-state"><span className="material-symbols-outlined">favorite_border</span><h3>No favorites yet</h3><p>Tap the heart on any event card to add it here.</p></div>}</div>
}
