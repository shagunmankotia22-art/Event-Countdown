import { useState, useMemo } from 'react'

const FAQ = [
  ['How do I add a new event?', 'Choose “Add Event” in the sidebar. Enter a title, category, location and date, then choose reminders and optional preparation tasks.'],
  ['How do I sign in?', 'Create an account or sign in on the sign-in page. Accounts are provided by Supabase when configured (see README). Without it, Event Countdown runs in clearly-labelled local mode with no account.'],
  ['Where is my data stored?', 'Events, notifications and settings are saved in this browser’s local storage, separately for each account. Nothing is sent to a server except your sign-in. Clearing browser data removes them.'],
  ['How do reminders work?', 'Each event can have reminders (1 day, 1 hour, 10 minutes or custom). Event Countdown checks them while it is open in a browser tab and shows an in-app notification, plus a system notification if you enabled it. A completely closed browser cannot deliver reminders; missed ones appear when you reopen Event Coundown.'],
  ['Where do public holidays come from?', 'They are fetched live from the free Nager.Date API for the country and year you choose, each time you open the page, change the selection or press Refresh (nothing is stored). Some countries, including India, have no data in that service; for those Event Countdown shows a small, clearly labelled built-in list of fixed-date national holidays only. Use “Add to events” to import one.'],
  ['What does “Archive” do?', 'Archiving hides an event from the dashboard and past lists without deleting it. Restore or permanently delete it from Archived Events.'],
  ['Where does the weather come from?', 'From the free Open-Meteo API, using the event’s location. It shows current conditions, not a forecast for the event date.']
]

export default function Help() {
  const [query, setQuery] = useState('')
  const items = useMemo(() => { const q = query.trim().toLowerCase(); return q ? FAQ.filter(([a, b]) => `${a} ${b}`.toLowerCase().includes(q)) : FAQ }, [query])
  return <div className="simple-page narrow-page"><div className="page-heading"><p className="eyebrow">SUPPORT</p><h1>Help</h1></div>
    <div className="search-wrap page-search"><span className="material-symbols-outlined" aria-hidden="true">search</span><input type="search" aria-label="Search help topics" placeholder="Search help topics…" value={query} onChange={(e) => setQuery(e.target.value)} /></div>
    {items.length === 0 ? <p className="muted">No matching help topics.</p> : <div className="faq-list">{items.map(([q, a]) => <details key={q} className="panel faq"><summary>{q}</summary><p className="muted">{a}</p></details>)}</div>}</div>
}
