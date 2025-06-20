const express = require('express');
const cors    = require('cors'); 
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());  
app.use(express.json());

function getUserFromHeaders(req) {
  return {
    email: req.headers['x-user-email'],
    role: req.headers['x-user-role']
  };
}

// POST /reviews - Φοιτητής στέλνει αίτημα
app.post('/reviews', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'student') {
    return res.status(403).send('Forbidden: Only students can submit review requests');
  }

  const { grade_id, reason } = req.body;

  try {
    // Βρες τον student_id από το email του χρήστη
    const userRes = await pool.query(
      `SELECT user_id FROM users WHERE email = $1`,
      [user.email]
    );

    if (userRes.rowCount === 0) {
      return res.status(404).send('Student not found');
    }

    const student_id = userRes.rows[0].user_id;

    console.log('🟢 Νέο αίτημα:', {
  email: user.email,
  grade_id,
  reason
});
    
    await pool.query(
      `INSERT INTO review_requests (grade_id, student_id, reason)
       VALUES ($1, $2, $3)`,
      [grade_id, student_id, reason]
    );
    res.send('Review request submitted');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to submit review request');
  }
});

// GET /reviews/class/:name - Καθηγητής βλέπει αιτήματα
app.get('/reviews/class/:name', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') {
    return res.status(403).send('Forbidden: Only teachers can view review requests');
  }

  const { name } = req.params;

  try {
    const result = await pool.query(
      `SELECT r.*, g.class_name, g.semester, g.grade
       FROM review_requests r
       JOIN grades g ON r.grade_id = g.grades_id
       WHERE g.class_name = $1 AND r.status = 'pending'`,
      [name]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to fetch review requests');
  }
});

// PATCH /reviews/:id - Καθηγητής απαντά
app.patch('/reviews/:id', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') {
    return res.status(403).send('Forbidden: Only teachers can respond to reviews');
  }


  const { id } = req.params;
  const { status, response, new_grade } = req.body;


  try {
    // 1. Ενημέρωσε το review και πάρε το grade_id που σχετίζεται
    const reviewUpdate = await pool.query(
      `UPDATE review_requests
       SET status = $1, response = $2, responded_at = CURRENT_TIMESTAMP
       WHERE review_id = $3
       RETURNING grade_id`,
      [status, response, id]
    );


    if (reviewUpdate.rowCount === 0) {
      return res.status(404).send('Review request not found');
    }


    const gradeId = reviewUpdate.rows[0].grade_id;


    // 2. Αν accepted και υπάρχει new_grade → ενημέρωσε και τον βαθμό
    if (status === 'accepted' && new_grade !== undefined) {
      await pool.query(
        `UPDATE grades SET grade = $1 WHERE grades_id = $2`,
        [new_grade, gradeId]
      );
    }


    res.send('Review request updated');
  } catch (err) {
    console.error(err);
    res.status(500).send('Failed to update review');
  }
});

// 👉 ΠΡΟΣΘΕΣΕ αυτό πριν το app.listen

// GET  /reviews/student   – όλα τα αιτήματα του τρέχοντος φοιτητή
app.get('/reviews/student', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'student') return res.sendStatus(403);

  try {
    /* 1. βρίσκουμε το user_id (INTEGER) */
    const { rows } = await pool.query(
      'SELECT user_id FROM users WHERE email = $1', [user.email]
    );
    if (rows.length === 0) return res.status(404).send('Student not found');
    const userId = rows[0].user_id;           // π.χ. 11

    /* 2. Φέρνουμε ΟΛΑ τα review-requests */
    const reviews = await pool.query(
      `SELECT r.review_id,
              r.reason,
              r.status,          -- pending | accepted | rejected
              r.response,
              g.class_name,
              g.semester,
              g.grade            -- ΤΩΡΙΝΟΣ βαθμός (αν άλλαξε, φαίνεται εδώ)
       FROM   review_requests r
       JOIN   grades g ON r.grade_id = g.grades_id
       WHERE  r.student_id = $1::text
       ORDER  BY r.review_id DESC`,
      [userId]
    );

    res.json(reviews.rows);
  } catch (err) {
    console.error('SQL-ERROR:', err.message);
    res.status(500).send('Failed to fetch review status');
  }
});


app.listen(5006, () => {
  console.log('Review service running on port 5006');
});
