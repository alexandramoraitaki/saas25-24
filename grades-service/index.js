const express = require('express');
const app = express();
app.use(express.json());  
const multer = require('multer');
const xlsx = require('xlsx');
const { Pool } = require('pg');
  
require('dotenv').config();

const upload = multer({ dest: 'uploads/' });


const pool = new Pool({ connectionString: process.env.DATABASE_URL });


function getUserFromHeaders(req) {
  return {
    email: req.headers['x-user-email'],
    role: req.headers['x-user-role']
  };
}



app.post('/grades/upload', upload.single('file'), async (req, res) => {
    const user = getUserFromHeaders(req);

  if (user.role !== 'teacher') {
    return res.status(403).send('Forbidden: Only teachers can upload grades');
  }

  const check = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND role = $2',
    [user.email, 'teacher']
  );

  if (check.rows.length === 0) {
    return res.status(403).send('Forbidden: Invalid teacher credentials');
  }
    
    
    try {
        const workbook = xlsx.readFile(req.file.path);
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = xlsx.utils.sheet_to_json(sheet, { range: 2 });


        for (const row of data) {
            await pool.query(
                `INSERT INTO grades (
          student_id, full_name, email, semester, class_name, grading_scale, grade
        ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
                [
                    row["Αριθμός Μητρώου"],
                    row["Ονοματεπώνυμο"],
                    row["Ακαδημαϊκό E-mail"],
                    row["Περίοδος δήλωσης"],
                    row["Τμήμα Τάξης"],
                    row["Κλίμακα βαθμολόγησης"],
                    row["Βαθμολογία"]
                ]
            );
        }


        res.send('Grades uploaded successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Upload failed');
    }
});


app.get('/grades/class/:name', async (req, res) => {
    const { name } = req.params;


    try {
        const result = await pool.query(
            'SELECT * FROM grades WHERE class_name = $1',
            [name]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching grades for class');
    }
});




app.get('/grades/student/:id', async (req, res) => {
    const user = getUserFromHeaders(req);
    const { id } = req.params;

  if (user.role !== 'student') {
    return res.status(403).send('Forbidden: Only students can access this');
  }

  const check = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND student_id = $2 AND role = $3',
    [user.email, id, 'student']
  );

  if (check.rows.length === 0) {
    return res.status(403).send('Forbidden: You can only access your own grades');
  }

  const result = await pool.query('SELECT * FROM grades WHERE student_id = $1', [id]);
  res.json(result.rows);
});


app.get('/grades/semester/:id', async (req, res) => {
    const { id } = req.params;


    try {
        const result = await pool.query(
            'SELECT * FROM grades WHERE semester = $1',
            [id]
        );
        res.json(result.rows);
    } catch (err) {
        console.error(err);
        res.status(500).send('Error fetching semester grades');
    }
});


app.listen(5003, () => {
    console.log('Grades service running on port 5003');
});

app.patch('/grades/finalize/class/:name/semester/:sem', async (req, res) => {
  const user = getUserFromHeaders(req);

  if (user.role !== 'teacher') {
    return res.status(403).send('Forbidden: Only teachers can finalize grades');
  }

  const check = await pool.query(
    'SELECT * FROM users WHERE email = $1 AND role = $2',
    [user.email, 'teacher']
  );

  if (check.rows.length === 0) {
    return res.status(403).send('Forbidden: Invalid teacher credentials');
  }

  const { name, sem } = req.params;

  try {
    const result = await pool.query(
      'UPDATE grades SET finalized = true WHERE class_name = $1 AND semester = $2',
      [name, sem]
    );

    if (result.rowCount === 0) {
      return res.status(404).send('No grades found for this class and semester');
    }

    res.send(`Grades for class "${name}" in semester "${sem}" finalized (${result.rowCount} records).`);
  } catch (err) {
    console.error(err);
    res.status(500).send('Finalization failed');
  }
});

