import { NavLink } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'

const links = [
  { to: '/', label: 'Upcoming', icon: 'event', end: true },
  { to: '/past', label: 'Past Events', icon: 'history' },
  { to: '/categories', label: 'Categories', icon: 'category' },
  { to: '/archives', label: 'Archives', icon: 'inventory_2' },
  { to: '/help', label: 'Help', icon: 'help' }
]

export default function Sidebar() {
  const { stats, storageInfo } = useEvents()

  return (
    <aside className="fixed left-0 hidden lg:flex flex-col p-6 space-y-4 h-[calc(100vh-6rem)] w-72 top-24 rounded-r-xl bg-surface-container-high shadow-2xl z-40 overflow-y-auto">
      <div className="mb-6 p-4 bg-surface-container-highest rounded-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">account_circle</span>
        </div>
        <div>
          <h3 className="font-bold text-on-surface">Alex Morgan</h3>
          <p className="text-xs text-tertiary">Pro Member · {stats.total} Events</p>
        </div>
      </div>

      <nav className="space-y-1">
        {links.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            end={link.end}
            className={({ isActive }) =>
              `flex items-center gap-4 p-4 rounded-r-full transition-all ${
                isActive
                  ? 'bg-tertiary-container text-on-tertiary font-bold'
                  : 'text-on-surface-variant hover:bg-surface-variant/50 hover:pl-6'
              }`
            }
          >
            <span className="material-symbols-outlined">{link.icon}</span>
            <span className="text-sm">{link.label}</span>
          </NavLink>
        ))}
        <NavLink
          to="/add"
          className={({ isActive }) =>
            `flex items-center gap-4 p-4 rounded-r-full transition-all ${
              isActive
                ? 'bg-tertiary-container text-on-tertiary font-bold'
                : 'text-on-surface-variant hover:bg-surface-variant/50 hover:pl-6'
            }`
          }
        >
          <span className="material-symbols-outlined">add_circle</span>
          <span className="text-sm">Add Event</span>
        </NavLink>
      </nav>

      <div className="mt-auto pt-6 border-t border-on-surface/5">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-primary mb-2 uppercase tracking-wide">
            Storage Status
          </p>
          <div className="h-1 w-full bg-surface-container rounded-full overflow-hidden mb-2">
            <div
              className="h-full bg-primary transition-all"
              style={{ width: `${storageInfo.percentUsed}%` }}
            />
          </div>
          <p className="text-xs text-on-surface-variant">
            {storageInfo.usedKB} KB of {storageInfo.quotaMB} MB used
          </p>
        </div>
      </div>
    </aside>
  )
}
