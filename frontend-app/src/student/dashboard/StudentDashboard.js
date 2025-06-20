import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import {
  FaGraduationCap,
  FaPaperPlane,
  FaSearch,
  FaBook,
} from 'react-icons/fa';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const name = localStorage.getItem('full_name') || 'Student';
  const email = localStorage.getItem('email') || 'student@example.com';
  const institution =
    localStorage.getItem('institution') ||
    'National Technical University of Athens';

  const hour = new Date().getHours();
  const timeGreeting =
    hour < 12
      ? 'Good morning'
      : hour < 18
        ? 'Good afternoon'
        : 'Good evening';

  const actions = [
    {
      label: 'View My Grades',
      path: '/student/grades',
      icon: <FaGraduationCap />,
    },
    {
      label: 'Submit Review Request',
      path: '/student/review-request',
      icon: <FaPaperPlane />,
    },
    {
      label: 'View Review Status',
      path: '/student/review-status',
      icon: <FaSearch />,
    },
    {
      label: 'View My Courses',
      path: '/student/courses',
      icon: <FaBook />,
    },
  ];

  return (
    <>
      {/* 🧑‍🎓 Floating Profile OUTSIDE the layout */}
      <div className="floating-profile">
        <h3 className="profile-floating-title">🧑‍🎓 {name}</h3>
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
};

export default StudentDashboard;
