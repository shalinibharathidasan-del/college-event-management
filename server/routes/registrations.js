// Registration history for the logged-in student
const express = require('express')
const pool = require('../db')
const { requireLogin } = require('../middleware/auth')

const router = express.Router()

// GET /api/registrations/my
router.get('/my', requireLogin, async (req, res) => {
  const [rows] = await pool.execute(
    `SELECT e.id, e.title, e.type, e.venue, e.event_date, r.registered_at
     FROM registrations r JOIN events e ON e.id = r.event_id
     WHERE r.user_id = ? ORDER BY e.event_date DESC`,
    [req.user.id],
  )
  res.json(rows)
})

module.exports = router
