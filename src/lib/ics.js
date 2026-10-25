// Builds an .ics calendar file (RFC 5545 subset) from events and downloads it.
const toICS = (iso) => new Date(iso).toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z'
const esc = (s = '') => String(s).replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;')

export function buildICS(events) {
  const lines = ['BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Event Countdown//EN']
  events.forEach((e) => {
    lines.push('BEGIN:VEVENT', `UID:${e.id}@evently`, `DTSTAMP:${toICS(new Date().toISOString())}`, `DTSTART:${toICS(e.date)}`,
      `SUMMARY:${esc(e.title)}`, `LOCATION:${esc(e.location)}`, `DESCRIPTION:${esc(e.notes)}`, 'END:VEVENT')
  })
  lines.push('END:VCALENDAR')
  return lines.join('\r\n')
}

export function downloadICS(events, filename = 'evently-events.ics') {
  const url = URL.createObjectURL(new Blob([buildICS(events)], { type: 'text/calendar' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: filename })
  document.body.appendChild(a); a.click(); a.remove(); URL.revokeObjectURL(url)
}
