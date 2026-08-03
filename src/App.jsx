import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Sidebar from './components/Sidebar.jsx'
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

export default function App() {
  return (
    <>
      <Navbar />
      <div className="flex pt-24 min-h-screen">
        <Sidebar />
        <main className="flex-1 lg:ml-72 p-6 md:p-10">
          <Routes>
            {/* Static route */}
            <Route path="/" element={<Dashboard />} />

            {/* Dynamic route with a route param */}
            <Route path="/events/:id" element={<EventDetail />} />

            {/* Nested-feeling routes under the same layout */}
            <Route path="/past" element={<PastEvents />} />
            <Route path="/categories" element={<Categories />} />
            <Route path="/archives" element={<Archives />} />
            <Route path="/help" element={<Help />} />

            {/* Protected route — requires auth, else redirected to /login */}
            <Route
              path="/add"
              element={
                <ProtectedRoute>
                  <AddEvent />
                </ProtectedRoute>
              }
            />

            <Route path="/login" element={<Login />} />

            {/* Catch-all 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>
      </div>
    </>
  )
}
