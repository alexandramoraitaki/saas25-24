import React, { useState, useEffect } from 'react';
import '../../App.css';

import { gradesService,reviewService } from '../../services/apiClients'

export default function ReviewRequests() {
  const [courses, setCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [openFormId, setOpenFormId] = useState(null);
  const [formData, setFormData] = useState({});

  // 🔄 Φόρτωση μαθημάτων
  useEffect(() => {
    const email = localStorage.getItem('email');
    gradesService.get(`/grades/teacher/${email}`, {
        headers: {
          'x-user-email': email,
          'x-user-role': 'teacher'
        }
      })
      .then(res => {
        const unique = Array.from(new Set(res.data.map(g => g.class_name)));
        setCourses(unique);
        if (unique.length > 0) setSelectedCourse(unique[0]);
      })
      .catch(() => setError('❌ Failed to load courses'));
  }, []);

  const loadRequests = async () => {
    if (!selectedCourse) return alert('Select a course first.');
    try {
      setLoading(true); setError('');
      reviewService(`/reviews/class/${encodeURIComponent(selectedCourse)}`,
        {
          headers: {
            'x-user-email': localStorage.getItem('email'),
            'x-user-role': 'teacher'
          }
        }
      );
      setRequests(data);
      if (data.length === 0) setError('No requests found for this course.');
    } catch {
      setError('❌ Problem loading requests');
      setRequests([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (reviewId) => {
    const { status, response, new_grade } = formData[reviewId] || {};
    if (!status || !response) return alert('Fill in all the fields.');

    try {
      await reviewService.patch(`/reviews/${reviewId}`, {
        status,
        response,
        new_grade: status === 'accepted' ? new_grade : undefined
      }, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher'
        }
      });
      alert('✅ Submitted!');
      setOpenFormId(null);
      loadRequests();
    } catch {
      alert('❌ Failed to submit');
    }
  };

  return (
    <div className="page-container">
      <h2 className="page-title text-white-force">Review Requests</h2>

      <div className="form-grid" style={{ maxWidth: 600 }}>

        <select
          className="input"
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
        >
          <option value="">-- Select a Course --</option>
          {courses.map((c, i) => (
            <option key={i} value={c}>{c}</option>
          ))}
        </select>

        <button
          style={{
            width: '150px',
            backgroundColor: '#4f46e5',
            height: '30px',            // πιο χαμηλό
            color: '#fff',
            fontSize: '0.8rem',        // πιο μικρό κείμενο
            padding: '2px 10px',       // μικρότερο padding
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
            lineHeight: '1'            // αποφυγή extra ύψους
          }}
          onClick={loadRequests}
          disabled={loading}
        >
          {loading ? 'Loading…' : 'Load Requests'}
        </button>

      </div>

      {error && <p className="error">{error}</p>}
      {loading && <p className="loading">Please wait…</p>}

      <div className="request-list">
        {requests.map((r) => (
          <div key={r.review_id} className="request-card">
            <p><strong>Course:</strong> {r.class_name}</p>
            <p><strong>Semester:</strong> {r.semester}</p>
            <p><strong>Student:</strong> {r.full_name || '—'} ({r.am || 'ID;'})</p>
            <p><strong>Current Grade:</strong> {r.current_grade}</p>
            <p><strong>Request:</strong> {r.reason}</p>

            {openFormId !== r.review_id && (
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setOpenFormId(r.review_id)}
              >
                ↪ Response
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
                  <option value="">-- Choose --</option>
                  <option value="accepted">✅ Accept</option>
                  <option value="rejected">❌ Reject</option>
                </select>

                <textarea
                  className="input"
                  placeholder="Message to Student"
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
                    placeholder="New Grade"
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
                    Submit
                  </button>
                  <button className="btn btn-secondary btn-sm" onClick={() => setOpenFormId(null)}>
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div >
  );
}