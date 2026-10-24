import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { api, formatDate } from '../../api'

function Participants() {
  const { id } = useParams()
  const [event, setEvent] = useState(null)
  const [participants, setParticipants] = useState([])
  const [message, setMessage] = useState({ text: '', type: '' })

  const load = async () => {
    try {
      const [ev, people] = await Promise.all([api(`/events/${id}`), api(`/events/${id}/participants`)])
      setEvent(ev)
      setParticipants(people)
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const handleRemove = async (person) => {
    if (!window.confirm(`Remove ${person.name} from this event?`)) return
    try {
      await api(`/events/${id}/participants/${person.id}`, { method: 'DELETE' })
      setMessage({ text: `${person.name} removed`, type: 'success' })
      load()
    } catch (err) {
      setMessage({ text: err.message, type: 'danger' })
    }
  }

  return (
    <>
      <Link to="/admin/events" className="btn btn-link px-0 mb-2">&larr; Manage events</Link>
      <h2>Participants</h2>
      {event && (
        <p className="text-muted">
          {event.title} &middot; {formatDate(event.event_date)} &middot; {event.registered} / {event.capacity} registered
        </p>
      )}
      {message.text && <div className={`alert alert-${message.type}`}>{message.text}</div>}

      {participants.length === 0 ? (
        <p className="text-muted">No one has registered yet.</p>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table table-hover mb-0 align-middle">
              <thead className="table-light">
                <tr><th>#</th><th>Name</th><th>Email</th><th>USN</th><th>Department</th><th>Registered on</th><th></th></tr>
              </thead>
              <tbody>
                {participants.map((p, i) => (
                  <tr key={p.id}>
                    <td>{i + 1}</td>
                    <td>{p.name}</td>
                    <td>{p.email}</td>
                    <td>{p.usn || '-'}</td>
                    <td>{p.department || '-'}</td>
                    <td className="small">{formatDate(p.registered_at)}</td>
                    <td><button className="btn btn-sm btn-outline-danger" onClick={() => handleRemove(p)}>Remove</button></td>
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

export default Participants
