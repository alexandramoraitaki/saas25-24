import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft, FaUserCircle } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  const handleBack = () => {
    const history = window.history;

    // Αν υπάρχει μόνο μία σελίδα στο ιστορικό, πήγαινε dashboard
    if (history.length <= 2) {
      navigate(role === 'teacher' ? '/teacher' : '/student', { replace: true });
      return;
    }

    // Αν βρίσκομαι ήδη στο login (και πατήθηκε back), πήγαινε dashboard
    if (location.pathname === '/login') {
      navigate(role === 'teacher' ? '/teacher' : '/student', { replace: true });
      return;
    }

    // Κανονικό back
    navigate(-1);
  };

  return (
    <nav className="navbar">
      <button className="nav-back" onClick={handleBack} title="Go back">
        <FaArrowLeft />
      </button>

      <div
        className="nav-title"
        onClick={() => navigate(role === 'teacher' ? '/teacher' : '/student')}
        title="Go to dashboard"
      >
        clearSKY
      </div>

      <div className="nav-profile" title="Your profile">
        <FaUserCircle size={24} />
      </div>
    </nav>
  );
};

export default Navbar;
