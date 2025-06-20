import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

const apiGateway = axios.create({ baseURL: 'http://localhost:8080' });
const statsService = axios.create({ baseURL: 'http://localhost:5004' });

const ClassStatsStudent = () => {
  const [grades, setGrades] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [stats, setStats] = useState(null);
  const [histogram, setHistogram] = useState([]);
  const [error, setError] = useState('');
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    const id = localStorage.getItem('student_id');
    if (!id) {
      setError('Δεν βρέθηκε student_id.');
      return;
    }

    apiGateway
      .get(`/grades/student/${id}`, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': localStorage.getItem('role') || 'student',
        },
      })
      .then((res) => {
        setGrades(res.data);
      })
      .catch(() => setError('Σφάλμα ανάκτησης βαθμών.'));
  }, []);

  useEffect(() => {
    if (!selectedClass) return;

    statsService
      .get(`/stats/${selectedClass}`)
      .then((res) => setStats(res.data))
      .catch(() => setStats(null));

    statsService
      .get(`/stats/${selectedClass}/histogram`)
      .then((res) => setHistogram(res.data))
      .catch(() => setHistogram([]));
  }, [selectedClass]);

  const pieData = [
    { name: 'Αποτυχία (0-4.9)', count: 0 },
    { name: 'Μέτρια (5-6.9)', count: 0 },
    { name: 'Καλή (7-8.9)', count: 0 },
    { name: 'Άριστη (9-10)', count: 0 },
  ];

  histogram.forEach((h) => {
    const grade = h.grade;
    if (grade < 5) pieData[0].count += h.count;
    else if (grade < 7) pieData[1].count += h.count;
    else if (grade < 9) pieData[2].count += h.count;
    else pieData[3].count += h.count;
  });

  const pieOptions = {
    chart: {
      type: 'pie',
    },
    title: {
      text: 'Ποσοστά Κατηγοριών Βαθμών',
    },
    series: [
      {
        name: 'Φοιτητές',
        data: pieData.map((d) => ({ name: d.name, y: d.count })),
      },
    ],
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <h2 className="text-2xl font-bold mb-4">📊 Στατιστικά Μαθήματος</h2>

      {error && <p className="text-red-600">{error}</p>}

      <label className="block mb-2 text-sm">Επίλεξε μάθημα:</label>
      <select
        className="mb-4 border p-2 rounded"
        value={selectedClass}
        onChange={(e) => setSelectedClass(e.target.value)}
      >
        <option value="">-- Επιλογή --</option>
        {grades.map((g, i) => (
          <option key={i} value={g.class_name}>
            {g.class_name} ({g.semester})
          </option>
        ))}
      </select>

      {stats && (
        <div className="mb-6 space-y-1">
          <p><strong>Πλήθος:</strong> {stats.count}</p>
          <p><strong>Μέσος όρος:</strong> {stats.average}</p>
          <p><strong>Ελάχιστος:</strong> {stats.min}</p>
          <p><strong>Μέγιστος:</strong> {stats.max}</p>
        </div>
      )}

      {isMounted && selectedClass && histogram.length > 0 && stats ? (
        <>
          <HighchartsReact
            highcharts={Highcharts}
            options={{
              chart: { type: 'column' },
              title: { text: 'Κατανομή Βαθμών' },
              xAxis: {
                title: { text: 'Βαθμός' },
                categories: histogram.map((h) => h.grade.toString()),
              },
              yAxis: {
                title: { text: 'Αριθμός φοιτητών' },
              },
              series: [
                {
                  name: selectedClass,
                  data: histogram.map((h) => h.count),
                },
              ],
            }}
          />

          <div className="mt-8">
            <HighchartsReact highcharts={Highcharts} options={pieOptions} />
          </div>
        </>
      ) : selectedClass ? (
        <p className="text-gray-500 mt-4">Δεν υπάρχουν δεδομένα για γράφημα.</p>
      ) : null}
    </div>
  );
};

export default ClassStatsStudent;
