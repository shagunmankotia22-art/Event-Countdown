import { Link } from 'react-router-dom'

// Catch-all 404 route
export default function NotFound() {
  return (
    <div className="glass-card rounded-[2rem] p-16 text-center max-w-lg mx-auto mt-20">
      <span className="material-symbols-outlined text-6xl text-primary mb-4">
        event_busy
      </span>
      <h1 className="text-3xl font-display font-bold mb-2">404</h1>
      <p className="text-on-surface-variant mb-6">
        This page doesn't exist — maybe the event got cancelled.
      </p>
      <Link to="/" className="text-primary underline font-bold">
        Back to Dashboard
      </Link>
    </div>
  )
}
