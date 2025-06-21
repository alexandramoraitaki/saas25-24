// ./src/student/Grades.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';   // <-- import
import '../../App.css';

const api = axios.create({ baseURL: 'http://localhost:8080' });

export default function Grades() {
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');
  const navigate = useNavigate();                  // <-- hook για navigation

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

  // όταν πατηθεί "Αναθεώρηση"
  const handleReview = (className) => {
    // π.χ. πέρασε το όνομα του μαθήματος ως query string ή state
    navigate(`/student/review-request?class=${encodeURIComponent(className)}`);
  };

  return (
    <div className="flex flex-col items-center py-8 px-4">
      <h2 className="text-3xl font-extrabold text-cyan-400 mb-8 drop-shadow text-center">
        Οι Βαθμοί Μου
      </h2>

      {error && <p className="text-red-600 text-center mb-4">{error}</p>}

      <div className="w-full max-w-4xl overflow-x-auto">
        <table className="grades-table bg-white/80 backdrop-blur rounded-lg shadow divide-y divide-gray-200">
          <thead className="bg-cyan-50">
            <tr>
              {['Μάθημα', 'Βαθμός', 'Εξάμηνο', 'Κατάσταση', 'Ενέργεια'].map((title) => (
                <th
                  key={title}
                  className="px-6 py-3 text-center text-gray-700 font-medium"
                >
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {grades.map((g, i) => (
              <tr key={i} className={i % 2 ? 'bg-gray-50/60' : 'bg-white/60'}>
                <td className="px-6 py-4 text-center font-medium">{g.class_name}</td>
                <td className="px-6 py-4 text-center">{g.grade}</td>
                <td className="px-6 py-4 text-center">{g.semester}</td>
                <td className="px-6 py-4 text-center">
                  {g.finalized ? 'FINAL' : 'OPEN'}
                </td>
                <td className="px-6 py-4 text-center">
                  {g.finalized ? (
                    <span className="text-gray-400">-</span>
                  ) : (
                    <button
                      className="
                        bg-blue-500 hover:bg-blue-700 text-white
                        px-4 py-2 rounded-md shadow-md hover:shadow-xl
                        transform hover:scale-105 transition duration-150 ease-in-out
                      "
                      onClick={() => handleReview(g.class_name)}  // <-- εδώ
                    >
                      Αναθεώρηση
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
