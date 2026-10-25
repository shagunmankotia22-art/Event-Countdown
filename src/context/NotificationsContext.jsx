import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from './AuthContext.jsx'
import { useEvents } from './EventsContext.jsx'
import { useLocalStorage } from '../hooks/useLocalStorage.js'
import { scopedKey, readJSON, writeJSON } from '../lib/storage.js'
import { DEFAULT_SETTINGS, evaluateEvents, evaluateHolidays, isObsolete } from '../lib/notificationRules.js'
import { loadHolidays, countryName, isAbort } from '../lib/holidays.js'
import { normalizeOffsets } from '../lib/datetime.js'

const Ctx = createContext(null)
const KEYS = { items: 'event-countdown:notifications', settings: 'event-countdown:notification-settings', fired: 'event-countdown:notification-fired' }
const MAX_ITEMS = 200
const SCAN_MS = 20000

const browserSupported = () => typeof window !== 'undefined' && 'Notification' in window
const readPermission = () => (browserSupported() ? Notification.permission : 'unsupported')

function initialSettings() {
  // Carry over the old on/off switch from the CE1/CE2 Settings page.
  const legacyOff = (() => { try { return localStorage.getItem('event-countdown:reminders') === 'off' } catch { return false } })()
  return { ...DEFAULT_SETTINGS, remindersEnabled: !legacyOff }
}

