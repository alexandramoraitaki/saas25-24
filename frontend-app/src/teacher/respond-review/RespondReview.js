import React, { useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import '../Theme.css';

export default function RespondReview() {
  const { id } = useParams();
  const nav = useNavigate();
  const [status, setStatus] = useState('approved');
  const [msg, setMsg] = useState('');
  const [error, setError] = useState('');

  const submit = async e => {
    e.preventDefault();
    try {
      await axios.patch(`http://localhost:5006/reviews/${id}`, { status, response: msg }, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher'
        }
      });
      nav('/teacher/review-requests');
    } catch {
      setError('Σφάλμα στην αποστολή.');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Απάντηση Αιτήματος #{id}</h2>
        <form onSubmit={submit} className="reply-form">
          <label>
            Επιλογή:
            <select value={status} onChange={e => setStatus(e.target.value)}
                    className="select">
              <option value="approved">Εγκρίνεται</option>
              <option value="rejected">Απορρίπτεται</option>
            </select>
          </label>
          <label>
            Μήνυμα:
            <textarea
              value={msg} onChange={e => setMsg(e.target.value)}
              rows="4" className="textarea"
            />
          </label>
          <div className="btn-group">
            <button type="submit" className="btn btn-primary">Υποβολή</button>
            <button type="button" onClick={() => nav(-1)} className="btn btn-secondary">Άκυρο</button>
          </div>
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}
