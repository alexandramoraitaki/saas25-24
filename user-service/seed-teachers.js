const bcrypt = require('bcrypt');
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function insertTeachers() {
  const teachers = [
    {
      student_id: null,
      full_name: 'Καθηγητής Α',
      email: 'katha@ntua.gr',
      password: 'teacherpass1'
    },
    {
      student_id: null,
      full_name: 'Καθηγητής Β',
      email: 'kathb@ntua.gr',
      password: 'teacherpass2'
    },
    {
      student_id: null,
      full_name: 'Καθηγητής Γ',
      email: 'kathg@ntua.gr',
      password: 'teacherpass3'
    }
  ];

  for (const t of teachers) {
    const hash = await bcrypt.hash(t.password, 10);
    await pool.query(
      `INSERT INTO users (student_id, full_name, email, password_hash, role, institution)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (email) DO NOTHING`,
      [t.student_id, t.full_name, t.email, hash, 'teacher', 'NTUA']
    );
  }

  console.log('Καθηγητές προστέθηκαν!');
}

insertTeachers();
