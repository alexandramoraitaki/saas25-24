import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../../App.css';

import { api, API_GATEWAY, gradesService} from '../../services/apiClients';


export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const id = localStorage.getItem('student_id');
    if (!id) {
      setError('Δεν βρέθηκε student_id. Κάνε ξανά login.');
      return;
    }

    api
      .get(`/grades/student/${id}`, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': localStorage.getItem('role') || 'student',
        },
      })
      .then((res) => setGrades(res.data))
      .catch(() => setError('Αποτυχία φόρτωσης βαθμών'));
  }, []);

  const handleReview = (className) => {
    navigate(`/student/review-request?class=${encodeURIComponent(className)}`);
  };

  return (
    <div className="page-container">
      <h2 className="page-title text-white-force">My Grades 📑</h2>

      {error && <p className="text-red-600 mb-4 text-center">{error}</p>}

      <table className="table-base">
        <thead>
          <tr>
            <th>Course</th>
            <th>Grade</th>
            <th>Semester</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((g, i) => (
            <tr key={i}>
              <td>{g.class_name}</td>
              <td>{g.grade}</td>
              <td>{g.semester}</td>
              <td>{g.finalized ? 'FINAL' : 'OPEN'}</td>
              <td>
                {g.finalized ? (
                  <span className="text-gray-400">—</span>
                ) : (
                  <button className="btn btn-primary" onClick={() => handleReview(g.class_name)}>
                    Αναθεώρηση
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
