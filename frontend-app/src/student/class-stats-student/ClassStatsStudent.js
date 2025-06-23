import React, { useEffect, useState } from 'react';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';

import { apiGateway, statsService } from '../../services/apiClients'


const ClassStatsStudent = () => {
  const [grades, setGrades] = useState([]);
  const [selectedClass, setSelectedClass] = useState('');
  const [stats, setStats] = useState(null);
  const [histogram, setHistogram] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const id = localStorage.getItem('student_id');
    if (!id) return setError('Δεν βρέθηκε student_id.');

    apiGateway
      .get(`/grades/student/${id}`, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': localStorage.getItem('role') || 'student',
        },
      })
      .then((res) => setGrades(res.data))
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
    { name: 'Failed (0–4)', count: 0 },
    { name: 'Passed (5–6)', count: 0 },
    { name: 'Good (7–8)', count: 0 },
    { name: 'Excellent (9–10)', count: 0 },
  ];
  histogram.forEach(({ grade, count }) => {
    if (grade < 5) pieData[0].count += count;
    else if (grade < 7) pieData[1].count += count;
    else if (grade < 9) pieData[2].count += count;
    else pieData[3].count += count;
  });

  const baseStyle = { style: { color: '#f1f5f9' } };

  const completeHistogram = Array.from({ length: 11 }, (_, grade) => {
    const entry = histogram.find(h => h.grade === grade);
    return { grade, count: entry ? entry.count : 0 };
  });

  const columnOptions = {
    chart: { type: 'column', backgroundColor: 'transparent', height: 300 },
    title: { text: '📊 Grade Distribution', style: { color: '#f1f5f9' } },
    xAxis: {
      categories: completeHistogram.map(h => h.grade.toString()),
      title: { text: 'Grade', style: { color: '#f1f5f9' } },
      labels: { style: { color: '#f1f5f9' } },
    },
    yAxis: {
      title: { text: 'Student Count', style: { color: '#f1f5f9' } },
      labels: { style: { color: '#f1f5f9' } },
    },
    legend: { enabled: false },
    series: [{
      name: selectedClass,
      data: completeHistogram.map(h => h.count),
      color: '#06b6d4'
    }],
  };


  const pieOptions = {
    chart: {
      type: 'pie',
      backgroundColor: 'transparent',
      height: 300,
    },
    title: {
      text: '🎯 Grade Category Percentages',
      style: { color: '#f1f5f9' },
    },
    tooltip: {
      pointFormat: '<b>{point.percentage:.1f}%</b> ({point.y} students)<br/>Category: <b>{point.name}</b>',
    },
    legend: {
      layout: 'vertical',
      align: 'center',
      verticalAlign: 'bottom',
      itemStyle: { color: '#f1f5f9' },
    },
    plotOptions: {
      pie: {
        size: '80%',
        allowPointSelect: true,
        cursor: 'pointer',
        dataLabels: {
          enabled: true,
          format: '<b>{point.name}</b>: {point.percentage:.1f} %',
          style: { color: '#f1f5f9' },
        },
      },
    },
    series: [
      {
        name: 'Students',
        colorByPoint: true,
        data: [
          { name: 'Fail (0–4.9)', y: pieData[0].count, color: '#ef4444' },
          { name: 'Moderate (5–6.9)', y: pieData[1].count, color: '#f59e0b' },
          { name: 'Good (7–8.9)', y: pieData[2].count, color: '#10b981' },
          { name: 'Excellent (9–10)', y: pieData[3].count, color: '#3b82f6' },
        ],
      },
    ],
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 to-slate-900 text-slate-100 px-4 py-12">
      <div className="max-w-5xl mx-auto space-y-12">

        <h1 className="text-4xl font-light tracking-wide text-center text-white-force">
          📈 Class Statistics
        </h1>


        {/* Επιλογή Μαθήματος */}
        <div className="bg-slate-800/60 backdrop-blur-lg rounded-xl shadow-lg max-w-xl mx-auto px-6 py-8">
          <h2 className="text-xl font-semibold text-white-force mb-4">
            Course Selection
          </h2>

          <label htmlFor="class-select" className="text-sm text-white-force block mb-2">
            Select a course:
          </label>

          <select
            id="class-select"
            className="bg-slate-700 text-white w-full px-4 py-2 rounded-md border border-slate-600 focus:ring-2 focus:ring-cyan-500"
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
          >
            <option value="">-- Choose --</option>
            {grades.map((g, i) => (
              <option key={i} value={g.class_name}>
                {g.class_name} ({g.semester})
              </option>
            ))}
          </select>
        </div>

        {error && (
          <p className="text-red-400 text-center font-medium">{error}</p>
        )}

        {/* Στατιστικά Cards */}
        {stats && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '2rem' }}>
            {[
              { label: 'Count', value: stats.count, icon: '👥' },
              { label: 'Average', value: stats.average, icon: '📊' },
              { label: 'Minimum', value: stats.min, icon: '⬇️' },
              { label: 'Maximum', value: stats.max, icon: '⬆️' },
            ].map(({ label, value, icon }) => (
              <div
                key={label}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  background: '#1e293b',
                  color: 'white',
                  borderRadius: '12px',
                  padding: '0.75rem 1.25rem',
                  fontSize: '1rem',
                  fontWeight: '500',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
                }}
              >
                <span style={{ fontSize: '1.5rem', marginRight: '0.5rem' }}>{icon}</span>
                <span style={{ marginRight: '0.25rem' }}>{label}:</span>
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>{value}</span>
              </div>
            ))}
          </div>
        )}

        {/* Γραφήματα */}
        {selectedClass && histogram.length > 0 && (
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'flex-start',
              gap: '2rem',
              flexWrap: 'nowrap',
              marginTop: '2rem',
            }}
          >
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1rem',
              borderRadius: '1rem',
              width: '400px',
              height: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <HighchartsReact highcharts={Highcharts} options={columnOptions} />
            </div>
            <div style={{
              backgroundColor: '#1e293b',
              padding: '1rem',
              borderRadius: '1rem',
              width: '400px',
              height: '300px',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
            }}>
              <HighchartsReact highcharts={Highcharts} options={pieOptions} />
            </div>
          </div>
        )}


      </div>
    </div>
  );
};

export default ClassStatsStudent;
