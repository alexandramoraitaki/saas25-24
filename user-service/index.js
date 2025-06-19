const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(express.json());

// Upload χρηστών από Excel
app.post('/users/upload', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { range: 2 });

   for (const row of data) {
  // rawId μπορεί να είναι 3184623 ή "03184623"
  const rawId = row["Αριθμός Μητρώου"];
  const studentId = String(rawId).padStart(8, '0');  
  const hash = await bcrypt.hash(studentId, 10);

  await pool.query(
    `INSERT INTO users (student_id, full_name, email, password_hash, role)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (email) DO NOTHING`,
    [ studentId, row["Ονοματεπώνυμο"], row["Ακαδημαϊκό E-mail"], hash, row["Ρόλος"] || 'student' ]
  );
}


    res.send('Users uploaded successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
});

app.listen(5005, () => {
  console.log('User service running on port 5005');
});

// GET /users
app.get('/users', async (req, res) => {
  const { role } = req.query;

  try {
    let query = 'SELECT user_id, student_id, full_name, email, role FROM users';
    let values = [];

    if (role) {
      query += ' WHERE role = $1';
      values.push(role);
    }

    const result = await pool.query(query, values);
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch users');
  }
});

// GET /users/:id
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
    console.error(err);
    res.status(500).send('Failed to fetch user');
  }
});

// POST /login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);

    if (result.rows.length === 0) {
      return res.status(401).send('Invalid credentials');
    }

    const user = result.rows[0];
    const match = await bcrypt.compare(password, user.password_hash);

    if (!match) {
      return res.status(401).send('Invalid credentials');
    }

    res.json({
      message: 'Login successful',
      user_id: user.user_id,
      student_id: user.student_id,
      role: user.role,
      full_name: user.full_name,
      email: user.email
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Login failed');
  }
});

// PATCH /change-password
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

    res.send('Password updated successfully');
  } catch (err) {
    console.error(err);
    res.status(500).send('Password change failed');
  }
});

