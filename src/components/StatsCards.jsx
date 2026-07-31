// Pure presentational component — receives all data via props
export default function StatsCards({ stats }) {
  const cards = [
    { label: 'Total Events', value: stats.total, color: 'text-primary' },
    { label: 'Completed', value: stats.completed, color: 'text-tertiary' },
    { label: 'Upcoming', value: stats.upcoming, color: 'text-secondary' }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
      {cards.map((card) => (
        <div key={card.label} className="glass-card rounded-3xl p-6 flex flex-col justify-between">
          <span className={`text-xs uppercase tracking-wide ${card.color}`}>{card.label}</span>
          <h4 className="text-4xl font-display mt-2">{card.value}</h4>
        </div>
      ))}
    </div>
  )
}
