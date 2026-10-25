import { useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext.jsx'
import { useEvents } from '../context/EventsContext.jsx'
import { useDismiss } from '../hooks/useDismiss.js'
import NotificationItem from './NotificationItem.jsx'

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead, remove, openNotification } = useNotifications()
  const { getEventById } = useEvents()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  useDismiss(ref, open, () => setOpen(false))
  const recent = notifications.slice(0, 6)
  return <div className="popover-wrap" ref={ref}>
    <button className="icon-button bell" onClick={() => setOpen((o) => !o)} aria-label={`Notifications${unreadCount ? `, ${unreadCount} unread` : ''}`} aria-expanded={open} aria-haspopup="true">
      <span className="material-symbols-outlined">notifications</span>
      {unreadCount > 0 && <span className="badge" aria-hidden="true">{unreadCount > 9 ? '9+' : unreadCount}</span>}
    </button>
    {open && <div className="popover notif-popover" role="dialog" aria-label="Notifications">
      <div className="popover-head"><strong>Notifications</strong><button className="text-button" onClick={markAllRead} disabled={!unreadCount}>Mark all as read</button></div>
      {recent.length ? <ul className="notif-list">{recent.map((n) => <NotificationItem key={n.id} n={n} compact eventTitle={n.eventId ? getEventById(n.eventId)?.title : ''} onOpen={(x) => { openNotification(x); setOpen(false) }} onRead={markRead} onDelete={remove} />)}</ul>
        : <div className="popover-empty"><span className="material-symbols-outlined">notifications_off</span><p>You're all caught up.</p></div>}
      <div className="popover-foot"><Link to="/notifications" onClick={() => setOpen(false)}>View all notifications</Link><Link to="/settings" onClick={() => setOpen(false)}>Reminder settings</Link></div>
    </div>}
  </div>
}
