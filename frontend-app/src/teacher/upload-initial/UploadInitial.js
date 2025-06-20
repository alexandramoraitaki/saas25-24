import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import '../../App.css';

export default function UploadInitial() {
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [count, setCount] = useState(null);
  const [message, setMessage] = useState('');
  const [parsing, setParsing] = useState(false);
  const [uploading, setUploading] = useState(false);

  const courseOptions = [
    'ΤΕΧΝΟΛΟΓΙΑ ΛΟΓΙΣΜΙΚΟΥ (3205)',
    'ΒΑΣΕΙΣ ΔΕΔΟΜΕΝΩΝ (3301)',
    'ΤΕΧΝΟΛΟΓΙΑ ΦΩΤΙΣΜΟΥ (3202)'
  ];
  const periodOptions = [
    '2024-2025 ΧΕΙΜ 2024',
    '2023-2024 ΕΑΡ 2023'
  ];

  const normalize = s => String(s).replace(/\s+/g, ' ').trim();

  const readFile = file =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => resolve(e.target.result);
      reader.onerror = err => reject(err);
      reader.readAsArrayBuffer(file);
    });

  const handleParse = async e => {
    e.preventDefault();
    if (!file) return setMessage('❌ Επιλέξτε αρχείο πρώτα');
    try {
      setParsing(true);
      setMessage('🔍 Ανάγνωση αρχείου...');
      const data = await readFile(file);
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rawCourse = sheet['E4']?.v || '';
      const rawPeriod = sheet['D4']?.v || '';
      const normalizedCourse = normalize(rawCourse);
      const normalizedPeriod = normalize(rawPeriod);
      const json = XLSX.utils.sheet_to_json(sheet, { range: 2 });
      setCourse(courseOptions.includes(normalizedCourse) ? normalizedCourse : '');
      setPeriod(periodOptions.includes(normalizedPeriod) ? normalizedPeriod : '');
      setCount(json.length);
      setMessage('🔍 Το αρχείο αναλύθηκε. Επιβεβαιώστε ή ακυρώστε.');
    } catch (err) {
      console.error('Parsing error:', err);
      setMessage('❌ Σφάλμα ανάγνωσης αρχείου');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) return setMessage('❌ Επιλέξτε αρχείο πρώτα');
    if (!course || !period) return setMessage('❌ Μη έγκυρα Course ή Period');

    try {
      setUploading(true);
      setMessage('⏳ Αποστολή στο server...');

      const fd = new FormData();
      fd.append('file', file);
      fd.append('course', course);
      fd.append('period', period);

      // Debug: log form data entries
      for (let pair of fd.entries()) console.log(pair[0], pair[1]);

      const response = await axios.post(
        'http://localhost:5003/grades/upload',
        fd,
        {
          headers: {
            'x-user-email': localStorage.getItem('email'),
            'x-user-role': 'teacher',
            // Let browser set Content-Type
          }
        }
      );

      console.log('Upload response:', response);
      setMessage(`✅ Ανέβηκαν ${count} βαθμολογίες για το μάθημα "${course}" (${period})`);
      setFile(null);
      setCourse('');
      setPeriod('');
      setCount(null);
    } catch (err) {
      // Enhanced error logging
      console.error('Upload error:', err);
      if (err.response) {
        console.error('Status:', err.response.status);
        console.error('Data:', err.response.data);
        setMessage(`❌ Αποτυχία: ${err.response.status} ${err.response.data?.message || ''}`);
      } else {
        setMessage('❌ Αποτυχία ανεβάσματος στο server');
      }
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setFile(null);
    setCourse('');
    setPeriod('');
    setCount(null);
    setMessage('');
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>ΑΝΕΒΑΣΜΑ ΑΡΧΙΚΩΝ ΒΑΘΜΟΛΟΓΙΩΝ</h2>
        <form onSubmit={handleParse} className="form-grid" style={{ gridTemplateColumns: 'auto auto', alignItems: 'center', gap: '1rem' }}>
          <label htmlFor="file-upload" className="btn btn-outline">
            {file ? file.name : 'Επιλέξτε αρχείο .xlsx'}
          </label>
          <input
            id="file-upload"
            type="file"
            accept=".xlsx"
            onChange={e => { setFile(e.target.files[0]); setMessage(''); }}
            style={{ display: 'none' }}
          />
          <button type="submit" className="btn btn-primary" disabled={parsing || uploading}>
            {parsing ? 'Ανάλυση...' : 'Ανάλυση αρχείου'}
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Πληροφορίες Αρχείου</h2>
        <div className="form-grid" style={{ gridTemplateColumns: 'auto 1fr', rowGap: '1rem', columnGap: '1rem', alignItems: 'center' }}>
          <label htmlFor="course-select" style={{ textAlign: 'right' }}>Μάθημα</label>
          <select id="course-select" value={course} onChange={e => setCourse(e.target.value)} className="input">
            <option value="">-- Επιλέξτε μάθημα --</option>
            {courseOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <label htmlFor="period-select" style={{ textAlign: 'right' }}>Εξεταστική Περίοδος</label>
          <select id="period-select" value={period} onChange={e => setPeriod(e.target.value)} className="input">
            <option value="">-- Επιλέξτε περίοδο --</option>
            {periodOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
          </select>

          <label htmlFor="count" style={{ textAlign: 'right' }}>Αριθμός Μαθητών</label>
          <input id="count" type="text" value={count ?? ''} readOnly className="input" />
        </div>
        <div className="btn-group">
          <button onClick={handleConfirm} className="btn btn-success" disabled={!file || !course || !period || uploading}>
            {uploading ? 'Αποστολή...' : 'CONFIRM'}
          </button>
          <button onClick={handleCancel} className="btn btn-secondary" disabled={uploading || parsing}>CANCEL</button>
        </div>
      </div>

      {message && <div className="card"><p className="status">{message}</p></div>}
    </div>
  );
}
