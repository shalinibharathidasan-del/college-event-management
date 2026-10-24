// College Event Management System - Express API
const express = require('express')
const cors = require('cors')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/api/health', (req, res) => res.json({ status: 'ok' }))
app.use('/api/auth', require('./routes/auth'))
app.use('/api/events', require('./routes/events'))
app.use('/api/registrations', require('./routes/registrations'))

app.use('/api', (req, res) => res.status(404).json({ error: 'Not found' }))

// Errors thrown in async routes end up here (Express 5 forwards them automatically)
app.use((err, req, res, next) => {
  console.error(err)
  if (err.code === 'ECONNREFUSED') return res.status(500).json({ error: 'Database is not running' })
  res.status(500).json({ error: 'Something went wrong' })
})

const PORT = Number(process.env.PORT) || 5000
app.listen(PORT, () => console.log(`API running at http://localhost:${PORT}/api`))
