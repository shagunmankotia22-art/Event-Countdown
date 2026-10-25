import { useState } from 'react'
import { useEvents } from '../context/EventsContext.jsx'
import EventCard from '../components/EventCard.jsx'

const STEP = 6
export default function PastEvents() {
  const { pastEvents, deleteEvent, archiveEvent, toggleFavorite } = useEvents()
  const [count, setCount] = useState(STEP)
  return <div className="simple-page"><div className="page-heading"><p className="eyebrow">LOOKING BACK</p><h1>Past events</h1><p className="muted">Events whose date has already passed.</p></div>
    {pastEvents.length === 0 ? <div className="empty-state"><span className="material-symbols-outlined">history</span><h3>Nothing here yet</h3><p>Events appear here once their date passes.</p></div> : <>
      <div className="event-grid">{pastEvents.slice(0, count).map((e) => <EventCard key={e.id} event={e} onDelete={deleteEvent} onArchive={archiveEvent} onFavorite={toggleFavorite} />)}</div>
      {count < pastEvents.length && <div className="pagination"><button onClick={() => setCount((c) => c + STEP)}>Load more ({pastEvents.length - count} left)</button></div>}</>}</div>
}
