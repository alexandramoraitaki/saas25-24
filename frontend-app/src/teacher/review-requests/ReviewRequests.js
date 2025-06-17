import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../Theme.css';

export default function ReviewRequests() {
  const [cls, setCls]     = useState('');
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const loadRequests = async () => {
    if (!cls) return setError('❌ Εισάγετε όνομα τάξης');
    try {
      const res = await axios.get(`http://localhost:5006/reviews/class/${cls}`, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher'
        }
      });
      setRequests(res.data);
      setError('');
    } catch {
      setError('❌ Δεν βρέθηκαν αιτήματα ή σφάλμα.');
    }
  };

  return (
    <div className="page-container">
      <h2>Αιτήματα Αναθεώρησης</h2>

      <div className="form-grid" style={{ maxWidth: 600 }}>
        <input
          className="input"
          placeholder="Όνομα Τάξης"
          value={cls}
          onChange={e => setCls(e.target.value)}
        />
        <button className="btn btn-primary" onClick={loadRequests}>
          Φόρτωση Αιτημάτων
        </button>
      </div>

      {error && <p className="error">{error}</p>}

      {requests.length > 0 && (
        <table className="requests-table">
          <thead>
            <tr>
              <th>Course</th>
              <th>Exam Period</th>
              <th>Student</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {requests.map(r => (
              <tr key={r.review_id}>
                <td>{r.class_name}</td>
                <td>{r.semester}</td>
                <td>{r.full_name}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => navigate(`/teacher/respond-review/${r.review_id}`)}
                  >
                    Reply
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
