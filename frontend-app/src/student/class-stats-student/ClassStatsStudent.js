import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import '../../App.css';


export default function ClassStats() {
  const [className, setClassName] = useState('');
  const [semester, setSemester] = useState('');
  const [rows, setRows] = useState([]);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState(null);

  // Load all finalized grades for a class and semester
  const loadGrades = async () => {
    if (!className || !semester) {
      setError('❌ Πρέπει να εισάγετε όνομα τάξης και εξάμηνο');
      return;
    }
    try {
      const res = await axios.get(`http://localhost:5003/grades/class/${className}`, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher',
        },
      });
      // filter finalized + matching semester
      const finals = res.data.filter(g => g.finalized && g.semester === semester);
      setRows(finals);
      setError('');
    } catch (err) {
      console.error(err);
      setError('❌ Σφάλμα ανάκτησης δεδομένων');
    }
  };

  // Compute distribution for chart
  const distributionData = () => {
    if (!rows.length) return [];
    const dist = {};
    rows.forEach(g => {
      const grade = g.grade;
      dist[grade] = (dist[grade] || 0) + 1;
    });
    return Object.entries(dist)
      .sort((a, b) => a[0] - b[0])
      .map(([grade, count]) => ({ grade, count }));
  };

  return (
    <div className="page-container">
      <h2>Στατιστικά Τάξης</h2>
      <div className="form-grid" style={{ maxWidth: 600 }}>
        <input
          className="input"
          placeholder="Όνομα Τάξης"
          value={className}
          onChange={e => setClassName(e.target.value)}
        />
        <input
          className="input"
          placeholder="Εξάμηνο (π.χ. spring 2025)"
          value={semester}
          onChange={e => setSemester(e.target.value)}
        />
        <button className="btn btn-primary" onClick={loadGrades}>
          Φόρτωση Στατιστικών
        </button>
      </div>
      {error && <p className="error">{error}</p>}

      {rows.length > 0 && (
        <>
          {/* Summary table */}
          <table className="requests-table">
            <thead>
              <tr>
                <th>Course</th>
                <th>Semester</th>
                <th># of Records</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{className}</td>
                <td>{semester}</td>
                <td>{rows.length}</td>
                <td>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => setSelected({ className, semester })}
                  >
                    View Charts
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          {/* Charts */}
          {selected && (
            <div style={{ width: '100%', maxWidth: 800, marginTop: '2rem' }}>
              <h3>{selected.className} — {selected.semester} Grade Distribution</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={distributionData()}>
                  <XAxis dataKey="grade" />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Legend payload={[{ value: 'Count', type: 'square', color: '#1a73e8' }]} />
                  <Bar dataKey="count" fill="#1a73e8" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
