import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import ProtectedRoute from './components/ProtectedRoute'
import Events from './pages/Events'
import EventDetails from './pages/EventDetails'
import Login from './pages/Login'
import Register from './pages/Register'
import MyRegistrations from './pages/MyRegistrations'
import ManageEvents from './pages/admin/ManageEvents'
import Participants from './pages/admin/Participants'

function App() {
  return (
    <>
      <Navbar />
      <main className="container py-4">
        <Routes>
          <Route path="/" element={<Events />} />
          <Route path="/events/:id" element={<EventDetails />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/my-registrations"
            element={<ProtectedRoute><MyRegistrations /></ProtectedRoute>}
          />
          <Route
            path="/admin/events"
            element={<ProtectedRoute adminOnly><ManageEvents /></ProtectedRoute>}
          />
          <Route
            path="/admin/events/:id/participants"
            element={<ProtectedRoute adminOnly><Participants /></ProtectedRoute>}
          />
          <Route path="*" element={<h3>Page not found</h3>} />
        </Routes>
      </main>
    </>
  )
}

export default App
