-- 01-create-tables.sql
CREATE TABLE IF NOT EXISTS grades (
  grades_id     SERIAL PRIMARY KEY,
  student_id    VARCHAR(20),
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL,
  semester      VARCHAR(50),
  class_name    TEXT,
  grading_scale TEXT,
  grade         NUMERIC,
  uploaded_at   TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  finalized     BOOLEAN     DEFAULT FALSE,
  uploaded_by   TEXT
);

CREATE TABLE IF NOT EXISTS review_requests (
  review_id    SERIAL PRIMARY KEY,
  grade_id     INT REFERENCES grades(grades_id) ON DELETE CASCADE,
  student_id   VARCHAR(20),
  reason       TEXT,
  status       VARCHAR(20) DEFAULT 'pending',
  response     TEXT,
  submitted_at TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  responded_at TIMESTAMP
);

CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL PRIMARY KEY,
  student_id    VARCHAR(20),
  full_name     TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,
  password_hash TEXT        NOT NULL,
  role          TEXT        NOT NULL CHECK (role IN ('teacher','student')),
  created_at    TIMESTAMP   DEFAULT CURRENT_TIMESTAMP,
  institution   TEXT
);
