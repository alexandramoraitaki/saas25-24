import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API        = 'http://localhost:8080';   // API-Gateway
const REVIEW_API = 'http://localhost:5006';   // review-service

export default function ReviewRequest() {
  const [grades,     setGrades]     = useState([]);
  const [myReviews,  setMyReviews]  = useState([]);
  const [selectedId, setSelectedId] = useState('');
  const [reason,     setReason]     = useState('');
  const [message,    setMessage]    = useState('');

  /* ---------- 1. Φόρτωση βαθμών & αιτημάτων ---------- */
  useEffect(() => {
    const studentId = localStorage.getItem('student_id');
    if (!studentId) { setMessage('❌ Δεν βρέθηκε student_id. Κάνε login ξανά.'); return; }

    const headers = {
      'x-user-email': localStorage.getItem('email'),
      'x-user-role' : 'student'
    };

    /* βαθμοί (μόνο OPEN) */
    axios
      .get(`/grades/student/${studentId}`, { baseURL: API, headers })
      .then(res => setGrades(res.data.filter(g => !g.finalized)))
      .catch(()  => setMessage('❌ Σφάλμα φόρτωσης βαθμών'));

    /* review-requests */
    axios
      .get(`${REVIEW_API}/reviews/student`, { headers })
      .then(res => setMyReviews(res.data))
      .catch(err => console.warn('⚠️ Δεν φορτώθηκαν τα αιτήματα:', err.message));
  }, []);

  /* ---------- 2. Υποβολή νέου αιτήματος ---------- */
  const handleSubmit = async () => {
    if (!selectedId || !reason) { alert('⚠️ Συμπλήρωσε και τα δύο πεδία'); return; }

    const headers = {
      'x-user-email': localStorage.getItem('email'),
      'x-user-role' : 'student'
    };

    try {
      await axios.post(
        `${REVIEW_API}/reviews`,
        { grade_id: selectedId, reason },
        { headers }
      );

      setMessage('✅ Το αίτημα υποβλήθηκε!');
      setSelectedId('');
      setReason('');

      /* ανανέωση λίστας */
      const { data } = await axios.get(`${REVIEW_API}/reviews/student`, { headers });
      setMyReviews(data);
    } catch (err) {
      console.error('❌ Λεπτομέρεια:', err?.response?.data || err.message);
      setMessage('❌ Σφάλμα κατά την υποβολή');
    }
  };

  /* ---------- 3. UI ---------- */
  return (
    <div className="page-container">
      <h2 className="page-title">Αίτημα Αναθεώρησης Βαθμού</h2>

      {message && <p className="message">{message}</p>}

      <select
        className="input"
        value={selectedId}
        onChange={e => setSelectedId(parseInt(e.target.value, 10))}
      >
        <option value="">Επέλεξε μάθημα…</option>
        {grades.map(g => (
          <option key={g.grades_id} value={g.grades_id}>
            {g.class_name} — Εξ: {g.semester} — Βαθμός: {g.grade}
          </option>
        ))}
      </select>

      <textarea
        className="input"
        rows={3}
        placeholder="Λόγος αναθεώρησης"
        value={reason}
        onChange={e => setReason(e.target.value)}
      />

      <button className="btn btn-primary" onClick={handleSubmit}>Υποβολή</button>

      <hr className="my-6" />
      <h3 className="text-lg font-semibold mb-2">Τα Αιτήματά μου</h3>

      {myReviews.length === 0
        ? <p className="text-gray-500">Δεν έχεις καταχωρήσει κάποιο αίτημα.</p>
        : myReviews.map(r => (
            <div key={r.review_id} className="request-card">
              <p><strong>Μάθημα:</strong> {r.class_name}</p>
              <p><strong>Τρέχων βαθμός:</strong> {r.grade}</p>
              <p><strong>Κατάσταση:</strong> {r.status}</p>
              {r.response && (
                <p><strong>Απάντηση:</strong> {r.response}</p>
              )}
            </div>
          ))}
    </div>
  );
}
