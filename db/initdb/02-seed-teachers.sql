-- 02-seed-teachers.sql
INSERT INTO users (student_id, full_name, email, password_hash, role, institution)
VALUES 
  (NULL, 'Καθηγητής Α', 'katha@ntua.gr', crypt('teacherpass1', gen_salt('bf')), 'teacher', 'NTUA'),
  (NULL, 'Καθηγητής Β', 'kathb@ntua.gr', crypt('teacherpass2', gen_salt('bf')), 'teacher', 'NTUA'),
  (NULL, 'Καθηγητής Γ', 'kathg@ntua.gr', crypt('teacherpass3', gen_salt('bf')), 'teacher', 'NTUA')
ON CONFLICT (email) DO NOTHING;
