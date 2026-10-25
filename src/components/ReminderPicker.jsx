import { useState } from 'react'
import { PRESET_REMINDERS, reminderLabel, normalizeOffsets } from '../lib/datetime.js'

// Pick which reminders an event has: presets + custom timing. `value` is a list of minutes-before.
export default function ReminderPicker({ value, onChange, idPrefix = 'rem' }) {
  const [amount, setAmount] = useState('30')
  const [unit, setUnit] = useState('1')
  const [error, setError] = useState('')
  const selected = normalizeOffsets(value)
  const presetMinutes = PRESET_REMINDERS.map((p) => p.minutes)
  const customs = selected.filter((m) => !presetMinutes.includes(m))
  const toggle = (m) => onChange(selected.includes(m) ? selected.filter((x) => x !== m) : normalizeOffsets([...selected, m]))
  const addCustom = () => {
    const minutes = Math.round(Number(amount) * Number(unit))
    if (!Number.isFinite(minutes) || minutes < 1) return setError('Enter a number greater than zero.')
    if (minutes > 60 * 24 * 365) return setError('Choose a time within one year.')
    setError('')
    onChange(normalizeOffsets([...selected, minutes]))
  }
  return <div className="reminder-picker">
    <div className="chip-row" role="group" aria-label="Reminder times">
      {[...PRESET_REMINDERS, ...customs.map((m) => ({ minutes: m, label: reminderLabel(m) }))].map((p) => {
        const on = selected.includes(p.minutes)
        return <button type="button" key={p.minutes} className={`choice-chip ${on ? 'on' : ''}`} aria-pressed={on} onClick={() => toggle(p.minutes)}><span className="material-symbols-outlined" aria-hidden="true">{on ? 'check' : 'add'}</span>{p.label}</button>
      })}
    </div>
    <div className="custom-reminder">
      <label htmlFor={`${idPrefix}-amt`} className="sr-only">Custom reminder amount</label>
      <input id={`${idPrefix}-amt`} type="number" min="1" value={amount} onChange={(e) => setAmount(e.target.value)} />
      <select aria-label="Custom reminder unit" value={unit} onChange={(e) => setUnit(e.target.value)}><option value="1">minutes</option><option value="60">hours</option><option value="1440">days</option></select>
      <button type="button" className="secondary-button compact" onClick={addCustom}>Add custom</button>
    </div>
    {error && <small className="error-text" role="alert">{error}</small>}
    {!selected.length && <small className="muted">No reminders — you will not be notified before this event.</small>}
  </div>
}
