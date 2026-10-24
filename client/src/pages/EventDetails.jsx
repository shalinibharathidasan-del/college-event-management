import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { api, TYPE_COLORS, formatDate, isPast } from '../api'
import { useAuth } from '../context/AuthContext'

function EventDetails() {
  const { id } = useParams()
  const { user, isAdmin } = useAuth()
  const navigate = useNavigate()
  const [event, setEvent] = useState(null)
  const [registered, setRegistered] = useState(false)
  const [message, setMessage] = useState({ text: '', type: '' })
  const [busy, setBusy] = useState(false)

  const load = async () => {
    try {
      setEvent(await api(`/events/${id}`))
      if (user && !isAdmin) {
        const mine = await api('/registrations/my')
        setRegistered(mine.some((r) => r.id === Number(id)))
      }
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, user])

  const handleRegister = async () => {
    if (!user) return navigate('/login', { state: { from: `/events/${id}` } })
    setBusy(true)
    try {
      const res = registered
        ? await api(`/events/${id}/register`, { method: 'DELETE' })
        : await api(`/events/${id}/register`, { method: 'POST' })
      setMessage({ text: res.message, type: 'success' })
      await load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    } finally {
      setBusy(false)
    }
  }

  if (!event) {
    return message.text ? <div className="alert alert-danger">{message.text}</div> : <div className="spinner-border"></div>
  }

  const seatsLeft = event.capacity - event.registered
  const past = isPast(event.event_date)

  return (
    <div className="row justify-content-center">
      <div className="col-lg-8">
        <Link to="/" className="btn btn-link px-0 mb-2">&larr; All events</Link>
        <div className="card">
          <div className="card-body p-4">
            <span className={`badge bg-${TYPE_COLORS[event.type]} mb-2`}>{event.type}</span>
            <h2 className="card-title">{event.title}</h2>
            <p className="text-muted">{event.description}</p>

            <table className="table">
              <tbody>
                <tr><th style={{ width: '30%' }}>Date &amp; time</th><td>{formatDate(event.event_date)}</td></tr>
                <tr><th>Venue</th><td>{event.venue}</td></tr>
                {event.speaker && <tr><th>Speaker</th><td>{event.speaker}</td></tr>}
                <tr><th>Seats</th><td>{event.registered} / {event.capacity} registered</td></tr>
              </tbody>
            </table>

            {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

            {isAdmin ? (
              <Link to={`/admin/events/${event.id}/participants`} className="btn btn-dark">View participants</Link>
            ) : past ? (
              <button className="btn btn-secondary" disabled>Event completed</button>
            ) : registered ? (
              <>
                <span className="badge bg-success fs-6 me-2">You are registered ✓</span>
                <button className="btn btn-outline-danger" onClick={handleRegister} disabled={busy}>Cancel registration</button>
              </>
            ) : (
              <button className="btn btn-primary btn-lg" onClick={handleRegister} disabled={busy || seatsLeft <= 0}>
                {seatsLeft <= 0 ? 'Event full' : user ? 'Register now' : 'Login to register'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default EventDetails
