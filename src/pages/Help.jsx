import { useState, useMemo } from 'react'

const FAQ_ITEMS = [
  {
    q: 'How do I add a new event?',
    a: 'Click "Add Event" in the sidebar or top bar. Fill in the title, category, location, and date — the form validates required fields before saving.'
  },
  {
    q: 'Where is my data stored?',
    a: 'All events are saved in your browser\'s localStorage as JSON. Nothing is sent to a server, so clearing your browser data will remove your events.'
  },
  {
    q: 'What does "Archive" do?',
    a: 'Archiving hides an event from your Upcoming/Past lists without deleting it. You can restore or permanently delete it anytime from the Archives page.'
  },
  {
    q: 'Why do I need to log in to add an event?',
    a: 'The Add Event page is a protected route, used here to demonstrate authentication-gated routing. Any name signs you in — there\'s no real backend.'
  },
  {
    q: 'Where does the weather on an event page come from?',
    a: 'It\'s fetched live from the free Open-Meteo API based on the event\'s location, using the Fetch API with async/await.'
  }
]

// Simple working search over static FAQ content — controlled input,
// filters the list as you type.
export default function Help() {
  const [query, setQuery] = useState('')

  const filtered = useMemo(() => {
    if (!query.trim()) return FAQ_ITEMS
    const q = query.toLowerCase()
    return FAQ_ITEMS.filter(
      (item) => item.q.toLowerCase().includes(q) || item.a.toLowerCase().includes(q)
    )
  }, [query])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-display font-bold mb-6 text-on-surface">Help</h1>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search help topics..."
        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 mb-6 outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/50"
      />

      {filtered.length === 0 ? (
        <p className="text-on-surface-variant">No matching help topics.</p>
      ) : (
        <div className="space-y-4">
          {filtered.map((item, i) => (
            <div key={i} className="glass-card rounded-2xl p-5">
              <p className="font-bold text-on-surface mb-2">{item.q}</p>
              <p className="text-sm text-on-surface-variant">{item.a}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
