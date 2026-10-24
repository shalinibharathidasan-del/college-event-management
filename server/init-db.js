// Creates the database and tables, then adds an admin, a sample student and sample events.
// Run once: npm run init-db
const fs = require('fs')
const path = require('path')
const mysql = require('mysql2/promise')
const bcrypt = require('bcryptjs')

const DB_NAME = process.env.DB_NAME || 'college_events'

// Demo logins for trying the app locally (also listed in README)
const DEMO_USERS = [
  { name: 'Admin', email: 'admin@college.edu', password: 'admin123', role: 'admin' },
  { name: 'Ananya Rao', email: 'ananya@college.edu', password: 'student123', role: 'student', usn: '1DS24MC001', department: 'MCA' },
]

const EVENTS = [
  ['React & Node.js Hands-on Workshop', 'Workshop', 'Build a full stack app with React, Express and MySQL in one day.', 'Dr. Kavya Menon', 'Lab 3, MCA Block', '2026-11-12 10:00:00', 40],
  ['Cloud Computing Seminar', 'Seminar', 'Introduction to cloud services, deployment models and careers in cloud.', 'Mr. Arjun Iyer (AWS)', 'Seminar Hall A', '2026-11-18 14:00:00', 120],
  ['FDP on Machine Learning', 'FDP', 'Five-day faculty development programme on ML fundamentals and teaching practice.', 'Prof. S. Raghavan', 'Conference Room 2', '2026-12-01 09:30:00', 30],
  ['CodeSprint Hackathon', 'Technical', '24-hour coding contest. Teams of up to 3 students.', 'Coding Club', 'Main Auditorium', '2026-12-10 09:00:00', 100],
  ['Cyber Security Awareness Talk', 'Seminar', 'Safe practices online, common attacks and how to defend against them.', 'Ms. Neha Kulkarni', 'Seminar Hall B', '2026-11-25 11:00:00', 80],
]

async function main() {
  const conn = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 3306,
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    multipleStatements: true,
  })

  await conn.query(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``)
  await conn.changeUser({ database: DB_NAME })
  await conn.query(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'))
  console.log(`Database "${DB_NAME}" and tables ready`)

  for (const u of DEMO_USERS) {
    const hash = await bcrypt.hash(u.password, 10)
    await conn.execute(
      'INSERT IGNORE INTO users (name, email, usn, department, password_hash, role) VALUES (?, ?, ?, ?, ?, ?)',
      [u.name, u.email, u.usn || null, u.department || null, hash, u.role],
    )
  }
  console.log('Demo users added: admin@college.edu / admin123, ananya@college.edu / student123')

  const [[{ count }]] = await conn.query('SELECT COUNT(*) AS count FROM events')
  if (count === 0) {
    await conn.query(
      'INSERT INTO events (title, type, description, speaker, venue, event_date, capacity) VALUES ?',
      [EVENTS],
    )
    console.log(`${EVENTS.length} sample events added`)
  } else {
    console.log('Events already exist, skipping sample events')
  }

  await conn.end()
}

main().catch((err) => {
  console.error('Setup failed:', err.sqlMessage || err.message)
  process.exit(1)
})
