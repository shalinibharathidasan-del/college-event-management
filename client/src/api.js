// Small fetch wrapper: adds the JWT token and turns error responses into exceptions
export async function api(path, { method = 'GET', body } = {}) {
  const token = localStorage.getItem('token')
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `Request failed (${res.status})`)
  return data
}

export const EVENT_TYPES = ['Workshop', 'Seminar', 'FDP', 'Technical']

export const TYPE_COLORS = {
  Workshop: 'primary',
  Seminar: 'success',
  FDP: 'warning',
  Technical: 'danger',
}

// '2026-11-12 10:00:00' -> 'Thu, 12 Nov 2026, 10:00 am'
export function formatDate(value) {
  return new Date(value.replace(' ', 'T')).toLocaleString('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export const isPast = (value) => new Date(value.replace(' ', 'T')) < new Date()
