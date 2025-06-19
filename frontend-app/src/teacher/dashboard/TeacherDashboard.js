import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

export default function TeacherDashboard() {
  const navigate = useNavigate();
  const name = localStorage.getItem('full_name') || 'Καθηγητής';

  const actions = [
    {
      label: 'Ανέβασμα Αρχικής Βαθμολογίας',
      path: '/teacher/upload-initial',
    },
    {
      label: 'Αιτήματα Αναθεώρησης',
      path: '/teacher/review-requests',
    },
    {
      label: 'Οριστικοποίηση Βαθμολογίας',
      path: '/teacher/upload-final',
    },
    {
      label: 'Στατιστικά Τάξης',
      path: '/teacher/class-stats',
    },
  ];

  return (
    <div className="center-screen">
      <div className="page-container">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 className="greeting">Welcome, {name} 👋</h1>
          <p className="subtitle">Επίλεξε τι θα ήθελες να κάνεις :</p>

          <div className="form-grid">
            {actions.map(({ label, path }) => (
              <button
                key={label}
                onClick={() => navigate(path)}
                className="btn btn-primary"
                style={{ width: '100%' }}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
