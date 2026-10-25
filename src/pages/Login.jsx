import { useState } from 'react'
import { Navigate, useLocation, useNavigate } from 'react-router-dom'
import { useAuth, validateEmail, validatePassword } from '../context/AuthContext.jsx'

function Field({ id, label, error, children }) {
  return <div className="field"><label htmlFor={id}><span>{label}</span></label>{children}{error && <small id={`${id}-err`} className="error-text" role="alert">{error}</small>}</div>
}

export default function Login() {
  const { isAuthenticated, loading, authConfigured, signIn, signUp, enterLocalMode, notice, clearNotice } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'
  const [mode, setMode] = useState('signin')
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' })
  const [errors, setErrors] = useState({})
  const [formError, setFormError] = useState('')
  const [info, setInfo] = useState('')
  const [show, setShow] = useState(false)
  const [busy, setBusy] = useState(false)

  if (loading) return <div className="boot-screen" role="status"><span className="spinner" aria-hidden="true" />Loading…</div>
  if (isAuthenticated) return <Navigate to={from} replace />

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setErrors((x) => ({ ...x, [k]: '' })); setFormError('') }
  const isSignup = mode === 'signup'
  const switchMode = (m) => { setMode(m); setErrors({}); setFormError(''); setInfo(''); clearNotice() }

  const validate = () => {
    const e = {}
    if (isSignup && form.name.trim().length < 2) e.name = 'Enter your name (at least 2 characters).'
    if (!validateEmail(form.email)) e.email = 'Enter a valid email address.'
    if (isSignup) { const p = validatePassword(form.password); if (p) e.password = p; if (form.confirm !== form.password) e.confirm = 'Passwords do not match.' }
    else if (!form.password) e.password = 'Enter your password.'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const submit = async (ev) => {
    ev.preventDefault()
    if (busy || !validate()) return
    setBusy(true); setFormError(''); setInfo('')
    const result = isSignup ? await signUp(form) : await signIn(form)
    setBusy(false)
    if (!result.ok) return setFormError(result.error)
    if (isSignup && result.needsConfirmation) { setInfo(`We sent a confirmation link to ${form.email.trim()}. Open it, then sign in.`); setMode('signin'); setForm((f) => ({ ...f, password: '', confirm: '' })); return }
    navigate(from, { replace: true })
  }

  return <div className="auth-page">
    <aside className="auth-aside" aria-hidden="true">
      <div className="auth-brand"><span className="brand-mark">✦</span> Event Countdown</div>
      <h2>Every moment, counted down.</h2>
      <p>Plan events, track preparation, get reminders and never miss a public holiday.</p>
      <ul><li><span className="material-symbols-outlined">timer</span>Live countdowns</li><li><span className="material-symbols-outlined">notifications_active</span>Smart reminders</li><li><span className="material-symbols-outlined">celebration</span>Real public holidays</li></ul>
    </aside>
    <main className="auth-main">
      <div className="auth-card">
        <div className="auth-brand mobile-only"><span className="brand-mark">✦</span> Event Countdown</div>
        <h1>{isSignup ? 'Create your account' : 'Welcome back'}</h1>
        <p className="muted">{isSignup ? 'Sign up to keep your events in your own private workspace.' : 'Sign in to open your events.'}</p>

        {!authConfigured && <div className="notice-box warn" role="note"><span className="material-symbols-outlined">info</span><p><strong>Account sign-in isn't configured yet.</strong> Add your Supabase project keys to <code>.env</code> (see README) to enable sign-up and sign-in. Until then you can use Event Countdown in local mode.</p></div>}
        {notice && <div className="notice-box warn" role="alert"><span className="material-symbols-outlined">schedule</span><p>{notice}</p></div>}
        {info && <div className="notice-box ok" role="status"><span className="material-symbols-outlined">mark_email_read</span><p>{info}</p></div>}

        {authConfigured && <>
          <div className="segmented" role="tablist" aria-label="Authentication mode">
            <button role="tab" aria-selected={!isSignup} className={!isSignup ? 'on' : ''} onClick={() => switchMode('signin')} type="button">Sign in</button>
            <button role="tab" aria-selected={isSignup} className={isSignup ? 'on' : ''} onClick={() => switchMode('signup')} type="button">Create account</button>
          </div>
          <form onSubmit={submit} noValidate className="auth-form">
            {isSignup && <Field id="name" label="Full name" error={errors.name}><input id="name" autoComplete="name" value={form.name} onChange={set('name')} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? 'name-err' : undefined} /></Field>}
            <Field id="email" label="Email" error={errors.email}><input id="email" type="email" autoComplete="email" inputMode="email" value={form.email} onChange={set('email')} placeholder="you@example.com" aria-invalid={Boolean(errors.email)} aria-describedby={errors.email ? 'email-err' : undefined} /></Field>
            <Field id="password" label="Password" error={errors.password}>
              <div className="password-wrap"><input id="password" type={show ? 'text' : 'password'} autoComplete={isSignup ? 'new-password' : 'current-password'} value={form.password} onChange={set('password')} aria-invalid={Boolean(errors.password)} aria-describedby={errors.password ? 'password-err' : undefined} />
                <button type="button" className="icon-button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show}><span className="material-symbols-outlined">{show ? 'visibility_off' : 'visibility'}</span></button></div>
            </Field>
            {isSignup && <Field id="confirm" label="Confirm password" error={errors.confirm}><input id="confirm" type={show ? 'text' : 'password'} autoComplete="new-password" value={form.confirm} onChange={set('confirm')} aria-invalid={Boolean(errors.confirm)} aria-describedby={errors.confirm ? 'confirm-err' : undefined} /></Field>}
            {isSignup && <p className="muted small">At least 8 characters, with a letter and a number.</p>}
            {formError && <div className="notice-box error" role="alert"><span className="material-symbols-outlined">error</span><p>{formError}</p></div>}
            <button className="primary-button wide" type="submit" disabled={busy}>{busy ? <><span className="spinner small" aria-hidden="true" />{isSignup ? 'Creating account…' : 'Signing in…'}</> : isSignup ? 'Create account' : 'Sign in'}</button>
          </form>
        </>}

        {!authConfigured && <button className="primary-button wide" onClick={() => { enterLocalMode(); navigate(from, { replace: true }) }}><span className="material-symbols-outlined">laptop_mac</span>Continue in local mode</button>}
        {!authConfigured && <p className="muted small center">Local mode is <b>not</b> an account and has no password. Events stay in this browser only.</p>}
      </div>
    </main>
  </div>
}
