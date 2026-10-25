import { Link, useNavigate } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown.js'
import { formatDate, isEventToday, isEventPast } from '../lib/datetime.js'

export default function EventCard({ event, onDelete, onArchive, onFavorite }) {
  const { days, hours, minutes } = useCountdown(event.date)
  const navigate = useNavigate()
  const past = isEventPast(event)
  const today = !past && isEventToday(event)
  const tasks = event.tasks || []
  const done = tasks.filter((t) => t.completed).length
  const pad = (n) => String(n).padStart(2, '0')
  return <article className="event-card">
    <div className="event-image-wrap"><Link to={`/events/${event.id}`} aria-label={`Open ${event.title}`}><img src={event.image || 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=800'} alt="" className="event-image" loading="lazy" /></Link><span className="category-pill">{event.category}</span><button className={`favorite-button ${event.favorite ? 'favorited' : ''}`} onClick={() => onFavorite?.(event.id)} aria-label={event.favorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={Boolean(event.favorite)}><span className="material-symbols-outlined">{event.favorite ? 'favorite' : 'favorite_border'}</span></button></div>
    <div className="event-card-body"><Link to={`/events/${event.id}`} className="event-title">{event.title}</Link>
      <div className="event-meta"><span><span className="material-symbols-outlined" aria-hidden="true">location_on</span>{event.location || 'Location not set'}</span><span><span className="material-symbols-outlined" aria-hidden="true">calendar_month</span>{formatDate(event.date)}</span></div>
      {today && event.allDay ? <div className="today-banner"><span className="material-symbols-outlined">today</span>Today</div> :
        <div className="countdown-row"><div><strong>{past ? '—' : pad(days)}</strong><small>{past ? 'Past' : 'Days'}</small></div><div><strong>{past ? '—' : pad(hours)}</strong><small>Hours</small></div><div><strong>{past ? '—' : pad(minutes)}</strong><small>Mins</small></div></div>}
      <div className="event-card-footer"><span className="task-summary"><span className="material-symbols-outlined" aria-hidden="true">checklist</span>{done}/{tasks.length} tasks</span>
        <div className="card-actions"><button onClick={() => navigate(`/add/${event.id}`)} aria-label="Edit event"><span className="material-symbols-outlined">edit</span></button>{onArchive && <button onClick={() => onArchive(event.id)} aria-label="Archive event"><span className="material-symbols-outlined">archive</span></button>}{onDelete && <button onClick={() => { if (window.confirm(`Delete “${event.title}”?`)) onDelete(event.id) }} aria-label="Delete event"><span className="material-symbols-outlined">delete</span></button>}</div></div>
    </div>
  </article>
}
