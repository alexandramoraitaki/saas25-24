-- 03-seed-students.sql

-- προσωρινός πίνακας για να κάνουμε COPY
CREATE TEMP TABLE tmp_users (
  student_id    VARCHAR(20),
  full_name     TEXT,
  email         TEXT,
  plain_password TEXT,
  role          TEXT,
  institution   TEXT
);

-- φόρτωμα από CSV
COPY tmp_users(student_id, full_name, email, plain_password, role, institution)
FROM '/docker-entrypoint-initdb.d/students.csv'
WITH (FORMAT csv, HEADER true);

-- μετατροπή σε πραγματικό users με bcrypt μέσα σε Postgres
INSERT INTO users (student_id, full_name, email, password_hash, role, institution)
SELECT
  student_id,
  full_name,
  email,
  crypt(plain_password, gen_salt('bf')),
  role,
  institution
FROM tmp_users
ON CONFLICT (email) DO NOTHING;

DROP TABLE tmp_users;
