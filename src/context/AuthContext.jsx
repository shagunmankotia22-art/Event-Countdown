import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { supabase, isSupabaseConfigured } from '../lib/supabase.js'
import { readJSON, writeJSON } from '../lib/storage.js'

const AuthContext = createContext(null)
const GUEST_KEY = 'event-countdown:guest'
const LEGACY_DEMO_KEY = 'event-countdown:auth'
const GUEST_NAME_KEY = 'event-countdown:username'

export const validateEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(v || '').trim())
export function validatePassword(v) {
  if (!v || v.length < 8) return 'Use at least 8 characters.'
  if (!/[A-Za-z]/.test(v) || !/\d/.test(v)) return 'Include at least one letter and one number.'
  return ''
}

function friendlyError(err) {
  const msg = String(err?.message || err || '')
  if (/invalid login credentials/i.test(msg)) return 'Incorrect email or password.'
  if (/email not confirmed/i.test(msg)) return 'Please confirm your email address first — check your inbox for the link.'
  if (/already registered|already been registered/i.test(msg)) return 'An account with this email already exists. Try signing in instead.'
  if (/rate limit|too many/i.test(msg)) return 'Too many attempts. Please wait a minute and try again.'
  if (/password.*(short|weak|least)/i.test(msg)) return msg
  if (/failed to fetch|network/i.test(msg)) return 'Network error — check your connection and try again.'
  return msg || 'Something went wrong. Please try again.'
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(isSupabaseConfigured)
  const [notice, setNotice] = useState('')
  // Local mode exists ONLY when no auth provider is configured. It is not authentication.
  const [guest, setGuest] = useState(() => !isSupabaseConfigured && (readJSON(GUEST_KEY, false) === true || readJSON(LEGACY_DEMO_KEY, false) === true))
  const [guestName, setGuestName] = useState(() => readJSON(GUEST_NAME_KEY, ''))
  const userInitiatedSignOut = useRef(false)

  useEffect(() => {
    if (!supabase) return undefined
    let active = true
    supabase.auth.getSession().then(({ data }) => { if (active) { setSession(data.session); setLoading(false) } })
      .catch(() => active && setLoading(false))
    const { data: sub } = supabase.auth.onAuthStateChange((event, next) => {
      if (!active) return
      setSession(next)
      if (event === 'SIGNED_OUT' && !userInitiatedSignOut.current) setNotice('Your session expired. Please sign in again.')
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') setNotice('')
      userInitiatedSignOut.current = false
    })
    return () => { active = false; sub.subscription.unsubscribe() }
  }, [])

  const user = session?.user || null
  const isAuthenticated = Boolean(user) || guest
  const scope = user ? `u-${user.id}` : 'guest'
  const userName = user ? (user.user_metadata?.full_name || user.email?.split('@')[0] || '') : guestName

  const signUp = useCallback(async ({ name, email, password }) => {
    if (!supabase) return { ok: false, error: 'Account sign-up is not configured yet. See README → "Enable real authentication".' }
    const { data, error } = await supabase.auth.signUp({ email: email.trim(), password, options: { data: { full_name: name.trim() } } })
    if (error) return { ok: false, error: friendlyError(error) }
    // When email confirmation is enabled in Supabase there is no session until the link is clicked.
    // (Supabase returns an obfuscated user with no identities for an already-registered email.)
    if (data.user && Array.isArray(data.user.identities) && data.user.identities.length === 0) return { ok: false, error: friendlyError('User already registered') }
    return { ok: true, needsConfirmation: !data.session }
  }, [])

  const signIn = useCallback(async ({ email, password }) => {
    if (!supabase) return { ok: false, error: 'Sign-in is not configured yet. See README → "Enable real authentication".' }
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    return error ? { ok: false, error: friendlyError(error) } : (setNotice(''), { ok: true })
  }, [])

  const signOut = useCallback(async () => {
    userInitiatedSignOut.current = true
    setNotice('')
    if (supabase && session) await supabase.auth.signOut().catch(() => {})
    if (guest) { setGuest(false); writeJSON(GUEST_KEY, false); try { localStorage.removeItem(LEGACY_DEMO_KEY) } catch { /* ignore */ } }
  }, [session, guest])

  const enterLocalMode = useCallback(() => { setGuest(true); writeJSON(GUEST_KEY, true) }, [])

  const updateProfile = useCallback(async ({ name }) => {
    const clean = name.trim()
    if (!clean) return { ok: false, error: 'Display name cannot be empty.' }
    if (supabase && session) {
      const { error } = await supabase.auth.updateUser({ data: { full_name: clean } })
      return error ? { ok: false, error: friendlyError(error) } : { ok: true }
    }
    setGuestName(clean); writeJSON(GUEST_NAME_KEY, clean)
    return { ok: true }
  }, [session])

  const value = useMemo(() => ({
    user, scope, userName, isAuthenticated, isLocalMode: guest && !user, authConfigured: isSupabaseConfigured,
    loading, notice, clearNotice: () => setNotice(''), signUp, signIn, signOut, enterLocalMode, updateProfile,
    email: user?.email || ''
  }), [user, scope, userName, isAuthenticated, guest, loading, notice, signUp, signIn, signOut, enterLocalMode, updateProfile])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
