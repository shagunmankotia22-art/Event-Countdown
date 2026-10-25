import { Link } from 'react-router-dom'
export default function NotFound() {
  return <div className="empty-state not-found"><span className="material-symbols-outlined">event_busy</span><h1>404</h1><p>This page doesn't exist — maybe the event got cancelled.</p><Link to="/" className="primary-button">Back to dashboard</Link></div>
}
