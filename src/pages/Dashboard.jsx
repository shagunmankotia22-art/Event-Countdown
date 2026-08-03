import { useEvents } from '../context/EventsContext.jsx'
import HeroCountdown from '../components/HeroCountdown.jsx'
import EventCard from '../components/EventCard.jsx'
import StatsCards from '../components/StatsCards.jsx'
import MilestoneList from '../components/MilestoneList.jsx'
import CalendarWidget from '../components/CalendarWidget.jsx'
import SyncPromo from '../components/SyncPromo.jsx'

export default function Dashboard() {
  const { upcomingEvents, stats, deleteEvent, archiveEvent } = useEvents()
  const [heroEvent, ...restEvents] = upcomingEvents

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2">
        <HeroCountdown event={heroEvent} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restEvents.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onDelete={deleteEvent}
              onArchive={archiveEvent}
            />
          ))}
        </div>

        <StatsCards stats={stats} />
      </div>

      <aside className="h-fit">
        <CalendarWidget />
        <div className="glass-card rounded-[2rem] p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-on-surface">Upcoming Milestones</h3>
            <span className="bg-surface-variant/50 px-3 py-1 rounded-full text-xs text-on-surface-variant">
              Next 30 Days
            </span>
          </div>
          <MilestoneList
            events={upcomingEvents.filter(
              (e) => new Date(e.date) - Date.now() <= 30 * 86400000
            )}
          />
        </div>
        <SyncPromo />
      </aside>
    </div>
  )
}
