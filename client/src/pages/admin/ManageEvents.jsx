import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, EVENT_TYPES, TYPE_COLORS, formatDate } from '../../api'

const emptyForm = { title: '', type: 'Workshop', description: '', speaker: '', venue: '', event_date: '', capacity: 50 }

// '2026-11-12 10:00:00' -> '2026-11-12T10:00' for <input type="datetime-local">
const toInputDate = (value) => value.slice(0, 16).replace(' ', 'T')

function ManageEvents() {
  const [events, setEvents] = useState([])
  const [form, setForm] = useState(emptyForm)
  const [editingId, setEditingId] = useState(null)
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = () => api('/events').then(setEvents).catch((err) => setMessage({ text: err.message, type: 'danger' }))

  useEffect(() => {
    load()
  }, [])

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value })

  const startEdit = (event) => {
    setEditingId(event.id)
    setForm({ ...event, speaker: event.speaker || '', event_date: toInputDate(event.event_date) })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const cancelEdit = () => {
    setEditingId(null)
    setForm(emptyForm)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingId) {
        await api(`/events/${editingId}`, { method: 'PUT', body: form })
        setMessage({ text: 'Event updated', type: 'success' })
      } else {
        await api('/events', { method: 'POST', body: form })
        setMessage({ text: 'Event created', type: 'success' })
      }
      cancelEdit()
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  const handleDelete = async (event) => {
    if (!window.confirm(`Delete "${event.title}"? Its registrations will also be removed.`)) return
    try {
      await api(`/events/${event.id}`, { method: 'DELETE' })
      setMessage({ text: 'Event deleted', type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <h2 className="mb-3">Manage Events</h2>
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">{editingId ? 'Edit event' : 'Create new event'}</h5>
          <form onSubmit={handleSubmit} className="row g-3">
            <div className="col-md-8">
              <label className="form-label" htmlFor="title">Title</label>
              <input id="title" name="title" className="form-control" value={form.title} onChange={handleChange} required />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="type">Type</label>
              <select id="type" name="type" className="form-select" value={form.type} onChange={handleChange}>
                {EVENT_TYPES.map((t) => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div className="col-12">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea id="description" name="description" rows="2" className="form-control" value={form.description} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="speaker">Speaker / organiser</label>
              <input id="speaker" name="speaker" className="form-control" value={form.speaker} onChange={handleChange} />
            </div>
            <div className="col-md-4">
              <label className="form-label" htmlFor="venue">Venue</label>
              <input id="venue" name="venue" className="form-control" value={form.venue} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label" htmlFor="event_date">Date &amp; time</label>
              <input id="event_date" name="event_date" type="datetime-local" className="form-control" value={form.event_date} onChange={handleChange} required />
            </div>
            <div className="col-md-2">
              <label className="form-label" htmlFor="capacity">Capacity</label>
              <input id="capacity" name="capacity" type="number" min="1" className="form-control" value={form.capacity} onChange={handleChange} required />
            </div>
            <div className="col-12 d-flex gap-2">
              <button className="btn btn-primary">{editingId ? 'Save changes' : 'Create event'}</button>
              {editingId && <button type="button" className="btn btn-secondary" onClick={cancelEdit}>Cancel</button>}
            </div>
          </form>
        </div>
      </div>

      <div className="card">
        <div className="table-responsive">
          <table className="table table-hover mb-0 align-middle">
            <thead className="table-light">
              <tr><th>Event</th><th>Type</th><th>Date</th><th>Registered</th><th></th></tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr key={event.id}>
                  <td><Link to={`/events/${event.id}`}>{event.title}</Link></td>
                  <td><span className={`badge bg-${TYPE_COLORS[event.type]}`}>{event.type}</span></td>
                  <td className="small">{formatDate(event.event_date)}</td>
                  <td>{event.registered} / {event.capacity}</td>
                  <td className="text-nowrap">
                    <Link to={`/admin/events/${event.id}/participants`} className="btn btn-sm btn-outline-dark me-1">Participants</Link>
                    <button className="btn btn-sm btn-outline-primary me-1" onClick={() => startEdit(event)}>Edit</button>
                    <button className="btn btn-sm btn-outline-danger" onClick={() => handleDelete(event)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}

export default ManageEvents
