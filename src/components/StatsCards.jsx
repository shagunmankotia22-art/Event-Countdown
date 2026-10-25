export default function StatsCards({ stats, nextThirtyDays }) {
  const cards = [
    { label: 'Active events', value: stats.total, icon: 'calendar_month', tone: 'purple', note: 'Not archived' },
    { label: 'Upcoming', value: nextThirtyDays ?? stats.upcoming, icon: 'schedule', tone: 'mint', note: 'Next 30 days' },
    { label: 'Past events', value: stats.completed, icon: 'event_available', tone: 'pink', note: 'Already happened' },
    { label: 'Archived', value: stats.archived, icon: 'inventory_2', tone: 'orange', note: 'Hidden from lists' }
  ]
  return <div className="stats-grid">{cards.map((c) => <div key={c.label} className={`stat-card ${c.tone}`}><div className="stat-icon"><span className="material-symbols-outlined" aria-hidden="true">{c.icon}</span></div><div><strong>{c.value}</strong><span>{c.label}</span></div><small>{c.note}</small></div>)}</div>
}
