# College Event Management System

MMCA314D – Web Development Using Full Stack Open — **Assignment 2, Question 2**

A full stack app where students view and register for workshops, seminars, FDPs and technical events, and admins manage events and participants.

**Stack:** React (Vite) · React Router · Bootstrap · Node.js · Express · MySQL · JWT · bcrypt

## Features

| Feature | Who | Where |
|---|---|---|
| User registration / login | Everyone | `/register`, `/login` |
| Event listing | Everyone | `/` (home) |
| Event search (text + type filter) | Everyone | `/` |
| Event details | Everyone | `/events/:id` |
| Online registration / cancel | Students | Event details page |
| Registration history | Students | `/my-registrations` |
| Event management (create, edit, delete) | Admin | `/admin/events` |
| Participant management (view, remove) | Admin | `/admin/events/:id/participants` |

Rules enforced by the server: no double registration, no registering when an event is full or already over, and admin-only routes reject students.

## How to run

You need Node.js 20.6+ and MySQL 8 running.

**1. Server**

```bash
cd server
npm install
cp .env.example .env        # then put your MySQL password in .env
npm run init-db             # creates database, tables, demo users and sample events
npm start                   # http://localhost:5000/api
```

**2. Client** (in a second terminal)

```bash
cd client
npm install
npm run dev                 # http://localhost:5173
```

The client forwards `/api` requests to the server (see `client/vite.config.js`).

**Demo logins** (created by `npm run init-db`):

| Role | Email | Password |
|---|---|---|
| Admin | admin@college.edu | admin123 |
| Student | ananya@college.edu | student123 |

## Database design

```
users                    events                     registrations
-----                    ------                     -------------
id (PK)                  id (PK)                    id (PK)
name                     title                      user_id  (FK -> users.id)
email (unique)           type (Workshop/Seminar/    event_id (FK -> events.id)
usn                            FDP/Technical)       registered_at
department               description                UNIQUE (user_id, event_id)
password_hash            speaker
role (student/admin)     venue
created_at               event_date
                         capacity
                         created_at
```

Deleting an event or user also deletes its registrations (`ON DELETE CASCADE`). Full SQL: [server/schema.sql](server/schema.sql).

## API

| Method | Endpoint | Auth | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | – | Create student account |
| POST | `/api/auth/login` | – | Log in, returns JWT |
| GET | `/api/auth/me` | User | Current user |
| GET | `/api/events?search=&type=` | – | List / search events |
| GET | `/api/events/:id` | – | Event details |
| POST | `/api/events` | Admin | Create event |
| PUT | `/api/events/:id` | Admin | Update event |
| DELETE | `/api/events/:id` | Admin | Delete event |
| POST | `/api/events/:id/register` | User | Register for event |
| DELETE | `/api/events/:id/register` | User | Cancel registration |
| GET | `/api/registrations/my` | User | Registration history |
| GET | `/api/events/:id/participants` | Admin | List participants |
| DELETE | `/api/events/:id/participants/:userId` | Admin | Remove participant |

## Project structure

```
college-event-management/
├── server/
│   ├── index.js              Express app, routes, error handler
│   ├── db.js                 MySQL connection pool
│   ├── schema.sql            Tables
│   ├── init-db.js            Creates DB + demo data
│   ├── middleware/auth.js    JWT login / admin checks
│   └── routes/
│       ├── auth.js           Register, login, me
│       ├── events.js         Events CRUD, registration, participants
│       └── registrations.js  Registration history
└── client/
    └── src/
        ├── main.jsx          Router + AuthProvider + Bootstrap
        ├── App.jsx           Routes
        ├── api.js            fetch wrapper, date helpers
        ├── context/AuthContext.jsx
        ├── components/       Navbar, EventCard, ProtectedRoute
        └── pages/            Events, EventDetails, Login, Register,
                              MyRegistrations, admin/ManageEvents, admin/Participants
```

## Commit history

1. Add server setup: MySQL schema, connection pool and init-db seed script
2. Add user registration and login with bcrypt and JWT
3. Add event, registration and participant API routes
4. Add React client scaffold with Bootstrap, router and API proxy
5. Add login, sign up, auth context and protected routes
6. Add event listing, search, details, online registration and history
7. Add admin event management and participant management pages
8. Add README with setup, database design and API
