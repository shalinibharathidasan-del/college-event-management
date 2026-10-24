import { Link } from 'react-router-dom'
import { TYPE_COLORS, formatDate, isPast } from '../api'

function EventCard({ event }) {
  const seatsLeft = event.capacity - event.registered

  return (
    <div className="card h-100 event-card">
      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between mb-2">
          <span className={`badge bg-${TYPE_COLORS[event.type]}`}>{event.type}</span>
          {isPast(event.event_date) ? (
            <span className="badge bg-secondary">Completed</span>
          ) : seatsLeft <= 0 ? (
            <span className="badge bg-dark">Full</span>
          ) : (
            <small className="text-muted">{seatsLeft} seats left</small>
          )}
        </div>
        <h5 className="card-title">{event.title}</h5>
        <p className="card-text small text-muted mb-1">{formatDate(event.event_date)}</p>
        <p className="card-text small text-muted">{event.venue}</p>
        <Link to={`/events/${event.id}`} className="btn btn-outline-primary btn-sm mt-auto">
          View details
        </Link>
      </div>
    </div>
  )
}

export default EventCard
