import { useParams, useNavigate, Link } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'
import { useCountdown } from '../hooks/useCountdown.js'
import { useWeather } from '../hooks/useWeather.js'

// Dynamic route: reads :id from the URL via useParams
export default function EventDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { getEventById, deleteEvent, archiveEvent } = useEvents()
  const event = getEventById(id)
  const { days, hours, minutes, isPast } = useCountdown(event?.date)
  const { weather, loading: weatherLoading, error: weatherError } = useWeather(event?.location)

  if (!event) {
    return (
      <div className="glass-card rounded-3xl p-10 text-center">
        <p className="mb-4 text-on-surface">No event found with id "{id}".</p>
        <Link to="/" className="text-primary underline">Back to dashboard</Link>
      </div>
    )
  }

  const handleDelete = () => {
    deleteEvent(event.id)
    navigate('/')
  }

  const handleArchive = () => {
    archiveEvent(event.id)
    navigate('/')
  }

  return (
    <div className="glass-card rounded-[2rem] overflow-hidden max-w-2xl">
      {event.image && (
        <div className="h-56 w-full">
          <img src={event.image} alt="" className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-10">
        <span className={`inline-block px-3 py-1 rounded-full text-xs uppercase mb-4 bg-${event.color}/20 text-${event.color}`}>
          {event.category}
        </span>
        <h1 className="text-4xl font-display font-bold mb-2 text-on-surface">{event.title}</h1>
        <p className="text-on-surface-variant mb-6">{event.location}</p>

        <p className="mb-6 text-sm text-on-surface-variant">{event.notes}</p>

        <div className="mb-6 p-4 rounded-2xl bg-white/5 border border-white/10">
          <p className="text-xs uppercase text-on-surface-variant mb-2 flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">cloud</span>
            Live Weather (Fetch API demo)
          </p>
          {weatherLoading && <p className="text-sm text-on-surface-variant">Loading weather…</p>}
          {weatherError && (
            <p className="text-sm text-secondary">Couldn't load weather: {weatherError}</p>
          )}
          {weather && (
            <p className="text-sm text-on-surface">
              {weather.place}, {weather.country} — {weather.temperature}°C, wind {weather.windspeed} km/h
            </p>
          )}
        </div>

        {isPast ? (
          <p className="text-tertiary font-bold mb-6">This event has already happened.</p>
        ) : (
          <div className="flex gap-8 mb-8">
            <div className="text-center">
              <span className="monospaced-timer text-3xl font-bold text-primary">{days}</span>
              <p className="text-xs text-on-surface-variant uppercase">Days</p>
            </div>
            <div className="text-center">
              <span className="monospaced-timer text-3xl font-bold text-primary">{hours}</span>
              <p className="text-xs text-on-surface-variant uppercase">Hours</p>
            </div>
            <div className="text-center">
              <span className="monospaced-timer text-3xl font-bold text-primary">{minutes}</span>
              <p className="text-xs text-on-surface-variant uppercase">Mins</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-4">
          <Link to="/" className="px-5 py-2 rounded-full border border-on-surface/20 text-sm text-on-surface">
            Back
          </Link>
          <button
            onClick={handleArchive}
            className="px-5 py-2 rounded-full bg-primary/20 text-primary text-sm font-bold"
          >
            Archive Event
          </button>
          <button
            onClick={handleDelete}
            className="px-5 py-2 rounded-full bg-secondary/20 text-secondary text-sm font-bold"
          >
            Delete Event
          </button>
        </div>
      </div>
    </div>
  )
}
