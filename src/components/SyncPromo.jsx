import { useEvents } from '../context/EventsContext.jsx'

// Generates a real .ics calendar file from all active events and
// triggers a browser download — this actually works, unlike a
// decorative "Download App" button.
function toICSDate(isoString) {
  return new Date(isoString).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
}

function buildICS(events) {
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Event Countdown//EN'
  ]

  events.forEach((event) => {
    lines.push(
      'BEGIN:VEVENT',
      `UID:${event.id}@event-countdown`,
      `DTSTAMP:${toICSDate(new Date().toISOString())}`,
      `DTSTART:${toICSDate(event.date)}`,
      `SUMMARY:${event.title}`,
      `LOCATION:${event.location}`,
      `DESCRIPTION:${(event.notes || '').replace(/\n/g, '\\n')}`,
      'END:VEVENT'
    )
  })

  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export default function SyncPromo() {
  const { activeEvents } = useEvents()

  const handleDownload = () => {
    const icsContent = buildICS(activeEvents)
    const blob = new Blob([icsContent], { type: 'text/calendar' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'event-countdown.ics'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="relative overflow-hidden rounded-3xl p-6 bg-primary-container text-on-primary-container mt-8">
      <div className="relative z-10">
        <h4 className="text-lg font-bold mb-2">Sync Everywhere</h4>
        <p className="text-xs opacity-80 mb-4">
          Export all your events as a calendar file you can import into
          Google Calendar, Outlook, or Apple Calendar.
        </p>
        <button
          onClick={handleDownload}
          disabled={activeEvents.length === 0}
          className="bg-on-primary-container text-primary-container px-6 py-2 rounded-xl font-bold text-sm disabled:opacity-40"
        >
          Download Calendar (.ics)
        </button>
      </div>
      <span className="material-symbols-outlined absolute -right-4 -bottom-4 text-9xl opacity-10 rotate-12">
        sync
      </span>
    </div>
  )
}
