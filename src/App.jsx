import { Routes, Route, Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
import ToastStack from './components/ToastStack.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Dashboard from './pages/Dashboard.jsx'
import EventDetail from './pages/EventDetail.jsx'
import AddEvent from './pages/AddEvent.jsx'
import PastEvents from './pages/PastEvents.jsx'
import Categories from './pages/Categories.jsx'
import Archives from './pages/Archives.jsx'
import Help from './pages/Help.jsx'
import Login from './pages/Login.jsx'
import NotFound from './pages/NotFound.jsx'
import Favorites from './pages/Favorites.jsx'
import Analytics from './pages/Analytics.jsx'
import Profile from './pages/Profile.jsx'
import Settings from './pages/Settings.jsx'
import CalendarPage from './pages/CalendarPage.jsx'
import Notifications from './pages/Notifications.jsx'
import PublicHolidays from './pages/PublicHolidays.jsx'

function AppShell() {
  return <>
    <Navbar />
    <div className="app-shell"><Sidebar /><main className="app-main" id="main"><Outlet /></main></div>
    <ToastStack />
  </>
}

export default function App() {
  return <Routes>
    <Route path="/login" element={<Login />} />
    {/* Every other page requires a signed-in account (or explicit local mode when no auth provider is configured). */}
    <Route element={<ProtectedRoute><AppShell /></ProtectedRoute>}>
      <Route path="/" element={<Dashboard />} />
      <Route path="/events/:id" element={<EventDetail />} />
      <Route path="/add" element={<AddEvent />} />
      <Route path="/add/:id" element={<AddEvent />} />
      <Route path="/calendar" element={<CalendarPage />} />
      <Route path="/favorites" element={<Favorites />} />
      <Route path="/analytics" element={<Analytics />} />
      <Route path="/notifications" element={<Notifications />} />
      <Route path="/holidays" element={<PublicHolidays />} />
      <Route path="/past" element={<PastEvents />} />
      <Route path="/categories" element={<Categories />} />
      <Route path="/archives" element={<Archives />} />
      <Route path="/profile" element={<Profile />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/help" element={<Help />} />
      <Route path="*" element={<NotFound />} />
    </Route>
  </Routes>
}
