const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();


const app = express();
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


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
      WHERE class_name = $1 AND finalized = true
      `,
            [class_name]
        );


        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).send('Failed to compute stats');
    }
});


app.listen(5004, () => {
    console.log('Stats service running on port 5004');
});
