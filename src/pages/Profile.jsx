import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { useEvents } from '../context/EventsContext.jsx'

export default function Profile() {
  const { userName, email, updateProfile, signOut, isLocalMode, authConfigured } = useAuth()
  const { stats } = useEvents()
  const navigate = useNavigate()
  const [name, setName] = useState(userName || '')
  const [status, setStatus] = useState({ type: '', text: '' })
  const [busy, setBusy] = useState(false)
  const save = async (e) => {
    e.preventDefault(); setBusy(true)
    const r = await updateProfile({ name })
    setBusy(false)
    setStatus(r.ok ? { type: 'ok', text: 'Profile updated.' } : { type: 'error', text: r.error })
    if (r.ok) setTimeout(() => setStatus({ type: '', text: '' }), 2500)
  }
  return <div className="simple-page narrow-page"><div className="page-heading"><p className="eyebrow">YOUR ACCOUNT</p><h1>Profile</h1><p className="muted">Manage your Event Countdown identity.</p></div>
    <section className="panel profile-panel"><div className="profile-large">{(userName || email || 'U').charAt(0).toUpperCase()}</div><h2>{userName || 'Event Countdown user'}</h2>
      <p className="muted small">{isLocalMode ? 'Local mode · not signed in' : email}</p>
      <div className="profile-stats"><div><strong>{stats.total}</strong><span>Active events</span></div><div><strong>{stats.upcoming}</strong><span>Upcoming</span></div><div><strong>{stats.archived}</strong><span>Archived</span></div></div>
      <form onSubmit={save} className="profile-form"><div className="field"><label htmlFor="pf-name"><span>Display name</span></label><input id="pf-name" value={name} onChange={(e) => setName(e.target.value)} /></div>
        {!isLocalMode && <div className="field"><label htmlFor="pf-email"><span>Email</span></label><input id="pf-email" value={email} readOnly disabled /></div>}
        <button className="primary-button" type="submit" disabled={busy}>{busy ? 'Saving…' : 'Save profile'}</button>
        {status.text && <p className={status.type === 'ok' ? 'success-text' : 'error-text'} role="status">{status.text}</p>}</form>
      <button className="secondary-button wide" onClick={async () => { await signOut(); navigate('/login') }}><span className="material-symbols-outlined">logout</span>{isLocalMode ? 'Leave local mode' : 'Sign out'}</button>
      <p className="muted small profile-note">{isLocalMode ? 'Local mode has no account or password; anyone using this browser can see these events.' : 'Your events are stored in this browser under your account and are kept separate from other accounts in this browser (separation, not encryption).'}{!authConfigured && ' Configure Supabase (see README) to enable real accounts.'}</p></section></div>
}
