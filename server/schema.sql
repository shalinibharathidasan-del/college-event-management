-- College Event Management System - database schema

CREATE TABLE IF NOT EXISTS users (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  name          VARCHAR(100) NOT NULL,
  email         VARCHAR(100) NOT NULL UNIQUE,
  usn           VARCHAR(15),
  department    VARCHAR(50),
  password_hash VARCHAR(100) NOT NULL,
  role          ENUM('student', 'admin') NOT NULL DEFAULT 'student',
  created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS events (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  title       VARCHAR(150) NOT NULL,
  type        ENUM('Workshop', 'Seminar', 'FDP', 'Technical') NOT NULL,
  description TEXT,
  speaker     VARCHAR(100),
  venue       VARCHAR(100) NOT NULL,
  event_date  DATETIME NOT NULL,
  capacity    INT NOT NULL DEFAULT 50,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS registrations (
  id            INT AUTO_INCREMENT PRIMARY KEY,
  user_id       INT NOT NULL,
  event_id      INT NOT NULL,
  registered_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY one_registration (user_id, event_id),
  FOREIGN KEY (user_id)  REFERENCES users(id)  ON DELETE CASCADE,
  FOREIGN KEY (event_id) REFERENCES events(id) ON DELETE CASCADE
);
