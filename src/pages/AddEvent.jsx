import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'

const CATEGORY_OPTIONS = [
  { value: 'Concert', color: 'primary', icon: 'music_note' },
  { value: 'Travel', color: 'tertiary', icon: 'flight_takeoff' },
  { value: 'Celebration', color: 'secondary', icon: 'cake' },
  { value: 'Conference', color: 'primary', icon: 'campaign' }
]

const initialForm = {
  title: '',
  category: CATEGORY_OPTIONS[0].value,
  location: '',
  date: '',
  notes: ''
}

export default function AddEvent() {
  const { addEvent } = useEvents()
  const navigate = useNavigate()
  const [form, setForm] = useState(initialForm)
  const [errors, setErrors] = useState({})

  // Single controlled-input handler shared by all fields
  const handleChange = useCallback((e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }, [])

  const validate = () => {
    const newErrors = {}
    if (!form.title.trim()) newErrors.title = 'Title is required.'
    if (!form.location.trim()) newErrors.location = 'Location is required.'
    if (!form.date) newErrors.date = 'Date is required.'
    else if (new Date(form.date).toString() === 'Invalid Date') {
      newErrors.date = 'Enter a valid date.'
    }
    return newErrors
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    const validationErrors = validate()
    setErrors(validationErrors)
    if (Object.keys(validationErrors).length > 0) return

    const meta = CATEGORY_OPTIONS.find((c) => c.value === form.category)
    addEvent({
      title: form.title.trim(),
      category: form.category,
      location: form.location.trim(),
      date: new Date(form.date).toISOString(),
      notes: form.notes.trim(),
      color: meta.color,
      icon: meta.icon
    })

    setForm(initialForm)
    navigate('/')
  }

  return (
    <div className="glass-card rounded-[2rem] p-10 max-w-xl">
      <h1 className="text-2xl font-display font-bold mb-6">Add a New Event</h1>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Event Title" error={errors.title}>
          <input
            name="title"
            type="text"
            value={form.title}
            onChange={handleChange}
            className="input"
            placeholder="e.g. Product Launch"
          />
        </Field>

        <Field label="Category">
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="input"
          >
            {CATEGORY_OPTIONS.map((c) => (
              <option key={c.value} value={c.value}>{c.value}</option>
            ))}
          </select>
        </Field>

        <Field label="Location" error={errors.location}>
          <input
            name="location"
            type="text"
            value={form.location}
            onChange={handleChange}
            className="input"
            placeholder="e.g. San Francisco"
          />
        </Field>

        <Field label="Date & Time" error={errors.date}>
          <input
            name="date"
            type="datetime-local"
            value={form.date}
            onChange={handleChange}
            className="input"
          />
        </Field>

        <Field label="Notes (optional)">
          <textarea
            name="notes"
            value={form.notes}
            onChange={handleChange}
            className="input"
            rows={3}
          />
        </Field>

        <button
          type="submit"
          className="bg-primary text-on-primary px-6 py-3 rounded-full font-bold text-sm hover:shadow-[0_0_15px_rgba(192,193,255,0.4)] transition-all"
        >
          Save Event
        </button>
      </form>

      <style>{`
        .input {
          width: 100%;
          background: rgba(255,255,255,0.05);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 0.75rem;
          padding: 0.75rem 1rem;
          color: #dae2fd;
          outline: none;
        }
        .input::placeholder {
          color: rgba(218, 226, 253, 0.4);
        }
        .input:focus {
          border-color: #c0c1ff;
        }
      `}</style>
    </div>
  )
}

function Field({ label, error, children }) {
  return (
    <label className="block">
      <span className="block text-xs uppercase text-on-surface-variant mb-2">{label}</span>
      {children}
      {error && <span className="block text-xs text-secondary mt-1">{error}</span>}
    </label>
  )
}
