import { useRef, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useSearch } from '../context/SearchContext.jsx'
import { useDismiss } from '../hooks/useDismiss.js'
import NotificationBell from './NotificationBell.jsx'

// The ONE event search bar. It drives the Dashboard's results (title + location),
// together with the category / status filters and sorting that live on the Dashboard.
export default function Navbar() {
  const { userName, email, signOut, isLocalMode } = useAuth()
  const { query, setQuery, clear } = useSearch()
  const [dark, setDark] = useState(() => localStorage.getItem('event-countdown:theme') === 'dark')
  const [menu, setMenu] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()
  const location = useLocation()
  useDismiss(menuRef, menu, () => setMenu(false))

  const onChange = (e) => { setQuery(e.target.value); if (location.pathname !== '/') navigate('/') }
  const toggleTheme = () => {
    const next = !dark
    setDark(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('event-countdown:theme', next ? 'dark' : 'light')
  }
  const initial = (userName || email || 'U').charAt(0).toUpperCase()
  return <header className="topbar">
    <div className="mobile-brand"><span className="brand-mark">✦</span> Evently</div>
    <div className="search-wrap" role="search">
      <span className="material-symbols-outlined" aria-hidden="true">search</span>
      <input type="search" aria-label="Search events by title or location" placeholder="Search events by title or location…" value={query} onChange={onChange} onKeyDown={(e) => { if (e.key === 'Escape') clear() }} />
      {query && <button className="icon-button search-clear" onClick={clear} aria-label="Clear search"><span className="material-symbols-outlined">close</span></button>}
    </div>
    <div className="top-actions">
      <button className="icon-button" onClick={toggleTheme} aria-label={dark ? 'Switch to light theme' : 'Switch to dark theme'}><span className="material-symbols-outlined">{dark ? 'light_mode' : 'dark_mode'}</span></button>
      <NotificationBell />
      <div className="popover-wrap" ref={menuRef}>
        <button className="profile-chip" onClick={() => setMenu((o) => !o)} aria-expanded={menu} aria-haspopup="true"><span className="avatar small">{initial}</span><span>{userName || 'Account'}</span><span className="material-symbols-outlined">expand_more</span></button>
        {menu && <div className="popover menu-popover">
          <div className="menu-head"><strong>{userName || 'Account'}</strong><small>{email || (isLocalMode ? 'Local mode · not signed in' : '')}</small></div>
          <Link to="/profile" onClick={() => setMenu(false)}><span className="material-symbols-outlined">person</span>Profile</Link>
          <Link to="/settings" onClick={() => setMenu(false)}><span className="material-symbols-outlined">settings</span>Settings</Link>
          <button onClick={async () => { setMenu(false); await signOut(); navigate('/login') }}><span className="material-symbols-outlined">logout</span>{isLocalMode ? 'Leave local mode' : 'Sign out'}</button>
        </div>}
      </div>
    </div>
  </header>
}
