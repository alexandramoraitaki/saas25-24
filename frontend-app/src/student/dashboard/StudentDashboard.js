import React from 'react';
import { useNavigate } from 'react-router-dom';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const name = localStorage.getItem('full_name') || 'Student';

  return (
    <div style={{ maxWidth: 500, margin: '40px auto', padding: 24, background: 'white', borderRadius: 16, boxShadow: '0 2px 16px rgba(0,0,0,0.08)', textAlign: 'center' }}>
      <h2 style={{ color: '#2c3e50', marginBottom: 8 }}>Welcome, {name}!</h2>
      <p style={{ color: '#6c7a89', marginBottom: 32 }}>Student Dashboard</p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <button onClick={() => navigate('/student/grades')} style={btnStyle}>View My Grades</button>
        <button onClick={() => navigate('/student/review-request')} style={btnStyle}>Submit Grade Review Request</button>
        <button onClick={() => navigate('/student/review-status')} style={btnStyle}>View Review Status</button>
      </div>
    </div>
  );
};

const btnStyle = {
  padding: '12px',
  borderRadius: '8px',
  border: 'none',
  background: 'linear-gradient(90deg, #4a6072, #6c7a89)',
  color: 'white',
  fontWeight: 700,
  fontSize: '1rem',
  cursor: 'pointer',
  marginBottom: 4,
  transition: 'filter 0.2s',
};

export default StudentDashboard; 