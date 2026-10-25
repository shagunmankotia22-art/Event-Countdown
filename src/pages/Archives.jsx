import { useState } from 'react'
import { useEvents } from '../context/EventsContext.jsx'
import { formatDate } from '../lib/datetime.js'

const STEP = 8
export default function Archives() {
  const { archivedEvents, unarchiveEvent, deleteEvent } = useEvents()
  const [count, setCount] = useState(STEP)
  return <div className="simple-page narrow-page wide"><div className="page-heading"><p className="eyebrow">OUT OF SIGHT</p><h1>Archived events</h1><p className="muted">Archived events are hidden from your lists but not deleted.</p></div>
    {archivedEvents.length === 0 ? <div className="empty-state"><span className="material-symbols-outlined">inventory_2</span><h3>Nothing archived yet</h3><p>Use the archive button on any event card.</p></div> : <>
      <ul className="panel flush archive-list">{archivedEvents.slice(0, count).map((e) => <li key={e.id} className="archive-item"><span className="archive-bar" /><div className="archive-info"><strong>{e.title}</strong><small className="muted block">{e.location} · {formatDate(e.date)}</small></div><div className="button-row"><button className="secondary-button compact" onClick={() => unarchiveEvent(e.id)}>Restore</button><button className="danger-button compact" onClick={() => { if (window.confirm(`Permanently delete “${e.title}”?`)) deleteEvent(e.id) }}>Delete</button></div></li>)}</ul>
      {count < archivedEvents.length && <div className="pagination"><button onClick={() => setCount((c) => c + STEP)}>Load more ({archivedEvents.length - count} left)</button></div>}</>}</div>
}
