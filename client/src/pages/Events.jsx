import { useEffect, useState } from 'react'
import { api, EVENT_TYPES } from '../api'
import EventCard from '../components/EventCard'

function Events() {
  const [events, setEvents] = useState([])
  const [search, setSearch] = useState('')
  const [type, setType] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Reload whenever the search text or type filter changes (small delay while typing)
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams({ search, type })
      api(`/events?${params}`)
        .then(setEvents)
        .catch((err) => setError(err.message))
        .finally(() => setLoading(false))
    }, 300)
    return () => clearTimeout(timer)
  }, [search, type])

  return (
    <>
      <div className="hero p-4 p-md-5 mb-4 rounded-3 text-white">
        <h1 className="fw-bold">Workshops, Seminars, FDPs &amp; Tech Events</h1>
        <p className="lead mb-0">Find an event and register in one click.</p>
      </div>

      <div className="row g-2 mb-4">
        <div className="col-md-8">
          <input
            className="form-control"
            placeholder="Search by title, topic or speaker..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-4">
          <select className="form-select" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="">All types</option>
            {EVENT_TYPES.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary"></div></div>
      ) : events.length === 0 ? (
        <p className="text-muted">No events found.</p>
      ) : (
        <div className="row g-3">
          {events.map((event) => (
            <div className="col-sm-6 col-lg-4" key={event.id}>
              <EventCard event={event} />
            </div>
          ))}
        </div>
      )}
    </>
  )
}

export default Events
