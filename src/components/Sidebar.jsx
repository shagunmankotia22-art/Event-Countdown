import { NavLink, useNavigate } from 'react-router-dom'
import { useEvents } from '../context/EventsContext.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import { useNotifications } from '../context/NotificationsContext.jsx'

const links = [
  { to: '/', label: 'Dashboard', icon: 'dashboard', end: true },
  { to: '/add', label: 'Add Event', icon: 'add' },
  { to: '/calendar', label: 'Calendar', icon: 'calendar_month' },
  { to: '/favorites', label: 'Favorites', icon: 'favorite' },
  { to: '/analytics', label: 'Analytics', icon: 'bar_chart' },
  { to: '/notifications', label: 'Notifications', icon: 'notifications', badge: true },
  { to: '/holidays', label: 'Public Holidays', icon: 'celebration' },
  { to: '/past', label: 'Past Events', icon: 'history' },
  { to: '/archives', label: 'Archived Events', icon: 'inventory_2' },
  { to: '/categories', label: 'Categories', icon: 'category' },
  { to: '/profile', label: 'Profile', icon: 'person' },
  { to: '/settings', label: 'Settings', icon: 'settings' },
  { to: '/help', label: 'Help', icon: 'help' }
]

export default function Sidebar() {
  const { stats, storageInfo } = useEvents()
  const { userName, email, signOut, isLocalMode } = useAuth()
  const { unreadCount } = useNotifications()
  const navigate = useNavigate()
  return <aside className="sidebar">
    <a className="brand" href="/" onClick={(e) => { e.preventDefault(); navigate('/') }}><span className="brand-mark">✦</span><span><strong>Event Countdown</strong><small>Plan · Countdown · Celebrate</small></span></a>
    <div className="workspace"><div className="avatar">{(userName || email || 'U').charAt(0).toUpperCase()}</div><div><strong>{userName || 'Your workspace'}</strong><small>{isLocalMode ? 'Local mode · this device only' : email || 'Personal workspace'}</small></div></div>
    <nav className="side-nav" aria-label="Main">{links.map((l) => <NavLink key={l.to} to={l.to} end={l.end} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><span className="material-symbols-outlined" aria-hidden="true">{l.icon}</span><span>{l.label}</span>{l.badge && unreadCount > 0 && <span className="side-badge">{unreadCount > 99 ? '99+' : unreadCount}</span>}</NavLink>)}</nav>
    <div className="sidebar-bottom">
      <button className="side-link signout" onClick={async () => { await signOut(); navigate('/login') }}><span className="material-symbols-outlined" aria-hidden="true">logout</span>{isLocalMode ? 'Leave local mode' : 'Sign out'}</button>
      <div className="storage-box"><div className="storage-head"><span>Storage status</span><b>{isLocalMode ? 'Local' : 'This browser'}</b></div><div className="storage-track"><span style={{ width: `${storageInfo.percentUsed}%` }} /></div><small>{storageInfo.usedKB} KB used · {stats.total} active event{stats.total === 1 ? '' : 's'} saved on this device</small></div>
    </div>
  </aside>
}
