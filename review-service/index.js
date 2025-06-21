// review-service/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getChannel } = require('@clearsky/common');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function getUserFromHeaders(req) {
  return {
    email: req.headers['x-user-email'],
    role: req.headers['x-user-role']
  };
}

// --- Consumer startup with retry logic ---
async function startConsumer(retries = 5, delayMs = 3000) {
  try {
    const chan = await getChannel();
    const queue = 'review.requests';

    // make sure exchange & queue exist and bind them
    await chan.assertQueue(queue, { durable: true });
    await chan.bindQueue(queue, 'clearSKY.events', 'grades.uploaded');

    chan.consume(queue, async msg => {
      try {
        const { studentId, className, semester } = JSON.parse(msg.content.toString());

        await pool.query(
          `INSERT INTO review_requests (grade_id, student_id, class_name, semester, status)
           VALUES (
             (SELECT grades_id FROM grades WHERE student_id=$1 AND class_name=$2 AND semester=$3),
             $1, $2, $3, 'pending'
           )`,
          [studentId, className, semester]
        );

        console.log(`➕ Auto-created review request for ${studentId} / ${className}`);
        chan.ack(msg);
      } catch (err) {
        console.error('❌ Error handling grades.uploaded event:', err);
        chan.nack(msg, false, true);
      }
    });

    console.log('📥 Review-service consumer listening on grades.uploaded');
  } catch (err) {
    if (retries > 0) {
      console.warn(`RabbitMQ not ready, retrying in ${delayMs}ms… (${retries} retries left)`);
      setTimeout(() => startConsumer(retries - 1, delayMs), delayMs);
    } else {
      console.error('❌ Could not establish RabbitMQ consumer:', err);
      process.exit(1);
    }
  }
}
startConsumer();

// --- HTTP endpoints remain unchanged ---

// POST /reviews – student submits a manual request
app.post('/reviews', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'student') return res.status(403).send('Forbidden: Only students');
  const { grade_id, reason } = req.body;
  try {
    const { rowCount, rows } = await pool.query(
      'SELECT user_id FROM users WHERE email=$1',
      [user.email]
    );
    if (rowCount === 0) return res.status(404).send('Student not found');
    const student_id = rows[0].user_id;

    await pool.query(
      `INSERT INTO review_requests (grade_id, student_id, reason, status)
       VALUES ($1, $2, $3, 'pending')`,
      [grade_id, student_id, reason]
    );
    res.send('Review request submitted');
  } catch (err) {
    console.error('[POST /reviews] Error:', err);
    res.status(500).send('Failed to submit review request');
  }
});

// GET /reviews/class/:name – teacher views pending requests for a class
app.get('/reviews/class/:name', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') return res.status(403).send('Forbidden: Only teachers');
  try {
    const { rows } = await pool.query(
      `SELECT r.review_id, r.reason, r.status, r.response,
              g.class_name, g.semester, g.grade
       FROM review_requests r
       JOIN grades g ON r.grade_id = g.grades_id
       WHERE g.class_name = $1 AND r.status = 'pending'`,
      [req.params.name]
    );
    res.json(rows);
  } catch (err) {
    console.error('[GET /reviews/class/:name] Error:', err);
    res.status(500).send('Failed to fetch review requests');
  }
});

// PATCH /reviews/:id – teacher responds to a request
app.patch('/reviews/:id', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') return res.status(403).send('Forbidden: Only teachers');
  const { status, response, new_grade } = req.body;
  try {
    const { rowCount, rows } = await pool.query(
      `UPDATE review_requests
         SET status = $1, response = $2, responded_at = CURRENT_TIMESTAMP
       WHERE review_id = $3
       RETURNING grade_id`,
      [status, response, req.params.id]
    );
    if (rowCount === 0) return res.status(404).send('Review not found');
    const gradeId = rows[0].grade_id;
    if (status === 'accepted' && new_grade != null) {
      await pool.query(
        'UPDATE grades SET grade = $1 WHERE grades_id = $2',
        [new_grade, gradeId]
      );
    }
    res.send('Review updated');
  } catch (err) {
    console.error('[PATCH /reviews/:id] Error:', err);
    res.status(500).send('Failed to update review');
  }
});

// GET /reviews/student – student views their own requests
app.get('/reviews/student', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'student') return res.status(403).send('Forbidden: Only students');
  try {
    const { rowCount, rows } = await pool.query(
      'SELECT user_id FROM users WHERE email=$1',
      [user.email]
    );
    if (rowCount === 0) return res.status(404).send('Student not found');
    const userId = rows[0].user_id;

    const { rows: reviews } = await pool.query(
      `SELECT r.review_id, r.reason, r.status, r.response,
              g.class_name, g.semester, g.grade
       FROM review_requests r
       JOIN grades g ON r.grade_id = g.grades_id
       WHERE r.student_id = $1
       ORDER BY r.review_id DESC`,
      [userId]
    );
    res.json(reviews);
  } catch (err) {
    console.error('[GET /reviews/student] Error:', err);
    res.status(500).send('Failed to fetch review status');
  }
});

app.listen(5006, () => {
  console.log('Review service running on port 5006');
});
