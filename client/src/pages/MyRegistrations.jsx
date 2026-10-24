import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, TYPE_COLORS, formatDate, isPast } from '../api'

function MyRegistrations() {
  const [rows, setRows] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api('/registrations/my').then(setRows).catch((err) => setError(err.message))
  }, [])

  if (error) return <div className="alert alert-danger">{error}</div>
  if (!rows) return <div className="spinner-border"></div>

  return (
    <>
      <h2 className="mb-3">My Registrations</h2>
      {rows.length === 0 ? (
        <p className="text-muted">
          You have not registered for any events yet. <Link to="/">Browse events</Link>
        </p>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr><th>Event</th><th>Type</th><th>Date</th><th>Venue</th><th>Registered on</th><th>Status</th></tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td><Link to={`/events/${r.id}`}>{r.title}</Link></td>
                    <td><span className={`badge bg-${TYPE_COLORS[r.type]}`}>{r.type}</span></td>
                    <td>{formatDate(r.event_date)}</td>
                    <td>{r.venue}</td>
                    <td>{formatDate(r.registered_at)}</td>
                    <td>
                      {isPast(r.event_date)
                        ? <span className="badge bg-secondary">Attended</span>
                        : <span className="badge bg-success">Upcoming</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  )
}

export default MyRegistrations
