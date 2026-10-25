import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { CATEGORY_META } from '../data/seedEvents.js'
import ReminderPicker from '../components/ReminderPicker.jsx'
import { toLocalInputValue, fromLocalInputValue, normalizeOffsets } from '../lib/datetime.js'

const CATEGORY_OPTIONS = [...new Set([...Object.keys(CATEGORY_META), 'Education', 'Personal', 'Work', 'Family'])]

function Field({ label, error, children, htmlFor }) {
  return <div className="field"><label htmlFor={htmlFor}><span>{label}</span></label>{children}{error && <small className="error-text" role="alert">{error}</small>}</div>
}

export default function AddEvent() {
  const { id } = useParams()
  const { addEvent, updateEvent, getEventById } = useEvents()
  const { settings } = useNotifications()
  const navigate = useNavigate()
  const existing = id ? getEventById(id) : null
  const [form, setForm] = useState({ title: '', category: 'Celebration', location: '', date: '', notes: '', image: '' })
  const [reminders, setReminders] = useState(() => (id ? [] : normalizeOffsets(settings.defaultOffsets)))
  const [tasks, setTasks] = useState([])
  const [taskInput, setTaskInput] = useState('')
  const [errors, setErrors] = useState({})

  useEffect(() => {
    if (!existing) return
    setForm({ title: existing.title || '', category: existing.category || 'Celebration', location: existing.location || '', date: toLocalInputValue(existing.date), notes: existing.notes || '', image: existing.image || '' })
    setTasks(existing.tasks || [])
    setReminders(existing.reminders || [])
  }, [id, existing?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const change = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
  const addTask = () => { if (taskInput.trim()) { setTasks((p) => [...p, { id: `${Date.now()}-${p.length}`, title: taskInput.trim(), completed: false }]); setTaskInput('') } }

  const submit = (e) => {
    e.preventDefault()
    const next = {}
    if (!form.title.trim()) next.title = 'Please enter an event title.'
    if (!form.location.trim()) next.location = 'Please enter a location.'
    const iso = fromLocalInputValue(form.date)
    if (!iso) next.date = 'Choose a valid date and time.'
    setErrors(next)
    if (Object.keys(next).length) return
    const meta = CATEGORY_META[form.category] || CATEGORY_META.Celebration
    const payload = { title: form.title.trim(), category: form.category, location: form.location.trim(), notes: form.notes.trim(), date: iso, allDay: false,
      color: meta.color, icon: meta.icon, image: form.image.trim() || meta.image, tasks, reminders: normalizeOffsets(reminders) }
    if (id && existing) { updateEvent(id, { ...payload, allDay: existing.allDay && existing.date === iso ? true : false }); navigate(`/events/${id}`) }
    else { addEvent(payload); navigate('/') }
  }

  if (id && !existing) return <div className="empty-state"><span className="material-symbols-outlined">event_busy</span><h3>Event not found</h3><button className="primary-button" onClick={() => navigate('/')}>Back to dashboard</button></div>

  return <div className="form-page"><div className="page-heading"><p className="eyebrow">EVENT PLANNER</p><h1>{id ? 'Edit event' : 'Add a new event'}</h1><p className="muted">Make a plan, set a countdown, and get ready for the moment.</p></div>
    <form onSubmit={submit} className="form-card" noValidate>
      <div className="form-grid">
        <Field label="Event title" error={errors.title} htmlFor="ev-title"><input id="ev-title" name="title" value={form.title} onChange={change} placeholder="e.g. College Fest" /></Field>
        <Field label="Category" htmlFor="ev-cat"><select id="ev-cat" name="category" value={form.category} onChange={change}>{CATEGORY_OPTIONS.map((c) => <option key={c}>{c}</option>)}</select></Field>
        <Field label="Location" error={errors.location} htmlFor="ev-loc"><input id="ev-loc" name="location" value={form.location} onChange={change} placeholder="e.g. Chandigarh" /></Field>
        <Field label="Date and time (your local time)" error={errors.date} htmlFor="ev-date"><input id="ev-date" name="date" type="datetime-local" value={form.date} onChange={change} /></Field>
        <Field label="Image URL (optional)" htmlFor="ev-img"><input id="ev-img" name="image" value={form.image} onChange={change} placeholder="https://..." /></Field>
        <div className="full-field"><Field label="Description / notes" htmlFor="ev-notes"><textarea id="ev-notes" name="notes" rows="3" value={form.notes} onChange={change} placeholder="Add details for your event…" /></Field></div>
      </div>
      <div className="checklist-editor"><h3>Reminders</h3><p className="muted small">Choose when Event Countdown should notify you before this event starts.</p><ReminderPicker value={reminders} onChange={setReminders} idPrefix="add" /></div>
      <div className="checklist-editor"><div><h3>Preparation checklist</h3><p className="muted small">Add tasks you want to complete before the event.</p></div>
        <div className="task-entry"><input aria-label="New task" value={taskInput} onChange={(e) => setTaskInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addTask() } }} placeholder="Add a task…" /><button type="button" className="primary-button compact" onClick={addTask}>Add</button></div>
        {tasks.map((t) => <div className="task-edit-row" key={t.id}><label><input type="checkbox" checked={t.completed} onChange={() => setTasks((p) => p.map((x) => x.id === t.id ? { ...x, completed: !x.completed } : x))} />{t.title}</label><button type="button" onClick={() => setTasks((p) => p.filter((x) => x.id !== t.id))} aria-label={`Remove task ${t.title}`}>×</button></div>)}</div>
      <div className="form-actions"><button type="button" className="secondary-button" onClick={() => navigate(-1)}>Cancel</button><button type="submit" className="primary-button">{id ? 'Save changes' : 'Save event'}</button></div>
    </form></div>
}
