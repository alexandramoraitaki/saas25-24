import React, { useEffect, useState } from 'react';
import axios from 'axios';
import '../../App.css';

/* 👉 1. Axios instance που “χτυπά” το API Gateway (port 8080) */
const api = axios.create({
  baseURL: 'http://localhost:8080',
});

const Grades = () => {
  const [grades, setGrades] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    /* 👉 2. Πρέπει να υπάρχει student_id στο localStorage */
    const id = localStorage.getItem('student_id');
    if (!id) {
      setError('Δεν βρέθηκε student_id. Κάνε ξανά login.');
      return;
    }

    /* 👉 3. Κλήση στο API Gateway: /grades/student/:id */
    api
      .get(`/grades/student/${id}`, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': localStorage.getItem('role') || 'student',
        },
      })
      .then((res) => setGrades(res.data))
      .catch((err) => {
        console.error(err);
        setError('Αποτυχία φόρτωσης βαθμών');
      });
  }, []);

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">Οι Βαθμοί Μου</h2>

      {error && <p className="text-red-600">{error}</p>}

      <table className="min-w-full border text-left text-sm">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Μάθημα</th>
            <th className="border px-4 py-2">Βαθμός</th>
            <th className="border px-4 py-2">Εξάμηνο</th>
            <th className="border px-4 py-2">Κατάσταση</th>
            <th className="border px-4 py-2">Ενέργεια</th>
          </tr>
        </thead>
        <tbody>
          {grades.map((grade, index) => (
            <tr key={index}>
              <td className="border px-4 py-2">{grade.class_name}</td>
              <td className="border px-4 py-2">{grade.grade}</td>
              <td className="border px-4 py-2">{grade.semester}</td>
              <td className="border px-4 py-2">
                {grade.finalized ? 'FINAL' : 'OPEN'}
              </td>
              <td className="border px-4 py-2">
                {grade.finalized ? (
                  <span className="text-gray-400">-</span>
                ) : (
                  <button
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded"
                    onClick={() =>
                      alert(`Αίτημα αναθεώρησης για ${grade.class_name}`)
                    }
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
  );
};

export default Grades;
