import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Demo login gate for the ProtectedRoute example.
// No real backend — but the name you enter here IS actually stored
// and shown in the sidebar, so it's a real (if simple) identity flow.
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('Enter a name to continue.')
      return
    }
    login(name)
    navigate(from, { replace: true })
  }

  return (
    <div className="glass-card rounded-[2rem] p-10 max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4 text-on-surface">Sign in to continue</h1>
      <p className="text-xs text-on-surface-variant mb-6">
        This page is protected. The name you enter is saved and shown in your sidebar.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <input
          value={name}
          onChange={(e) => { setName(e.target.value); setError('') }}
          placeholder="Your name"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary text-on-surface placeholder:text-on-surface-variant/50"
        />
        {error && <p className="text-xs text-secondary">{error}</p>}
        <button
          type="submit"
          className="w-full bg-primary text-on-primary py-3 rounded-full font-bold text-sm"
        >
          Sign In
        </button>
      </form>
    </div>
  )
}
