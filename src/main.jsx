import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from './App.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { EventsProvider } from './context/EventsContext.jsx'
import { SearchProvider } from './context/SearchContext.jsx'
import { NotificationsProvider } from './context/NotificationsContext.jsx'
import './index.css'

// Everything below is keyed by account: when the signed-in user changes, all per-user
// state (events, notifications, settings, search) is discarded and reloaded for the new scope,
// so one account's data can never leak into another's session.
function ScopedApp() {
  const { scope } = useAuth()
  return <EventsProvider key={scope}><SearchProvider><NotificationsProvider><App /></NotificationsProvider></SearchProvider></EventsProvider>
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ScopedApp />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
)