export function NotificationsProvider({ children }) {
  const { scope } = useAuth()
  const { events } = useEvents()
  const navigate = useNavigate()
  const [items, setItems] = useLocalStorage(scopedKey(KEYS.items, scope), [])
  const [stored, setStored] = useLocalStorage(scopedKey(KEYS.settings, scope), initialSettings)
  const settings = useMemo(() => ({ ...DEFAULT_SETTINGS, ...stored }), [stored])
  const [permission, setPermission] = useState(readPermission)
  const [toasts, setToasts] = useState([])

  // "Already notified" ledger — prevents duplicates per event + reminder interval, even across reloads.
  const firedKey = scopedKey(KEYS.fired, scope)
  const firedRef = useRef(null)
  if (firedRef.current === null) firedRef.current = readJSON(firedKey, {})
  const markFired = useCallback((keys) => {
    const now = Date.now()
    keys.forEach((k) => { firedRef.current[k] = now })
    const entries = Object.entries(firedRef.current)
    if (entries.length > 1000) firedRef.current = Object.fromEntries(entries.sort((a, b) => b[1] - a[1]).slice(0, 800))
    writeJSON(firedKey, firedRef.current)
  }, [firedKey])
  const isFired = useCallback((k) => Boolean(firedRef.current[k]), [])

  const latest = useRef({})
  latest.current = { events, settings, permission, navigate }

  const deliver = useCallback((fresh) => {
    if (!fresh.length) return
    const { settings: s, permission: perm } = latest.current
    const shown = fresh.length > 3 ? [{ id: `sum-${Date.now()}`, title: `${fresh.length} new notifications`, body: 'Open the notification center to see them.', eventId: null }] : fresh.map((n) => ({ id: n.key, title: n.title, body: n.body, eventId: n.eventId }))
    setToasts((prev) => [...prev, ...shown].slice(-4))
    // OS-level notification only when the user is not looking at the app, and only for time-critical types.
    if (s.browserEnabled && perm === 'granted' && browserSupported() && (document.visibilityState !== 'visible' || !document.hasFocus())) {
      fresh.filter((n) => n.type === 'reminder' || n.type === 'today').forEach((n) => {
        try {
          const note = new Notification(n.title, { body: n.body, tag: n.key })
          note.onclick = () => { window.focus(); latest.current.navigate(n.eventId ? `/events/${n.eventId}` : '/notifications'); note.close() }
        } catch { /* some mobile browsers only allow service-worker notifications — in-app fallback still works */ }
      })
    }
  }, [])

  const ingest = useCallback((candidates, silent = []) => {
    const fresh = candidates.filter((c) => !isFired(c.key))
    markFired([...silent, ...fresh.map((c) => c.key)])
    if (!fresh.length) return
    const created = fresh.map((c) => ({ id: c.key, key: c.key, type: c.type, title: c.title, body: c.body, createdAt: new Date().toISOString(), read: false, eventId: c.eventId || null, eventStart: c.eventStart || null }))
    setItems((prev) => { const have = new Set(prev.map((n) => n.key)); return [...created.filter((n) => !have.has(n.key)), ...prev].slice(0, MAX_ITEMS) })
    deliver(fresh)
  }, [isFired, markFired, setItems, deliver])

  const scan = useCallback(() => {
    const { events: evs, settings: s } = latest.current
    const { create, silent } = evaluateEvents(evs, s, Date.now(), isFired)
    if (create.length || silent.length) ingest(create, silent)
  }, [isFired, ingest])

  // Re-evaluate whenever events or settings change (edits recalc reminders immediately) …
  useEffect(() => { scan() }, [events, settings, scan])
  // … and on a timer / when the tab regains focus. Everything is cleaned up on unmount.
  useEffect(() => {
    const id = window.setInterval(scan, SCAN_MS)
    const onWake = () => { if (document.visibilityState === 'visible') { scan(); setPermission(readPermission()) } }
    document.addEventListener('visibilitychange', onWake)
    window.addEventListener('focus', onWake)
    return () => { window.clearInterval(id); document.removeEventListener('visibilitychange', onWake); window.removeEventListener('focus', onWake) }
  }, [scan])

  // Remove notifications whose event was deleted / rescheduled / fully prepared.
  useEffect(() => {
    const byId = new Map(events.map((e) => [e.id, e]))
    setItems((prev) => { const next = prev.filter((n) => !isObsolete(n, byId)); return next.length === prev.length ? prev : next })
  }, [events, setItems])

  // Public-holiday heads-up. Makes its own request (no stored copy); shared with other components if they load at the same moment.
  useEffect(() => {
    if (!settings.notifyHolidays) return undefined
    const controller = new AbortController()
    const run = async () => {
      try {
        const country = settings.holidayCountry
        const { holidays } = await loadHolidays(country, new Date().getFullYear(), { signal: controller.signal })
        const found = evaluateHolidays(holidays, countryName(country), latest.current.settings, Date.now(), isFired)
        if (found.length) ingest(found)
      } catch (err) { if (!isAbort(err)) { /* offline / no data / API down: no holiday notifications this round, nothing is invented */ } }
    }
    run()
    const id = window.setInterval(run, 6 * 60 * 60 * 1000)
    return () => { controller.abort(); window.clearInterval(id) }
  }, [settings.notifyHolidays, settings.holidayCountry, isFired, ingest])

  // ---- actions ----
  const markRead = useCallback((id, read = true) => setItems((p) => p.map((n) => (n.id === id ? { ...n, read } : n))), [setItems])
  const markAllRead = useCallback(() => setItems((p) => p.map((n) => (n.read ? n : { ...n, read: true }))), [setItems])
  const remove = useCallback((id) => setItems((p) => p.filter((n) => n.id !== id)), [setItems])
  const clearRead = useCallback(() => setItems((p) => p.filter((n) => !n.read)), [setItems])
  const clearAll = useCallback(() => setItems([]), [setItems])
  const updateSettings = useCallback((patch) => setStored((p) => ({ ...DEFAULT_SETTINGS, ...p, ...patch })), [setStored])
  const toggleDefaultOffset = useCallback((minutes) => setStored((p) => {
    const cur = normalizeOffsets({ ...DEFAULT_SETTINGS, ...p }.defaultOffsets)
    return { ...DEFAULT_SETTINGS, ...p, defaultOffsets: cur.includes(minutes) ? cur.filter((m) => m !== minutes) : normalizeOffsets([...cur, minutes]) }
  }), [setStored])

  const openNotification = useCallback((n) => {
    markRead(n.id)
    if (n.type === 'holiday') navigate('/holidays')
    else if (n.eventId) navigate(`/events/${n.eventId}`)
  }, [markRead, navigate])

  // Permission is only requested from an explicit click (Settings), never on page load.
  const requestBrowserPermission = useCallback(async () => {
    if (!browserSupported()) { setPermission('unsupported'); return 'unsupported' }
    if (Notification.permission === 'denied') { setPermission('denied'); return 'denied' }
    let result = Notification.permission
    if (result === 'default') {
      try { result = await Notification.requestPermission() } catch { result = Notification.permission }
    }
    setPermission(result)
    updateSettings({ browserEnabled: result === 'granted' })
    return result
  }, [updateSettings])

  const sendTest = useCallback(() => {
    const n = { key: `test-${Date.now()}`, type: 'reminder', title: 'Test notification', body: 'Notifications are working on this device.', eventId: null }
    setToasts((prev) => [...prev, { id: n.key, title: n.title, body: n.body, eventId: null }].slice(-4))
    if (browserSupported() && Notification.permission === 'granted') { try { new Notification(n.title, { body: n.body }) } catch { /* in-app toast already shown */ } }
  }, [])

  const dismissToast = useCallback((id) => setToasts((p) => p.filter((t) => t.id !== id)), [])
  const unreadCount = useMemo(() => items.reduce((c, n) => c + (n.read ? 0 : 1), 0), [items])

  const value = { notifications: items, unreadCount, settings, permission, browserSupported: browserSupported(), markRead, markAllRead, remove, clearRead, clearAll,
    updateSettings, toggleDefaultOffset, openNotification, requestBrowserPermission, sendTest, toasts, dismissToast }
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>
}

export function useNotifications() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useNotifications must be used within NotificationsProvider')
  return ctx
}
