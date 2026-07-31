import { NavLink } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'

const links = [
  { to: '/', label: 'Upcoming', icon: 'event', end: true },
  { to: '/past', label: 'Past Events', icon: 'history' },
  { to: '/add', label: 'Add Event', icon: 'add_circle' }
]

const demoLinks = [
  { to: '/demos/counter', label: 'Counter Demo', icon: 'exposure' },
  { to: '/demos/todo', label: 'To-Do Demo', icon: 'checklist' }
]

export default function Sidebar() {
  const { stats } = useEvents()

  return (
    <aside className="fixed left-0 hidden lg:flex flex-col p-6 space-y-4 h-[calc(100vh-6rem)] w-72 top-24 rounded-r-xl bg-surface-container-high shadow-2xl z-40">
      <div className="mb-6 p-4 bg-surface-container-highest rounded-xl flex items-center gap-4">
        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
          <span className="material-symbols-outlined">account_circle</span>
        </div>
        <div>
          <h3 className="font-bold text-on-surface">Alex Morgan</h3>
          <p className="text-xs text-tertiary">{stats.total} Events tracked</p>
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
      </nav>

      <div className="pt-4 border-t border-on-surface/5">
        <p className="text-xs uppercase text-on-surface-variant mb-2 px-4">Demos</p>
        <nav className="space-y-1">
          {demoLinks.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-4 p-3 rounded-r-full text-sm transition-all ${
                  isActive
                    ? 'bg-tertiary-container text-on-tertiary font-bold'
                    : 'text-on-surface-variant hover:bg-surface-variant/50 hover:pl-5'
                }`
              }
            >
              <span className="material-symbols-outlined text-lg">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto pt-6 border-t border-on-surface/5">
        <div className="glass-card rounded-xl p-4">
          <p className="text-xs text-primary mb-2 uppercase tracking-wide">
            Live Summary
          </p>
          <p className="text-xs text-on-surface-variant">
            {stats.upcoming} upcoming · {stats.completed} completed
          </p>
        </div>
      </div>
    </aside>
  )
}
