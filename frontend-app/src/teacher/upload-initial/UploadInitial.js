// src/teacher/upload-initial/UploadInitial.js
import React, { useState, useRef } from 'react';  // <-- import useRef

import * as XLSX from 'xlsx';
import '../../App.css';

import { gradesService } from '../../services/apiClients';



export default function UploadInitial() {
  const [file, setFile] = useState(null);
  const fileInputRef = useRef(null);   // <-- define ref

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

  const normalize = s => String(s || '').replace(/\s+/g, ' ').trim();
  const readFile = f =>
    new Promise((res, rej) => {
      const reader = new FileReader();
      reader.onload = e => res(e.target.result);
      reader.onerror = err => rej(err);
      reader.readAsArrayBuffer(f);
    });

  const handleParse = async e => {
    e.preventDefault();
    if (!file) {
      setMessage('❌ Please select a .xlsx file first');
      return;
    }
    try {
      setParsing(true);
      setMessage('🔍 Parsing file...');
      const data = await readFile(file);
      const wb = XLSX.read(data, { type: 'array' });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const rawC = sheet['E4']?.v || '';
      const rawP = sheet['D4']?.v || '';
      const normC = normalize(rawC);
      const normP = normalize(rawP);
      const rows = XLSX.utils.sheet_to_json(sheet, { range: 2 });

      setCourse(courseOptions.includes(normC) ? normC : '');
      setPeriod(periodOptions.includes(normP) ? normP : '');
      setCount(rows.length);
      setMessage('✅ File parsed. Please confirm or cancel.');
    } catch (err) {
      console.error('Parsing error:', err);
      setMessage('❌ Error parsing file');
    } finally {
      setParsing(false);
    }
  };

  const handleConfirm = async () => {
    if (!file) {
      setMessage('❌ Please select a file first');
      return;
    }
    if (!course || !period) {
      setMessage('❌ Invalid course or semester');
      return;
    }

    try {
      setUploading(true);
      setMessage('⏳ Checking for existing initial grades…');

      await gradesService.patch('/grades/check-initial', {
          params: { course, semester: period },
          headers: {
            'x-user-email': localStorage.getItem('email'),
            'x-user-role': 'teacher'
          }
        }
      );
      if (data.count > 0) {
        setMessage(
          `⚠️ Initial grades already uploaded for "${course}" (${period})`
        );
        return;
      }

      setMessage('⏳ Uploading initial grades…');
      const fd = new FormData();
      fd.append('file', file);
      fd.append('course', course);
      fd.append('period', period);

      await axios.post('/grades/upload', fd, {
        headers: {
          'x-user-email': localStorage.getItem('email'),
          'x-user-role': 'teacher'
        }
      });

      setMessage(
        `✅ Uploaded ${count} initial grades for "${course}" (${period})`
      );
      // reset React state
      setFile(null);
      setCourse('');
      setPeriod('');
      setCount(null);
      // clear the actual file‐input so re-selecting same file fires onChange
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (err) {
      console.error('Upload error:', err);
      const st = err.response?.status;
      const dt = err.response?.data?.message || err.message;
      setMessage(`❌ Upload failed: ${st} ${dt}`);
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
    // also clear the actual file‐input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Initial Grades Upload</h2>
        <form
          onSubmit={handleParse}
          className="form-grid"
          style={{
            gridTemplateColumns: 'auto auto',
            alignItems: 'center',
            gap: '1rem'
          }}
        >
          <label
            htmlFor="file-upload"
            style={{
              display: 'inline-block',
              padding: '8px 16px',
              backgroundColor: '#f1f5f9',
              color: '#111827',
              border: '1px solid #cbd5e1',
              borderRadius: '6px',
              cursor: 'pointer',
              fontSize: '0.9rem',
              fontWeight: 500,
              transition: 'background-color 0.2s ease',
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = '#e2e8f0')}
            onMouseLeave={(e) => (e.target.style.backgroundColor = '#f1f5f9')}
          >
            {file ? file.name : 'Select .xlsx file'}
          </label>
          <input
            ref={fileInputRef}              // <-- attach ref here
            id="file-upload"
            type="file"
            accept=".xlsx"
            onChange={e => {
              setFile(e.target.files[0]);
              setMessage('');
            }}
            style={{ display: 'none' }}
          />
          <button
            type="submit"
            className="btn btn-primary"
            disabled={parsing || uploading}
          >
            {parsing ? 'Parsing…' : 'Analyze File'}
          </button>
        </form>
      </div>

      {count !== null && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <h2>File Details</h2>
          <div
            className="form-grid"
            style={{
              gridTemplateColumns: 'auto 1fr',
              rowGap: '1rem',
              columnGap: '1rem',
              alignItems: 'center'
            }}
          >
            <label style={{ textAlign: 'right' }}>Course</label>
            <select
              value={course}
              onChange={e => setCourse(e.target.value)}
              className="input"
              disabled={uploading}
            >
              <option value="">-- Select course --</option>
              {courseOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <label style={{ textAlign: 'right' }}>Semester</label>
            <select
              value={period}
              onChange={e => setPeriod(e.target.value)}
              className="input"
              disabled={uploading}
            >
              <option value="">-- Select semester --</option>
              {periodOptions.map(o => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>

            <label style={{ textAlign: 'right' }}>Students Count</label>
            <input
              type="text"
              readOnly
              className="input"
              value={count}
            />
          </div>
          <div className="btn-group" style={{ marginTop: '1rem' }}>
            <button
              onClick={handleConfirm}
              className="btn btn-success"
              disabled={!file || !course || !period || uploading}
            >
              {uploading ? 'Uploading…' : 'Confirm'}
            </button>
            <button
              onClick={handleCancel}
              className="btn btn-secondary"
              disabled={uploading}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {message && (
        <div className="card" style={{ marginTop: '1rem' }}>
          <p className="status">{message}</p>
        </div>
      )}
    </div>
  );
}