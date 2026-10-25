import { useEffect, useState } from 'react'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { useEvents } from '../context/EventsContext.jsx'
import { PRESET_REMINDERS, normalizeOffsets } from '../lib/datetime.js'
import ReminderPicker from '../components/ReminderPicker.jsx'
import { downloadICS } from '../lib/ics.js'

function Toggle({ checked, onChange, label, hint, id }) {
  return <label className="toggle-row" htmlFor={id}><span><strong>{label}</strong>{hint && <small className="muted block">{hint}</small>}</span><span className="switch"><input id={id} type="checkbox" role="switch" checked={checked} onChange={(e) => onChange(e.target.checked)} /><i /></span></label>
}

export default function Settings() {
  const { settings, updateSettings, permission, browserSupported, requestBrowserPermission, sendTest } = useNotifications()
  const { activeEvents } = useEvents()
  const [theme, setTheme] = useState(() => localStorage.getItem('event-countdown:theme') || 'light')
  const [busy, setBusy] = useState(false)
  useEffect(() => { document.documentElement.classList.toggle('dark', theme === 'dark'); localStorage.setItem('event-countdown:theme', theme) }, [theme])
  const enableBrowser = async () => { setBusy(true); await requestBrowserPermission(); setBusy(false) }

  return <div className="simple-page narrow-page wide"><div className="page-heading"><p className="eyebrow">MAKE IT YOURS</p><h1>Settings</h1><p className="muted">Appearance, reminders and notifications.</p></div>
    <section className="panel settings-panel"><div className="setting-row"><div><h3>Appearance</h3><p className="muted small">Switch between a bright and dark interface.</p></div><div className="theme-options"><button className={theme === 'light' ? 'selected' : ''} onClick={() => setTheme('light')}><span className="material-symbols-outlined">light_mode</span>Light</button><button className={theme === 'dark' ? 'selected' : ''} onClick={() => setTheme('dark')}><span className="material-symbols-outlined">dark_mode</span>Dark</button></div></div></section>

    <h2 className="section-title">Reminders</h2>
    <section className="panel settings-panel">
      <Toggle id="s-rem" checked={settings.remindersEnabled} onChange={(v) => updateSettings({ remindersEnabled: v })} label="Event reminders" hint="Turn all before-event reminders on or off." />
      <div className="setting-block"><h3>Default reminders for new events</h3><p className="muted small">Each event can override these when you create or edit it.</p>
        <ReminderPicker value={settings.defaultOffsets} onChange={(v) => updateSettings({ defaultOffsets: normalizeOffsets(v) })} idPrefix="def" />
        <p className="muted tiny">Presets: {PRESET_REMINDERS.map((p) => p.label).join(' · ')}. Changing defaults does not alter existing events.</p></div>
      <Toggle id="s-today" checked={settings.notifyToday} onChange={(v) => updateSettings({ notifyToday: v })} label="Events happening today" />
      <Toggle id="s-up" checked={settings.notifyUpcoming} onChange={(v) => updateSettings({ notifyUpcoming: v })} label="Upcoming events" hint={`Heads-up when an event is within ${settings.upcomingDays} days.`} />
      <Toggle id="s-task" checked={settings.notifyTasks} onChange={(v) => updateSettings({ notifyTasks: v })} label="Unfinished preparation tasks" hint="At most one nudge per event per day." />
      <Toggle id="s-hol" checked={settings.notifyHolidays} onChange={(v) => updateSettings({ notifyHolidays: v })} label="Public holiday announcements" hint={`For ${settings.holidayCountry} (change the country on the Public Holidays page).`} />
    </section>

    <h2 className="section-title">Browser notifications</h2>
    <section className="panel settings-panel"><div className="setting-block">
      <h3>Desktop alerts</h3>
      <p className="muted small">Event Countdown can show a system notification when a reminder is due while this tab is in the background. We only ask for permission when you press the button below.</p>
      {!browserSupported && <div className="notice-box warn"><span className="material-symbols-outlined">block</span><p>This browser doesn't support the Notifications API. Reminders will still appear inside Event Countdown.</p></div>}
      {browserSupported && permission === 'denied' && <div className="notice-box error"><span className="material-symbols-outlined">block</span><p>Notifications are blocked for this site. To enable them, allow notifications in your browser's site settings, then reload. Reminders still appear inside Event Countdown.</p></div>}
      {browserSupported && permission === 'granted' && <Toggle id="s-browser" checked={settings.browserEnabled} onChange={(v) => updateSettings({ browserEnabled: v })} label="Show system notifications" hint="Permission granted." />}
      <div className="button-row">
        {browserSupported && permission === 'default' && <button className="primary-button" onClick={enableBrowser} disabled={busy}><span className="material-symbols-outlined">notifications_active</span>Enable browser notifications</button>}
        <button className="secondary-button" onClick={sendTest}>Send test notification</button>
      </div>
      <div className="notice-box"><span className="material-symbols-outlined">info</span><p><b>Limitations:</b> reminders are checked by a timer while Event Countdown is open in a browser tab (even in the background). If the browser or tab is completely closed — or a phone puts the tab to sleep — nothing can fire. Missed reminders show up the next time you open Event Countdown. Reliable background delivery would need a service worker with a push service and a server job, which this local app doesn't have.</p></div>
    </div></section>

    <h2 className="section-title">Data</h2>
    <section className="panel settings-panel"><div className="setting-row"><div><h3>Export events</h3><p className="muted small">Download all active events as an .ics file for Google, Outlook or Apple Calendar.</p></div><button className="secondary-button" onClick={() => downloadICS(activeEvents)} disabled={!activeEvents.length}><span className="material-symbols-outlined">download</span>Export .ics</button></div>
      <div className="notice-box"><span className="material-symbols-outlined">info</span><p>Events, notifications and settings are stored in this browser's local storage, separately for each signed-in account. Clearing browser data removes them.</p></div></section>
  </div>
}
