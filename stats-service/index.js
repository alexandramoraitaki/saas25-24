const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

app.use(cors());
app.use(express.json());

app.get('/stats/:class_name', async (req, res) => {
    const { class_name } = req.params;


    try {
        const result = await pool.query(
            `
      SELECT
        COUNT(*) AS count,
        ROUND(AVG(grade)::numeric, 2) AS average,
        MIN(grade) AS min,
        MAX(grade) AS max
      FROM grades
      WHERE class_name = $1
      `,
            [class_name]
        );


        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to compute stats');
    }
});

app.get('/stats/:class_name/histogram', async (req, res) => {
    const { class_name } = req.params;

    try {
        const result = await pool.query(
            `
      SELECT grade::int AS grade, COUNT(*) AS count
      FROM grades
      WHERE class_name = $1
      GROUP BY grade
      ORDER BY grade ASC
      `,
            [class_name]
        );

        // Μετατροπή των αποτελεσμάτων σε int (προληπτικά)
        const data = result.rows.map(row => ({
            grade: parseInt(row.grade),
            count: parseInt(row.count),
        }));

        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to generate histogram');
    }
});


app.listen(5004, () => {
    console.log('Stats service running on port 5004');
});
