import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaArrowLeft } from 'react-icons/fa';
import './Navbar.css';

const Navbar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

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

  const handleLogout = () => {
    setShowConfirmLogout(true);
  };

  const confirmLogout = () => {
    setShowConfirmLogout(false);
    localStorage.clear();
    navigate('/login');
  };

  const cancelLogout = () => {
    setShowConfirmLogout(false);
  };

  return (
    <>
      <nav className="navbar">
        <button className="nav-back" onClick={handleBack} title="Go back">
          <FaArrowLeft />
        </button>

        <div
          className="nav-title-container"
          onClick={() => navigate(role === 'teacher' ? '/teacher' : '/student')}
          title="Go to dashboard"
          style={{
            display: 'flex',
            alignItems: 'center',
            cursor: 'pointer',
            flexGrow: 1,
            justifyContent: 'center'
          }}
        >
          <div
            className="nav-title"
            style={{
              fontSize: '1.8rem',
              fontWeight: 'bold',
              marginRight: '0.5rem',
              userSelect: 'none'
            }}
          >
            clearSKY
          </div>
          <img
            src="https://cdn.jsdelivr.net/gh/twitter/twemoji@14.0.2/assets/72x72/2601.png"
            alt="cloud"
            style={{
              height: '32px',
              filter: 'drop-shadow(1px 1px 2px rgba(0,0,0,0.6))',
              userSelect: 'none'
            }}
          />
        </div>

        {location.pathname !== '/login' && (
          <span
            onClick={handleLogout}
            title="Logout"
            style={{
              color: 'red',
              cursor: 'pointer',
              fontWeight: 'bold',
              userSelect: 'none',
              fontSize: '1rem',
            }}
          >
            Logout
          </span>
        )}
      </nav>

      {showConfirmLogout && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.4)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000,
          }}
        >
          <div
            style={{
              backgroundColor: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
              textAlign: 'center',
              minWidth: '300px',
              maxWidth: '90%',
            }}
          >
            <p style={{ marginBottom: '1.5rem', fontSize: '1.1rem' }}>
              Are you sure you want to log out?
            </p>
            <button
              onClick={confirmLogout}
              style={{
                marginRight: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: 'red',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              Yes
            </button>
            <button
              onClick={cancelLogout}
              style={{
                padding: '0.5rem 1rem',
                backgroundColor: 'gray',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
            >
              No
            </button>
          </div>
        </div>
      )}
    </>
  );
};


export default Navbar;