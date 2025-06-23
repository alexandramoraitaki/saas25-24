// grades-service/index.js
require('dotenv').config();
const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { Pool } = require('pg');
const { getChannel } = require('@clearsky/common');

const normalize = s =>
  String(s || '')
    .replace(/\s+/g, ' ')
    .trim();

const cors = require('cors');

const app = express();
app.use(express.json());

app.use(cors());

const upload = multer({ dest: 'uploads/' });
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

function getUserFromHeaders(req) {
  return {
    email: req.headers['x-user-email'],
    role: req.headers['x-user-role']
  };
}

let chanPromise = null;
async function getChan() {
  if (!chanPromise) {
    chanPromise = getChannel();
  }
  return chanPromise;
}

// ─── 2) Check-initial endpoint ──────────────────────────────────────────────────
// must come BEFORE /grades/upload etc.
app.get('/grades/check-initial', async (req, res) => {
  console.log('>>> GET /grades/check-initial hit', req.query);
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') {
    return res.status(403).send('Forbidden');
  }

  const course = req.query.course;
  const semester = req.query.semester;
  if (!course || !semester) {
    return res.status(400).send('Missing course or semester');
  }

  try {
    const { rows } = await pool.query(
      `SELECT COUNT(*)::int AS count
         FROM grades
        WHERE class_name = $1
          AND semester   = $2`,
      [course, semester]
    );
    return res.json({ count: rows[0].count });
  } catch (err) {
    console.error('Error checking initial grades:', err);
    return res.status(500).send('Internal error');
  }
});


// --- 1) Upload initial grades
app.post('/grades/upload', upload.single('file'), async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') return res.status(403).send('Forbidden');

  // έλεγχος στο DB ότι είναι teacher
  const { rows: teachers } = await pool.query(
    'SELECT 1 FROM users WHERE email=$1 AND role=$2',
    [user.email, 'teacher']
  );
  if (!teachers.length) return res.status(403).send('Forbidden');

  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet, { range: 2 });

    const chan = await getChan();

    for (const row of data) {
      const rawId = row['Αριθμός Μητρώου'];
      const studentId = String(rawId).padStart(8, '0');
      const className = normalize(row['Τμήμα Τάξης']);
      const semester = normalize(row['Περίοδος δήλωσης']);

      // 1. αποθήκευση
      await pool.query(
        `INSERT INTO grades (
     student_id, full_name, email, semester, class_name,
     grading_scale, grade, uploaded_by
   ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
        [
          studentId,
          row["Ονοματεπώνυμο"],
          row["Ακαδημαϊκό E-mail"],
          semester,     // <- normalized
          className,    // <- normalized
          row["Κλίμακα βαθμολόγησης"],
          row["Βαθμολογία"],
          user.email
        ]
      );

      // 2. publish initial event
      chan.publish(
        'clearSKY.events',
        'grades.initial',
        Buffer.from(JSON.stringify({ studentId, className, semester }))
      );
    }

    res.send('Grades uploaded successfully!');
  } catch (err) {
    console.error(err);
    res.status(500).send('Upload failed');
  }
});

// --- 2) Finalize & publish final event
app.patch('/grades/finalize/class/:name/semester/:sem', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'teacher') return res.status(403).send('Forbidden');

  const { rows: teachers } = await pool.query(
    'SELECT 1 FROM users WHERE email=$1 AND role=$2',
    [user.email, 'teacher']
  );
  if (!teachers.length) return res.status(403).send('Forbidden');

  const { name, sem } = req.params;

  try {
    const result = await pool.query(
      `UPDATE grades
         SET finalized = true
       WHERE class_name=$1 AND semester=$2`,
      [name, sem]
    );
    if (result.rowCount === 0) {
      return res.status(404).send('No grades to finalize');
    }

    // publish final event
    const chan = await getChan();
    chan.publish(
      'clearSKY.events',
      'grades.final',
      Buffer.from(JSON.stringify({ className: name, semester: sem }))
    );

    res.send(`Finalized ${result.rowCount} grades for ${name} (${sem})`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Finalization failed');
  }
});

// --- Bulk‐update grades from Excel, with protected RabbitMQ publish ---
app.patch(
  '/grades/update',
  upload.single('file'),
  async (req, res) => {
    console.log('>>> PATCH /grades/update hit');
    const user = getUserFromHeaders(req);
    if (user.role !== 'teacher') {
      return res.status(403).send('Forbidden: Only teachers');
    }

    // Verify teacher in DB
    const { rows: teachers } = await pool.query(
      'SELECT 1 FROM users WHERE email=$1 AND role=$2',
      [user.email, 'teacher']
    );
    if (!teachers.length) {
      return res.status(403).send('Forbidden: Invalid teacher credentials');
    }

    try {
      // 1) Read the Excel file
      const workbook = xlsx.readFile(req.file.path);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = xlsx.utils.sheet_to_json(sheet, { range: 2 });

      // Normalize helper and extract course/period from fixed cells
      const normalize = s => String(s || '').replace(/\s+/g, ' ').trim();
      const course = normalize(sheet['E4']?.v);
      const period = normalize(sheet['D4']?.v);

      // 2) Loop through rows and UPDATE only changed grades
      let updated = 0;
      for (const row of rows) {
        const studentId = String(row['Αριθμός Μητρώου'] || '').padStart(8, '0');
        const newGrade = row['Βαθμολογία'];

        const cur = await pool.query(
          `SELECT grade
             FROM grades
            WHERE student_id = $1
              AND class_name  = $2
              AND semester    = $3`,
          [studentId, course, period]
        );

        if (cur.rowCount && cur.rows[0].grade !== newGrade) {
          await pool.query(
            `UPDATE grades
               SET grade       = $1,
                   uploaded_by = $2
             WHERE student_id = $3
               AND class_name  = $4
               AND semester    = $5`,
            [newGrade, user.email, studentId, course, period]
          );
          updated++;
        }
      }

      // 3) Publish RabbitMQ event, but don’t let failures block the response
      const chan = await getChan();
      try {
        chan.publish(
          'clearSKY.events',
          'grades.updated',
          Buffer.from(JSON.stringify({ className: course, semester: period }))
        );
      } catch (mqErr) {
        console.error('RabbitMQ publish failed, continuing without blocking:', mqErr);
      }

      // 4) Send success response to client
      return res.send(`Updated ${updated} grades.`);
    } catch (err) {
      console.error('Bulk update failed:', err);
      return res.status(500).send('Bulk update failed');
    }
  }
);

// --- 3) Ανακτήσεις χωρίς RabbitMQ
app.get('/grades/class/:name', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM grades WHERE class_name=$1',
      [req.params.name]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching class grades');
  }
});

app.get('/grades/student/:id', async (req, res) => {
  const user = getUserFromHeaders(req);
  if (user.role !== 'student' || user.email !== req.headers['x-user-email']) {
    return res.status(403).send('Forbidden');
  }
  try {
    const { rows } = await pool.query(
      'SELECT * FROM grades WHERE student_id=$1',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching student grades');
  }
});

app.get('/grades/semester/:id', async (req, res) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM grades WHERE semester=$1',
      [req.params.id]
    );
    res.json(rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching semester grades');
  }
});

app.get('/grades/teacher/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      'SELECT * FROM grades WHERE uploaded_by = $1',
      [email]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error fetching teacher grades');
  }
});

app.listen(5003, () =>
  console.log('Grades service running on port 5003')
);