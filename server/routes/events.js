// Events: listing, search, details, admin management, registration and participants
const express = require('express')
const pool = require('../db')
const { requireLogin, requireAdmin } = require('../middleware/auth')

const router = express.Router()
const TYPES = ['Workshop', 'Seminar', 'FDP', 'Technical']

// Number of registrations is added to every event
const EVENT_SELECT = `
  SELECT e.*, COUNT(r.id) AS registered
  FROM events e
  LEFT JOIN registrations r ON r.event_id = e.id`

function validateEvent(body) {
  const { title, type, description, speaker, venue, event_date, capacity } = body
  if (!title?.trim() || !venue?.trim() || !event_date) return 'Title, venue and date are required'
  if (!TYPES.includes(type)) return `Type must be one of: ${TYPES.join(', ')}`
  if (!(Number(capacity) > 0)) return 'Capacity must be a positive number'
  return [title.trim(), type, description?.trim() || '', speaker?.trim() || null, venue.trim(), event_date.replace('T', ' '), Number(capacity)]
}

// GET /api/events?search=react&type=Workshop
router.get('/', async (req, res) => {
  const { search = '', type = '' } = req.query
  const params = [`%${search}%`, `%${search}%`, `%${search}%`]
  let where = 'WHERE (e.title LIKE ? OR e.description LIKE ? OR e.speaker LIKE ?)'
  if (type) {
    where += ' AND e.type = ?'
    params.push(type)
  }
  const [events] = await pool.execute(`${EVENT_SELECT} ${where} GROUP BY e.id ORDER BY e.event_date`, params)
  res.json(events)
})

// GET /api/events/:id
router.get('/:id', async (req, res) => {
  const [[event]] = await pool.execute(`${EVENT_SELECT} WHERE e.id = ? GROUP BY e.id`, [req.params.id])
  if (!event) return res.status(404).json({ error: 'Event not found' })
  res.json(event)
})

// ---------- Event management (admin) ----------

// POST /api/events
router.post('/', requireAdmin, async (req, res) => {
  const values = validateEvent(req.body)
  if (typeof values === 'string') return res.status(400).json({ error: values })
  const [result] = await pool.execute(
    'INSERT INTO events (title, type, description, speaker, venue, event_date, capacity) VALUES (?, ?, ?, ?, ?, ?, ?)',
    values,
  )
  res.status(201).json({ id: result.insertId })
})

// PUT /api/events/:id
router.put('/:id', requireAdmin, async (req, res) => {
  const values = validateEvent(req.body)
  if (typeof values === 'string') return res.status(400).json({ error: values })
  const [result] = await pool.execute(
    'UPDATE events SET title = ?, type = ?, description = ?, speaker = ?, venue = ?, event_date = ?, capacity = ? WHERE id = ?',
    [...values, req.params.id],
  )
  if (!result.affectedRows) return res.status(404).json({ error: 'Event not found' })
  res.json({ message: 'Event updated' })
})

// DELETE /api/events/:id (registrations are removed by ON DELETE CASCADE)
router.delete('/:id', requireAdmin, async (req, res) => {
  const [result] = await pool.execute('DELETE FROM events WHERE id = ?', [req.params.id])
  if (!result.affectedRows) return res.status(404).json({ error: 'Event not found' })
  res.json({ message: 'Event deleted' })
})

// ---------- Online registration (students) ----------

// POST /api/events/:id/register
router.post('/:id/register', requireLogin, async (req, res) => {
  const [[event]] = await pool.execute(`${EVENT_SELECT} WHERE e.id = ? GROUP BY e.id`, [req.params.id])
  if (!event) return res.status(404).json({ error: 'Event not found' })
  if (new Date(event.event_date.replace(' ', 'T')) < new Date()) {
    return res.status(400).json({ error: 'This event has already taken place' })
  }
  if (event.registered >= event.capacity) return res.status(400).json({ error: 'Sorry, this event is full' })

  try {
    await pool.execute('INSERT INTO registrations (user_id, event_id) VALUES (?, ?)', [req.user.id, event.id])
  } catch (err) {
    if (err.code === 'ER_DUP_ENTRY') return res.status(409).json({ error: 'You are already registered' })
    throw err
  }
  res.status(201).json({ message: `Registered for ${event.title}` })
})

// DELETE /api/events/:id/register (cancel own registration)
router.delete('/:id/register', requireLogin, async (req, res) => {
  const [result] = await pool.execute('DELETE FROM registrations WHERE user_id = ? AND event_id = ?', [
    req.user.id,
    req.params.id,
  ])
  if (!result.affectedRows) return res.status(404).json({ error: 'You are not registered for this event' })
  res.json({ message: 'Registration cancelled' })
})

// ---------- Participant management (admin) ----------

// GET /api/events/:id/participants
router.get('/:id/participants', requireAdmin, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT u.id, u.name, u.email, u.usn, u.department, r.registered_at
     FROM registrations r JOIN users u ON u.id = r.user_id
     WHERE r.event_id = ? ORDER BY r.registered_at`,
    [req.params.id],
  )
  res.json(rows)
})

// DELETE /api/events/:id/participants/:userId
router.delete('/:id/participants/:userId', requireAdmin, async (req, res) => {
  const [result] = await pool.execute('DELETE FROM registrations WHERE event_id = ? AND user_id = ?', [
    req.params.id,
    req.params.userId,
  ])
  if (!result.affectedRows) return res.status(404).json({ error: 'Participant not found' })
  res.json({ message: 'Participant removed' })
})

module.exports = router
