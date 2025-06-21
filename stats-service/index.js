// stats-service/index.js

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
const { getChannel } = require('@clearsky/common');

const app = express();
app.use(cors());
app.use(express.json());

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

// --- Bootstrap RabbitMQ consumer with retry logic ---
async function startConsumer(retries = 5, delayMs = 3000) {
  try {
    const chan = await getChannel();
    const queueName = 'stats.recalc';

    // ensure durable queue exists and bind it to the “grades.uploaded” routing key
    await chan.assertQueue(queueName, { durable: true });
    await chan.bindQueue(queueName, 'clearSKY.events', 'grades.uploaded');

    chan.consume(queueName, async msg => {
      try {
        const { className, semester } = JSON.parse(msg.content.toString());

        const { rows } = await pool.query(
          `SELECT
             COUNT(*)                       AS count,
             ROUND(AVG(grade)::numeric, 2)  AS average,
             MIN(grade)                     AS min,
             MAX(grade)                     AS max
           FROM grades
           WHERE class_name = $1
             AND semester   = $2`,
          [className, semester]
        );

        console.log(`📊 Recalculated stats for ${className} (sem ${semester}):`, rows[0]);
        chan.ack(msg);
      } catch (err) {
        console.error('❌ Error recalculating stats:', err);
        chan.nack(msg, false, true);
      }
    });

    console.log('📥 Stats-service consumer listening on grades.uploaded');
  } catch (err) {
    if (retries > 0) {
      console.warn(`RabbitMQ not ready, retrying in ${delayMs}ms… (${retries} retries left)`);
      setTimeout(() => startConsumer(retries - 1, delayMs), delayMs);
    } else {
      console.error('❌ Could not start stats consumer:', err);
      process.exit(1);
    }
  }
}

startConsumer();

// --- HTTP endpoints ---

// GET /stats/:class_name — summary stats
app.get('/stats/:class_name', async (req, res) => {
  try {
    const { class_name } = req.params;
    const { rows } = await pool.query(
      `SELECT
         COUNT(*)                       AS count,
         ROUND(AVG(grade)::numeric, 2)  AS average,
         MIN(grade)                     AS min,
         MAX(grade)                     AS max
       FROM grades
       WHERE class_name = $1`,
      [class_name]
    );
    res.json(rows[0]);
  } catch (err) {
    console.error('[GET /stats/:class_name] Error:', err);
    res.status(500).send('Failed to compute stats');
  }
});

// GET /stats/:class_name/histogram — histogram data
app.get('/stats/:class_name/histogram', async (req, res) => {
  try {
    const { class_name } = req.params;
    const { rows } = await pool.query(
      `SELECT
         grade::int AS grade,
         COUNT(*)    AS count
       FROM grades
       WHERE class_name = $1
       GROUP BY grade
       ORDER BY grade`,
      [class_name]
    );
    res.json(rows.map(r => ({
      grade: Number(r.grade),
      count: Number(r.count)
    })));
  } catch (err) {
    console.error('[GET /stats/:class_name/histogram] Error:', err);
    res.status(500).send('Failed to generate histogram');
  }
});

app.listen(5004, () => {
  console.log('Stats service running on port 5004');
});
