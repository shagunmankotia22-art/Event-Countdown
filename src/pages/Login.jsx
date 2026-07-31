import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

// Demo login gate for the ProtectedRoute example.
// No real backend — this only demonstrates the routing pattern.
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [name, setName] = useState('')

  const from = location.state?.from?.pathname || '/'

  const handleSubmit = (e) => {
    e.preventDefault()
    login()
    navigate(from, { replace: true })
  }

  return (
    <div className="glass-card rounded-[2rem] p-10 max-w-sm mx-auto mt-20">
      <h1 className="text-xl font-bold mb-4">Sign in to continue</h1>
      <p className="text-xs text-on-surface-variant mb-6">
        This page is protected. Enter any name to simulate a session.
      </p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 outline-none focus:border-primary"
        />
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
