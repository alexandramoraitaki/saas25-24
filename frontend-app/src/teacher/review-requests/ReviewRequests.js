import React, { useState } from 'react';
import axios from 'axios';
import '../../App.css';

const API = 'http://localhost:5006';

const COURSE = {
  id: 1,
  code: 'ΤΕΧΝΟΛΟΓΙΑ ΛΟΓΙΣΜΙΚΟΥ   (3205)',
  name: 'ΤΕΧΝΟΛΟΓΙΑ ΛΟΓΙΣΜΙΚΟΥ   (3205)'
};

export default function ReviewRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFormId, setOpenFormId] = useState(null); // ποιο αίτημα έχει ανοιχτή φόρμα
  const [formData, setFormData] = useState({}); // dynamic per review_id

  const loadRequests = async () => {
    try {
      setLoading(true); setError('');
      const { data } = await axios.get(
        `${API}/reviews/class/${encodeURIComponent(COURSE.code)}`,
        {
          headers: {
            'x-user-email': localStorage.getItem('email'),
            'x-user-role': 'teacher'
          }
        }
      );
      setRequests(data);
      if (data.length === 0) setError('Δεν υπάρχουν αιτήματα για το μάθημα.');
    } catch {
      setError('❌ Πρόβλημα επικοινωνίας ή δεν βρέθηκαν αιτήματα');
      setRequests([]);
    } finally { setLoading(false); }
  };

  const handleSubmit = async (reviewId) => {
    const { status, response, new_grade } = formData[reviewId] || {};
    if (!status || !response) return alert('Συμπλήρωσε όλα τα πεδία.');

    try {
      await axios.patch(`${API}/reviews/${reviewId}`, {
        status,
        response,
        new_grade: status === 'accepted' ? new_grade : undefined
      }, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher'
        }
      });
      alert('✅ Υποβλήθηκε!');
      setOpenFormId(null);
      loadRequests(); // refresh
    } catch {
      alert('❌ Σφάλμα κατά την υποβολή');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title">Αιτήματα Αναθεώρησης</h2>

      <div className="form-grid" style={{ maxWidth: 600 }}>
        <select className="input" disabled>
          <option value={COURSE.code}>{COURSE.name}</option>
        </select>
        <button className="btn btn-primary" onClick={loadRequests} disabled={loading}>
          {loading ? 'Φόρτωση…' : 'Φόρτωση Αιτημάτων'}
        </button>
      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Παρακαλώ περιμένετε…</p>}

      <div className="request-list">
        {requests.map((r) => (
          <div key={r.review_id} className="request-card">
            <p><strong>Μάθημα:</strong> {r.class_name}</p>
            <p><strong>Εξεταστική:</strong> {r.semester}</p>
            <p><strong>Φοιτητής:</strong> {r.full_name || '—'}</p>
            <p><strong>Αίτημα:</strong> {r.reason}</p>

            {openFormId !== r.review_id && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setOpenFormId(r.review_id)}
              >
                ↪ Απάντηση
              </button>
            )}

            {openFormId === r.review_id && (
              <div className="inline-form">
                <select
                  className="input"
                  value={formData[r.review_id]?.status || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      [r.review_id]: {
                        ...prev[r.review_id],
                        status: e.target.value
                      }
                    }))
                  }
                >
                  <option value="">-- Επιλογή --</option>
                  <option value="accepted">✅ Αποδοχή</option>
                  <option value="rejected">❌ Απόρριψη</option>
                </select>

                <textarea
                  className="input"
                  placeholder="Μήνυμα προς φοιτητή"
                  rows={3}
                  value={formData[r.review_id]?.response || ''}
                  onChange={e =>
                    setFormData(prev => ({
                      ...prev,
                      [r.review_id]: {
                        ...prev[r.review_id],
                        response: e.target.value
                      }
                    }))
                  }
                />

                {formData[r.review_id]?.status === 'accepted' && (
                  <input
                    className="input"
                    type="number"
                    placeholder="Νέος βαθμός"
                    value={formData[r.review_id]?.new_grade || ''}
                    onChange={e =>
                      setFormData(prev => ({
                        ...prev,
                        [r.review_id]: {
                          ...prev[r.review_id],
                          new_grade: e.target.value
                        }
                      }))
                    }
                  />
                )}

                <div className="btn-group">
                  <button className="btn btn-primary btn-sm" onClick={() => handleSubmit(r.review_id)}>
                    Υποβολή
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setOpenFormId(null)}>
                    Άκυρο
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
