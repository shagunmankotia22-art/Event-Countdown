import { useEvents } from '../context/EventsContext.jsx'
import HeroCountdown from '../components/HeroCountdown.jsx'
import EventCard from '../components/EventCard.jsx'
import StatsCards from '../components/StatsCards.jsx'
import MilestoneList from '../components/MilestoneList.jsx'

export default function Dashboard() {
  const { upcomingEvents, stats, deleteEvent } = useEvents()
  const [heroEvent, ...restEvents] = upcomingEvents

  return (
    <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
      <div className="xl:col-span-2">
        <HeroCountdown event={heroEvent} />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {restEvents.map((event) => (
            <EventCard key={event.id} event={event} onDelete={deleteEvent} />
          ))}
        </div>

        <StatsCards stats={stats} />
      </div>

      <aside className="glass-card rounded-[2rem] p-6 h-fit">
        <h3 className="text-lg font-bold mb-4">Upcoming Milestones</h3>
        <MilestoneList events={upcomingEvents} />
      </aside>
    </div>
  )
}
