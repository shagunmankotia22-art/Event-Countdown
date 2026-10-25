import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'
import { useCountdown } from '../hooks/useCountdown.js'
import { useWeather } from '../hooks/useWeather.js'
import ReminderPicker from '../components/ReminderPicker.jsx'
import { formatEventWhen, nextReminder, formatDateTime, isEventPast, normalizeOffsets } from '../lib/datetime.js'

export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, updateEvent, deleteEvent, archiveEvent, toggleFavorite } = useEvents()
  const event = getEventById(id)
  const { days, hours, minutes, isPast } = useCountdown(event?.date)
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(event?.location)
  const [taskText, setTaskText] = useState('')
  const [shareMessage, setShareMessage] = useState('')
  const [editReminders, setEditReminders] = useState(false)
  if (!event) return <div className="empty-state"><span className="material-symbols-outlined">event_busy</span><h3>Event not found</h3><p>It may have been deleted or belongs to another account.</p><Link to="/" className="primary-button">Back to dashboard</Link></div>

  const tasks = event.tasks || []
  const completed = tasks.filter((t) => t.completed).length
  const past = isEventPast(event)
  const upcoming = nextReminder(event)
  const addTask = (e) => { e.preventDefault(); if (!taskText.trim()) return; updateEvent(id, { tasks: [...tasks, { id: `${Date.now()}`, title: taskText.trim(), completed: false }] }); setTaskText('') }
  const toggleTask = (tid) => updateEvent(id, { tasks: tasks.map((t) => t.id === tid ? { ...t, completed: !t.completed } : t) })
  const removeTask = (tid) => updateEvent(id, { tasks: tasks.filter((t) => t.id !== tid) })
  const flash = (m) => { setShareMessage(m); setTimeout(() => setShareMessage(''), 2500) }
  const share = async () => {
    const text = `${event.title}\n${formatEventWhen(event)}\n${event.location || ''}\n${event.notes || ''}`
    try { if (navigator.share) await navigator.share({ title: event.title, text }); else { await navigator.clipboard.writeText(text); flash('Event details copied to clipboard.') } } catch { flash('Sharing was cancelled or unavailable.') }
  }
  const addToCalendar = () => {
    const start = new Date(event.date); const end = new Date(start.getTime() + 3600000)
    const fmt = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}Z$/, 'Z')
    window.open(`https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(event.title)}&dates=${fmt(start)}/${fmt(end)}&details=${encodeURIComponent(event.notes || '')}&location=${encodeURIComponent(event.location || '')}`, '_blank', 'noopener,noreferrer')
  }

  return <div className="detail-page"><Link to="/" className="back-link"><span className="material-symbols-outlined">arrow_back</span>Back to dashboard</Link>
    <div className="detail-layout"><main className="detail-main panel">{event.image && <img className="detail-hero-image" src={event.image} alt="" />}
      <div className="detail-content"><div className="detail-title-row"><span className="category-pill static-pill">{event.category}</span><button className={`favorite-button ${event.favorite ? 'favorited' : ''}`} onClick={() => toggleFavorite(id)} aria-label={event.favorite ? 'Remove from favorites' : 'Add to favorites'} aria-pressed={Boolean(event.favorite)}><span className="material-symbols-outlined">{event.favorite ? 'favorite' : 'favorite_border'}</span></button></div>
        <h1>{event.title}</h1><p className="muted">{event.location} · {formatEventWhen(event)}</p>{event.notes && <p className="detail-notes">{event.notes}</p>}
        <div className="detail-countdown"><div><strong>{isPast ? '—' : days}</strong><span>Days</span></div><div><strong>{isPast ? '—' : hours}</strong><span>Hours</span></div><div><strong>{isPast ? '—' : minutes}</strong><span>Minutes</span></div></div>
        <div className="detail-actions"><button className="primary-button" onClick={() => navigate(`/add/${id}`)}><span className="material-symbols-outlined">edit</span>Edit event</button><button className="secondary-button" onClick={addToCalendar}><span className="material-symbols-outlined">event</span>Add to Google Calendar</button><button className="secondary-button" onClick={share}><span className="material-symbols-outlined">share</span>Share</button></div>
        {shareMessage && <p className="success-text" role="status">{shareMessage}</p>}
        <section className="weather-box"><h3><span className="material-symbols-outlined">cloud</span>Weather for {event.location || 'your event'}</h3>{weatherLoading && <p className="muted small">Loading weather…</p>}{weatherError && <p className="muted small">Weather is currently unavailable: {weatherError}</p>}{weather && <p>{weather.place}, {weather.country} · {weather.temperature}°C · Wind {weather.windspeed} km/h</p>}<small className="muted">Weather data may describe current conditions rather than a future forecast.</small></section>
        <div className="detail-actions lower-actions"><button className="secondary-button" onClick={() => { archiveEvent(id); navigate('/') }}>Archive event</button><button className="danger-button" onClick={() => { if (window.confirm(`Delete “${event.title}”?`)) { deleteEvent(id); navigate('/') } }}>Delete event</button></div></div></main>
      <aside className="panel checklist-panel"><div className="checklist-head"><div><h2>Preparation checklist</h2><p className="muted small">{completed} of {tasks.length} completed</p></div><strong>{tasks.length ? Math.round(completed / tasks.length * 100) : 0}%</strong></div>
        <div className="progress-track" role="progressbar" aria-valuemin="0" aria-valuemax="100" aria-valuenow={tasks.length ? Math.round(completed / tasks.length * 100) : 0}><span style={{ width: `${tasks.length ? completed / tasks.length * 100 : 0}%` }} /></div>
        <form className="task-entry" onSubmit={addTask}><input value={taskText} onChange={(e) => setTaskText(e.target.value)} placeholder="Add a task…" aria-label="New task" /><button className="primary-button compact">Add</button></form>
        {tasks.length ? tasks.map((t) => <div className="checklist-task" key={t.id}><label><input type="checkbox" checked={Boolean(t.completed)} onChange={() => toggleTask(t.id)} /><span className={t.completed ? 'completed-task' : ''}>{t.title}</span></label><button onClick={() => removeTask(t.id)} aria-label={`Delete task ${t.title}`}>×</button></div>) : <p className="muted small checklist-empty">Add a few tasks to prepare for your event.</p>}
        <div className="reminder-card block"><div className="reminder-head"><h3><span className="material-symbols-outlined">notifications_active</span>Reminders</h3><button onClick={() => setEditReminders((v) => !v)}>{editReminders ? 'Done' : 'Edit'}</button></div>
          {editReminders ? <ReminderPicker value={event.reminders} onChange={(v) => updateEvent(id, { reminders: normalizeOffsets(v) })} idPrefix="det" />
            : <p className="muted small">{past ? 'This event has passed — reminders are inactive.' : upcoming ? `Next reminder: ${formatDateTime(upcoming.at)}` : event.reminders.length ? 'All reminders for this event have already been sent.' : 'No reminders set.'}</p>}</div>
        <p className="muted tiny">Reminders appear in Event Countdown while it is open in a browser tab. A closed browser cannot deliver them.</p></aside></div></div>
}
