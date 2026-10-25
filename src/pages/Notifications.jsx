import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { useEvents } from '../context/EventsContext.jsx'
import NotificationItem from '../components/NotificationItem.jsx'

const FILTERS = [['all', 'All'], ['unread', 'Unread'], ['reminder', 'Reminders'], ['today', 'Today'], ['upcoming', 'Upcoming'], ['tasks', 'Tasks'], ['holiday', 'Holidays']]

export default function Notifications() {
  const { notifications, unreadCount, markRead, markAllRead, remove, clearRead, clearAll, openNotification } = useNotifications()
  const { getEventById } = useEvents()
  const [filter, setFilter] = useState('all')
  const shown = notifications.filter((n) => filter === 'all' || (filter === 'unread' ? !n.read : n.type === filter))
  const readCount = notifications.length - unreadCount
  return <div className="simple-page narrow-page wide">
    <div className="page-heading row"><div><p className="eyebrow">STAY ON TOP OF IT</p><h1>Notifications {unreadCount > 0 && <span className="count-pill">{unreadCount} unread</span>}</h1><p className="muted">Reminders, events happening today, unfinished preparation and public holidays.</p></div>
      <Link to="/settings" className="secondary-button"><span className="material-symbols-outlined">tune</span>Reminder settings</Link></div>
    <div className="toolbar"><div className="chip-row" role="tablist" aria-label="Filter notifications">{FILTERS.map(([k, label]) => <button key={k} role="tab" aria-selected={filter === k} className={`choice-chip ${filter === k ? 'on' : ''}`} onClick={() => setFilter(k)}>{label}</button>)}</div>
      <div className="toolbar-actions"><button className="text-button" onClick={markAllRead} disabled={!unreadCount}>Mark all as read</button><button className="text-button" onClick={clearRead} disabled={!readCount}>Clear read</button><button className="text-button danger" onClick={() => { if (window.confirm('Delete all notifications?')) clearAll() }} disabled={!notifications.length}>Clear all</button></div></div>
    {shown.length ? <ul className="notif-list panel flush">{shown.map((n) => <NotificationItem key={n.id} n={n} eventTitle={n.eventId ? getEventById(n.eventId)?.title : ''} onOpen={openNotification} onRead={markRead} onDelete={remove} />)}</ul>
      : <div className="empty-state"><span className="material-symbols-outlined">notifications_off</span><h3>{notifications.length ? 'Nothing in this view' : 'No notifications yet'}</h3><p>{notifications.length ? 'Try a different filter.' : 'Add reminders to your events and they will show up here when they are due.'}</p>{!notifications.length && <Link to="/add" className="primary-button">Add an event</Link>}</div>}
  </div>
}
