// Single place for every date/time calculation in the app.
// Events store `date` as an ISO-8601 instant (UTC). Everything shown to the
// user is converted to the browser's local timezone here.

const MINUTE = 60000
const DAY = 86400000

export function toDate(value) {
  const d = value instanceof Date ? value : new Date(value)
  return Number.isNaN(d.getTime()) ? null : d
}

export const isValidDate = (value) => toDate(value) !== null

export function startOfLocalDay(value = new Date()) {
  const d = toDate(value) || new Date()
  return new Date(d.getFullYear(), d.getMonth(), d.getDate())
}

const pad = (n) => String(n).padStart(2, '0')

// "YYYY-MM-DD" in LOCAL time (not UTC) — safe for day comparisons.
export function localDateKey(value = new Date()) {
  const d = toDate(value)
  return d ? `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}` : ''
}

export const isSameLocalDay = (a, b = new Date()) => localDateKey(a) === localDateKey(b)

// Parse "YYYY-MM-DD" (e.g. from the holiday API) as a LOCAL date, not UTC midnight.
export function parseDateOnly(str) {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(String(str || ''))
  if (!m) return null
  const d = new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return Number.isNaN(d.getTime()) ? null : d
}

// <input type="datetime-local"> value <-> ISO instant
export function toLocalInputValue(iso) {
  const d = toDate(iso)
  if (!d) return ''
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}
export function fromLocalInputValue(value) {
  const d = value ? new Date(value) : null
  return d && !Number.isNaN(d.getTime()) ? d.toISOString() : null
}

export const eventStart = (event) => toDate(event?.date)

// All-day events (e.g. imported holidays) are over at the end of that local day.
export function eventEnd(event) {
  const start = eventStart(event)
  if (!start) return null
  return event.allDay ? new Date(startOfLocalDay(start).getTime() + DAY) : start
}

export function isEventPast(event, now = Date.now()) {
  const end = eventEnd(event)
  return end ? end.getTime() <= now : false
}

export function isEventToday(event, now = Date.now()) {
  const start = eventStart(event)
  return start ? isSameLocalDay(start, new Date(now)) : false
}

export function msUntilEvent(event, now = Date.now()) {
  const start = eventStart(event)
  return start ? start.getTime() - now : NaN
}

// ---- Reminders -----------------------------------------------------------
export const PRESET_REMINDERS = [
  { minutes: 1440, label: '1 day before' },
  { minutes: 60, label: '1 hour before' },
  { minutes: 10, label: '10 minutes before' }
]

export function reminderLabel(minutes) {
  const m = Number(minutes)
  if (!Number.isFinite(m) || m <= 0) return 'At start time'
  if (m % 1440 === 0) return `${m / 1440} day${m === 1440 ? '' : 's'} before`
  if (m % 60 === 0) return `${m / 60} hour${m === 60 ? '' : 's'} before`
  return `${m} minute${m === 1 ? '' : 's'} before`
}

export function reminderTime(event, minutes) {
  const start = eventStart(event)
  return start ? new Date(start.getTime() - Number(minutes) * MINUTE) : null
}

// Next reminder that has not fired yet (null if none / event already started).
export function nextReminder(event, now = Date.now()) {
  const start = eventStart(event)
  if (!start || start.getTime() <= now) return null
  const times = (event.reminders || [])
    .map((m) => ({ minutes: m, at: reminderTime(event, m) }))
    .filter((r) => r.at && r.at.getTime() > now)
    .sort((a, b) => a.at - b.at)
  return times[0] || null
}

export function normalizeOffsets(list) {
  const nums = (Array.isArray(list) ? list : []).map(Number).filter((n) => Number.isFinite(n) && n > 0 && n <= 60 * 24 * 365)
  return [...new Set(nums)].sort((a, b) => b - a)
}

// Legacy events stored a single string in `reminder` ('none' | '1440' | '60' | '10').
export function migrateLegacyReminder(event) {
  if (Array.isArray(event.reminders) && event.reminders.length) return normalizeOffsets(event.reminders)
  const legacy = Number(event.reminder)
  return Number.isFinite(legacy) && legacy > 0 ? [legacy] : []
}

// ---- Formatting ----------------------------------------------------------
export const formatDate = (value, opts = { month: 'short', day: 'numeric', year: 'numeric' }) => {
  const d = toDate(value)
  return d ? d.toLocaleDateString(undefined, opts) : '—'
}
export const formatDateTime = (value) => {
  const d = toDate(value)
  return d ? d.toLocaleString(undefined, { dateStyle: 'medium', timeStyle: 'short' }) : '—'
}
export const formatWeekday = (value) => {
  const d = toDate(value)
  return d ? d.toLocaleDateString(undefined, { weekday: 'long' }) : ''
}
export const formatEventWhen = (event) => (event?.allDay ? formatDate(event.date, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }) : formatDateTime(event?.date))

export function formatRelative(value, now = Date.now()) {
  const d = toDate(value)
  if (!d) return ''
  const diff = now - d.getTime()
  const abs = Math.abs(diff)
  const unit = abs < 60000 ? null : abs < 3600000 ? [Math.round(abs / 60000), 'min'] : abs < DAY ? [Math.round(abs / 3600000), 'hr'] : [Math.round(abs / DAY), 'day']
  if (!unit) return 'Just now'
  const text = `${unit[0]} ${unit[1]}${unit[0] === 1 || unit[1] === 'min' || unit[1] === 'hr' ? '' : 's'}`
  return diff >= 0 ? `${text} ago` : `in ${text}`
}

export function describeTimeLeft(ms) {
  if (!Number.isFinite(ms)) return ''
  if (ms <= 0) return 'now'
  const mins = Math.round(ms / MINUTE)
  if (mins < 60) return `${mins} minute${mins === 1 ? '' : 's'}`
  const hrs = Math.round(ms / 3600000)
  if (hrs < 24) return `${hrs} hour${hrs === 1 ? '' : 's'}`
  const days = Math.round(ms / DAY)
  return `${days} day${days === 1 ? '' : 's'}`
}

export const MS = { MINUTE, DAY }
