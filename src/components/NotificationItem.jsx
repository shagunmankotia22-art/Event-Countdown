import { formatRelative, formatDateTime } from '../lib/datetime.js'

export const TYPE_META = {
  reminder: { icon: 'alarm', label: 'Reminder', tone: 'purple' },
  today: { icon: 'today', label: 'Today', tone: 'pink' },
  upcoming: { icon: 'event_upcoming', label: 'Upcoming', tone: 'mint' },
  tasks: { icon: 'checklist', label: 'Preparation', tone: 'orange' },
  holiday: { icon: 'celebration', label: 'Holiday', tone: 'mint' }
}

export default function NotificationItem({ n, eventTitle, onOpen, onRead, onDelete, compact = false }) {
  const meta = TYPE_META[n.type] || TYPE_META.reminder
  return <li className={`notif-item ${n.read ? '' : 'unread'} ${compact ? 'compact' : ''}`}>
    <span className={`notif-icon tone-${meta.tone}`}><span className="material-symbols-outlined" aria-hidden="true">{meta.icon}</span></span>
    <button className="notif-main" onClick={() => onOpen(n)}>
      <span className="notif-title">{!n.read && <i className="unread-dot" aria-label="Unread" />}{n.title}</span>
      <span className="notif-body">{n.body}</span>
      <span className="notif-meta"><span className="chip">{meta.label}</span>{eventTitle && <span className="notif-event"><span className="material-symbols-outlined" aria-hidden="true">link</span>{eventTitle}</span>}<time dateTime={n.createdAt} title={formatDateTime(n.createdAt)}>{formatRelative(n.createdAt)}</time></span>
    </button>
    <div className="notif-actions">
      <button className="icon-button" onClick={() => onRead(n.id, !n.read)} aria-label={n.read ? 'Mark as unread' : 'Mark as read'} title={n.read ? 'Mark as unread' : 'Mark as read'}><span className="material-symbols-outlined">{n.read ? 'mark_email_unread' : 'done'}</span></button>
      <button className="icon-button" onClick={() => onDelete(n.id)} aria-label="Delete notification" title="Delete"><span className="material-symbols-outlined">delete</span></button>
    </div>
  </li>
}
