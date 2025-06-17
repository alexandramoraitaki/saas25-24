import React from 'react';
import { Link } from 'react-router-dom';
import '../Theme.css';

export default function TeacherDashboard() {
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
    <div className="page-container">
      <h1 className="greeting">Καλώς ήρθες, {name} 👋</h1>
      <p className="subtitle">Επίλεξε τι θα ήθελες να κάνεις :</p>

      <div className="actions-grid fixed-2x2">
        {actions.map(({ label, path }) => (
          <Link to={path} key={label} className="action-card">
            <div className="card-content">
              <h3>{label}</h3>
              <span>➜</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
