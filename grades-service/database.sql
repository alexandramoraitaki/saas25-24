CREATE TABLE IF NOT EXISTS grades (
  grades_id SERIAL PRIMARY KEY,
  student_id VARCHAR(20),              -- Αριθμός Μητρώου
  full_name TEXT,                      -- Ονοματεπώνυμο
  email TEXT,                          -- Ακαδημαϊκό E-mail
  semester VARCHAR(50),      -- Περίοδος δήλωσης (π.χ. Εαρινό 2023)
  class_name TEXT,                  -- Τμήμα Τάξης (π.χ. Τμήμα Α)
  grading_scale TEXT,                 -- Κλίμακα βαθμολόγησης (π.χ. 0–10)
  grade NUMERIC,                      -- Βαθμολογία (π.χ. 8.5)
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
