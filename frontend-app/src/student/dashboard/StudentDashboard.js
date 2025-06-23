import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../App.css';
import { useState } from 'react';
import axios from 'axios';

import { apiGateway } from '../services/apiClients'


import {
  FaGraduationCap,
  FaPaperPlane,
  FaSearch,
  FaBook,
  FaChartBar
} from 'react-icons/fa';

const StudentDashboard = () => {
  const navigate = useNavigate();

  const name = localStorage.getItem('full_name') || 'Student';
  const email = localStorage.getItem('email') || 'student@example.com';
  const institution =
    localStorage.getItem('institution') ||
    'National Technical University of Athens';
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');


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
      label: 'View My Courses',
      path: '/student/courses',
      icon: <FaBook />,
    },
    {
      label: 'Class Statistics',
      path: '/student/class-stats-student',
      icon: <FaChartBar />,
    },
  ];

  return (
    <>
      {/* 🧑‍🎓 Floating Profile OUTSIDE the layout */}
      <div className="floating-profile">
        <h3 className="profile-floating-title">🧑‍🏫 {name}</h3>
        <p>{email}</p>
        <p>{institution}</p>

        <button
          onClick={() => setShowChangePassword((prev) => !prev)}
          style={{
            marginTop: '0.5rem',
            backgroundColor: '#006699',
            padding: '4px 8px',
            fontSize: '0.75rem',
            height: '30px',
            lineHeight: '1',
            borderRadius: '4px',
            border: 'none',
            color: 'white',
            cursor: 'pointer'
          }}
        >
          Change Password
        </button>

        {showChangePassword && (
          <div style={{ marginTop: '1rem' }}>
            <input
              type="password"
              placeholder="Old Password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="input"
              style={{ marginBottom: '0.5rem' }}
            />
            <input
              type="password"
              placeholder="New Password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="input"
              style={{ marginBottom: '0.5rem' }}
            />
            <button
              onClick={async () => {
                try {
                  setMessage('');
                  await apiGateway.patch('/users/change-password', {
                    email,
                    oldPassword,
                    newPassword
                  });
                  setMessage('✅ Password changed!');
                  setOldPassword('');
                  setNewPassword('');
                  setShowChangePassword(false);
                  setTimeout(() => setMessage(''), 3000);
                } catch (err) {
                  setMessage('❌ ' + (err.response?.data || 'Error changing password'));
                }
              }}
              style={{
                backgroundColor: '#16a34a',
                padding: '4px 10px',
                fontSize: '0.75rem',
                height: '30px',
                lineHeight: '1',
                borderRadius: '4px',
                border: 'none',
                color: 'white',
                cursor: 'pointer'
              }}
            >
              Submit
            </button>
          </div>
        )}

        {/* 🟢 ΤΟ ΜΗΝΥΜΑ ΕΜΦΑΝΙΖΕΤΑΙ ΠΑΝΤΑ ΕΔΩ, ακόμα κι αν η φόρμα κλείσει */}
        {message && (
          <p
            style={{
              marginTop: '0.5rem',
              fontSize: '0.9rem',
              fontWeight: 'bold',
              color: message.startsWith('✅') ? 'green' : 'red',
            }}
          >
            {message}
          </p>
        )}

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