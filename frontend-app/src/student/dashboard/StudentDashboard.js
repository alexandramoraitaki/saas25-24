import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('full_name') || 'Student';

  const actions = [
    {
      label: 'View My Grades',
      path: '/student/grades',
    },
    {
      label: 'Submit Grade Review Request',
      path: '/student/review-request',
    },
    {
      label: 'View Review Status',
      path: '/student/review-status',
    },
  ];

  return (
    <div className="center-screen">
      <div className="page-container">
        <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
          <h1 className="greeting">Welcome, {name} 👋</h1>
          <p className="subtitle">Student Dashboard</p>

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
};

export default StudentDashboard;
