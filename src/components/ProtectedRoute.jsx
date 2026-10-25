import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Guards every private page. While a stored session is being restored we show a
// spinner (not the login page) so a refresh doesn't flash the sign-in screen.
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth()
  const location = useLocation()
  if (loading) return <div className="boot-screen" role="status" aria-live="polite"><span className="spinner" aria-hidden="true" />Restoring your session…</div>
  if (!isAuthenticated) return <Navigate to="/login" state={{ from: location }} replace />
  return children
}
