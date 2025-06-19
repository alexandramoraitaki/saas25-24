import React, { useState } from 'react';
import axios from 'axios';
import '../Theme.css';

export default function UploadInitial() {
  const [file, setFile] = useState(null);
  const [course, setCourse] = useState('');
  const [period, setPeriod] = useState('');
  const [count, setCount] = useState(null);
  const [message, setMessage] = useState('');

  const handleFileChange = e => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async e => {
    e.preventDefault();
    if (!file) return setMessage('❌ Επιλέξτε αρχείο πρώτα');

    const fd = new FormData();
    fd.append('file', file);

    try {
      await axios.post('http://localhost:5003/grades/upload', fd, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher'
        }
      });
      // count rows roughly by splitting lines
      const text = await file.text();
      const rows = text.split('\n').length - 3;
      setCount(rows > 0 ? rows : 0);
      setMessage('✅ Το αρχείο ανέβηκε επιτυχώς');
    } catch {
      setMessage('❌ Αποτυχία ανεβάσματος');
    }
  };

  const handleConfirm = () => setMessage('✔️ Επιβεβαίωση στοιχείων');
  const handleCancel = () => {
    setFile(null); setCourse(''); setPeriod(''); setCount(null); setMessage('');
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>INITIAL GRADES POSTING</h2>
        <form onSubmit={handleUpload} className="form-grid">
          <input type="file"
            accept=".xlsx"
            onChange={handleFileChange}
            className="input-file" />
          <button type="submit" className="btn btn-primary">
            Submit Initial Grades
          </button>
        </form>
      </div>

      <div className="card">
        <h2>XLSX File Parsing</h2>
        <div className="form-grid">
          <input type="text" value={course} onChange={e => setCourse(e.target.value)}
            className="input" placeholder="Course name" />
          <input type="text" value={period} onChange={e => setPeriod(e.target.value)}
            className="input" placeholder="Exam period" />
          <input type="text" value={count ?? ''} readOnly
            className="input" placeholder="Number of grades" />
        </div>
        <div className="btn-group">
          <button onClick={handleConfirm} className="btn btn-primary">CONFIRM</button>
          <button onClick={handleCancel} className="btn btn-secondary">CANCEL</button>
        </div>
      </div>

      {message && (
        <div className="card">
          <p className="status">{message}</p>
        </div>
      )}
    </div>
  );
}
