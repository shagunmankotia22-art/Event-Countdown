import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotifications } from '../context/NotificationsContext.jsx'

function Toast({ toast, onDismiss, onOpen }) {
  useEffect(() => { const t = window.setTimeout(() => onDismiss(toast.id), 9000); return () => window.clearTimeout(t) }, [toast.id, onDismiss])
  return <div className="toast" role="status">
    <span className="material-symbols-outlined toast-icon" aria-hidden="true">notifications_active</span>
    <button className="toast-body" onClick={() => onOpen(toast)}><strong>{toast.title}</strong><small>{toast.body}</small></button>
    <button className="toast-close" onClick={() => onDismiss(toast.id)} aria-label="Dismiss notification">×</button>
  </div>
}

export default function ToastStack() {
  const { toasts, dismissToast } = useNotifications()
  const navigate = useNavigate()
  const open = (t) => { dismissToast(t.id); navigate(t.eventId ? `/events/${t.eventId}` : '/notifications') }
  if (!toasts.length) return null
  return <div className="toast-stack" aria-live="polite">{toasts.map((t) => <Toast key={t.id} toast={t} onDismiss={dismissToast} onOpen={open} />)}</div>
}
