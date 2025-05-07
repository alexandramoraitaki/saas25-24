const express = require('express');
const multer = require('multer');
const xlsx = require('xlsx');
const { Pool } = require('pg');
require('dotenv').config();

const app = express();
const upload = multer({ dest: 'uploads/' });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.post('/grades/upload', upload.single('file'), async (req, res) => {
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

app.get('/grades/student/:id', async (req, res) => {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM grades WHERE student_id = $1', [id]);
    res.json(result.rows);
});

app.listen(5003, () => {
    console.log('Grades service running on port 5003');
});
