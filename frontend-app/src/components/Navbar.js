import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');

  const handleBack = () => {
    let history = JSON.parse(localStorage.getItem("customHistory")) || [];

    // Αφαίρεσε την τρέχουσα σελίδα
    history.pop();

    //  Αφαίρεσε το login αν είναι το τελευταίο
    while (history.length && history[history.length - 1] === "/login") {
      history.pop();
    }

    const previous = history.pop();
    localStorage.setItem("customHistory", JSON.stringify(history));

    if (previous) {
      navigate(previous);
    } else {
      navigate(role === "teacher" ? "/teacher" : "/student");
    }
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

      <div
        className="nav-logo-right"
        onClick={() => navigate(role === 'teacher' ? '/teacher' : '/student')}
        title="Go to dashboard"
      >
        <img
          src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png"
          alt="cloud"
          style={{
            height: '28px',
            cursor: 'pointer',
            filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.6))'
          }}
        />
      </div>

    </nav>
  );
};

export default Navbar;
