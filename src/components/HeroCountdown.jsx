import { Link } from 'react-router-dom'
import { useCountdown } from '../hooks/useCountdown.js'

// Props-driven presentational component
export default function HeroCountdown({ event }) {
  const { days, hours, minutes, isPast } = useCountdown(event?.date)

  if (!event) {
    return (
      <section className="glass-card rounded-[2rem] p-12 mb-10 text-center">
        <p className="text-on-surface-variant">No upcoming events yet.</p>
        <Link to="/add" className="text-primary underline text-sm">
          Add your first event
        </Link>
      </section>
    )
  }

  return (
    <Link to={`/events/${event.id}`}>
      <section
        className="relative w-full rounded-[2.5rem] overflow-hidden mb-10 group cursor-pointer aspect-[21/9] bg-cover bg-center"
        style={{ backgroundImage: `url(${event.image})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-background/10 z-10" />
        <div className="absolute bottom-0 left-0 p-10 z-20 w-full">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-primary text-on-primary px-4 py-1 rounded-full text-xs uppercase tracking-widest font-bold">
              Next Up
            </span>
            <span className="text-white/80 text-sm drop-shadow">{event.category}</span>
          </div>
          <h2 className="font-display text-5xl md:text-6xl text-white mb-6 drop-shadow-2xl">
            {event.title}
          </h2>
          {isPast ? (
            <p className="text-tertiary font-bold">Happening now!</p>
          ) : (
            <div className="flex gap-8">
              <TimeBlock value={days} label="Days" />
              <Divider />
              <TimeBlock value={hours} label="Hours" />
              <Divider />
              <TimeBlock value={minutes} label="Mins" />
            </div>
          )}
        </div>
      </section>
    </Link>
  )
}

function TimeBlock({ value, label }) {
  return (
    <div className="flex flex-col items-center">
      <span className="monospaced-timer text-5xl font-extrabold text-primary drop-shadow-lg">
        {String(value).padStart(2, '0')}
      </span>
      <span className="text-xs text-primary/80 uppercase tracking-wide">{label}</span>
    </div>
  )
}

function Divider() {
  return <div className="text-4xl text-primary/40 py-1">:</div>
}
