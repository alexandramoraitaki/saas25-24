import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import {
  FaUpload,
  FaRedo,
  FaCheckCircle,
  FaChartBar
} from 'react-icons/fa';

export default function TeacherDashboard() {
  const navigate = useNavigate();

  const name = localStorage.getItem('full_name') || 'Instructor';
  const email = localStorage.getItem('email') || 'instructor@example.com';
  const institution = localStorage.getItem('institution') || 'National Technical University of Athens';

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

  const actions = [
    {
      label: 'Upload Initial Grades',
      path: '/teacher/upload-initial',
      icon: <FaUpload />,
    },
    {
      label: 'Review Requests',
      path: '/teacher/review-requests',
      icon: <FaRedo />,
    },
    {
      label: 'Finalize Grades',
      path: '/teacher/upload-final',
      icon: <FaCheckCircle />,
    },
    {
      label: 'Class Statistics',
      path: '/teacher/class-stats',
      icon: <FaChartBar />,
    },
  ];

  return (
    <>
      {/* 🧑‍🏫 Floating profile box OUTSIDE layout */}
      <div className="floating-profile">
        <h3 className="profile-floating-title">🧑‍🏫 {name}</h3>
        <p>{email}</p>
        <p>{institution}</p>
      </div>

      <div className="center-screen">
        <div className="page-container">
          <div className="card" >
            <h1 className="greeting">
              {timeGreeting}, <span className="highlight-name">{name}</span>{' '}
              <span className="wave">👋</span>
            </h1>
            <p className="subtitle">Choose what you'd like to do:</p>

            <div className="form-grid">
              {actions.map(({ label, path, icon }) => (
                <button
                  key={label}
                  onClick={() => navigate(path)}
                  className="btn btn-primary"
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '0.5rem',
                  }}
                >
                  {icon} {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
