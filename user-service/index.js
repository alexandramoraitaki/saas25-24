// user-service/index.js

const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
const { getChannel } = require('@clearsky/common');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// ⬇️ POST /users/upload – ανέβασμα Excel & δημοσίευση event
app.post('/users/upload', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { range: 2 });

    const chan = await getChannel();  // RabbitMQ channel once

    for (const row of data) {
      const rawId = row["Αριθμός Μητρώου"];
      const studentId = String(rawId).padStart(8, '0');
      const hash = await bcrypt.hash(studentId, 10);

      const result = await pool.query(
        `INSERT INTO users (student_id, full_name, email, password_hash, role)
         VALUES ($1, $2, $3, $4, $5)
         ON CONFLICT (email) DO UPDATE
           SET student_id    = EXCLUDED.student_id,
               password_hash = EXCLUDED.password_hash
         RETURNING user_id`,
        [
          studentId,
          row["Ονοματεπώνυμο"],
          row["Ακαδημαϊκό E-mail"],
          hash,
          row["Ρόλος"] || 'student'
        ]
      );
      const userId = result.rows[0].user_id;

      // publish a user.uploaded event
      chan.publish(
        'clearSKY.events',
        'users.uploaded',
        Buffer.from(JSON.stringify({
          userId,
          studentId,
          email: row["Ακαδημαϊκό E-mail"],
          role: row["Ρόλος"] || 'student'
        }))
      );
    }

    res.send('Users uploaded successfully!');
  } catch (err) {
    console.error('[UPLOAD ERROR]', err);
    res.status(500).send('Upload failed');
  }
});

// ⬇️ GET /users – φιλτράρει κατά role (προαιρετικό query ?role=student)
app.get('/users', async (req, res) => {
  const { role } = req.query;
  try {
    let query = 'SELECT user_id, student_id, full_name, email, role FROM users';
    const vals = [];
    if (role) {
      query += ' WHERE role = $1';
      vals.push(role);
    }
    const result = await pool.query(query, vals);
    res.json(result.rows);
  } catch (err) {
    console.error('[GET USERS ERROR]', err);
    res.status(500).send('Failed to fetch users');
  }
});

// ⬇️ GET /users/:id – άντληση ενός χρήστη
app.get('/users/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      'SELECT user_id, student_id, full_name, email, role FROM users WHERE user_id = $1',
      [id]
    );
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    res.json(result.rows[0]);
  } catch (err) {
    console.error('[GET USER ERROR]', err);
    res.status(500).send('Failed to fetch user');
  }
});

// ⬇️ POST /login – έλεγχος credentials
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).send('Invalid credentials');
    }
    const user = result.rows[0];
    console.log('[LOGIN] fetched user:', { email: user.email, hash: user.password_hash });

    // συγκρίνουμε raw & padded password
    let match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      const padded = String(password).padStart(8, '0');
      match = await bcrypt.compare(padded, user.password_hash);
    }

    if (!match) {
      return res.status(401).send('Invalid credentials');
    }

    res.json({
      message: 'Login successful',
      user_id: user.user_id,
      student_id: String(user.student_id).padStart(8, '0'),
      role: user.role,
      full_name: user.full_name,
      email: user.email
    });
  } catch (err) {
    console.error('[LOGIN ERROR]', err);
    res.status(500).send(err.message || 'Login failed');
  }
});

// ⬇️ PATCH /change-password – αλλαγή κωδικού
app.patch('/change-password', async (req, res) => {
  const { email, oldPassword, newPassword } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(404).send('User not found');
    }
    const user = result.rows[0];
    const match = await bcrypt.compare(oldPassword, user.password_hash);
    if (!match) {
      return res.status(401).send('Old password incorrect');
    }

    const newHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE users SET password_hash = $1 WHERE email = $2',
      [newHash, email]
    );

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('[CHANGE PASSWORD ERROR]', err);
    res.status(500).send('Password change failed');
  }
});

app.listen(5005, () => {
  console.log('User service running on port 5005');
});