// src/teacher/upload-final/UploadFinal.js
import React, { useState } from 'react';
import * as XLSX from 'xlsx';
import '../../App.css';

import { gradesService } from '../../services/apiClients';

export default function UploadFinal() {
    const [mode, setMode] = useState('finalize'); // 'finalize' or 'update'
    const [file, setFile] = useState(null);
    const [course, setCourse] = useState('');
    const [period, setPeriod] = useState('');
    const [count, setCount] = useState(0);
    const [busy, setBusy] = useState(false);
    const [message, setMessage] = useState('');

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
    const readFile = f => new Promise((res, rej) => {
        const r = new FileReader();
        r.onload = e => res(e.target.result);
        r.onerror = e => rej(e);
        r.readAsArrayBuffer(f);
    });

    const handleParse = async e => {
        e.preventDefault();
        if (!file) {
            return setMessage('❌ Please select a .xlsx file first');
        }
        try {
            setBusy(true);
            setMessage('🔍 Parsing file...');
            const data = await readFile(file);
            const wb = XLSX.read(data, { type: 'array' });
            const sheet = wb.Sheets[wb.SheetNames[0]];
            const rawC = sheet['E4']?.v || '';
            const rawP = sheet['D4']?.v || '';
            const js = XLSX.utils.sheet_to_json(sheet, { range: 2 });
            const c = normalize(rawC);
            const p = normalize(rawP);

            setCourse(courseOptions.includes(c) ? c : '');
            setPeriod(periodOptions.includes(p) ? p : '');
            setCount(js.length);
            setMessage('✅ File is ready. Confirm when you’re set.');
        } catch (err) {
            console.error('Parse error:', err);
            setMessage('❌ Failed to parse file');
        } finally {
            setBusy(false);
        }
    };

    const handleUpdate = async () => {
        if (!file || !course || !period) {
            return setMessage('❌ Please complete parsing & selections');
        }
        try {
            setBusy(true);
            setMessage('⏳ Updating grades…');
            const fd = new FormData();
            fd.append('file', file);

            await gradesService.patch(
                '/grades/update',
                fd,
                {
                    headers: {
                        'x-user-email': localStorage.getItem('email') || '',
                        'x-user-role': 'teacher'
                    }
                }
            );

            setMessage('✅ Grades updated successfully.');
        } catch (err) {
            console.error('Update error:', err);
            const st = err.response?.status;
            const dt = err.response?.data || err.message;
            setMessage(`❌ Update failed: ${st} ${dt}`);
        } finally {
            setBusy(false);
        }
    };

    const handleFinalize = async () => {
        if (!course || !period) {
            return setMessage('❌ Please select course & semester');
        }
        try {
            setBusy(true);
            setMessage('⏳ Finalizing grades…');
            const path = `/grades/finalize/class/${encodeURIComponent(course)}/semester/${encodeURIComponent(period)}`;

            const res = await gradesService.patch(url, null, {
                headers: {
                    'x-user-email': localStorage.getItem('email') || '',
                    'x-user-role': 'teacher'
                }
            });

            setMessage(`✅ ${res.data}`);
        } catch (err) {
            console.error('Finalize error:', err);
            const st = err.response?.status;
            const dt = err.response?.data;
            setMessage(`❌ Finalize failed: ${st} ${dt}`);
        } finally {
            setBusy(false);
        }
    };

    const handleCancel = () => {
        setFile(null);
        setCourse('');
        setPeriod('');
        setCount(0);
        setMessage('');
    };

    return (
        <div className="page-container">

            {/* Mode toggle */}
            <div className="btn-group" style={{ marginBottom: '1rem' }}>
                <button
                    onClick={() => { setMode('finalize'); setMessage(''); }}
                    className={`btn ${mode === 'finalize' ? 'btn-outline' : 'btn-primary'}`}
                    disabled={busy}
                >
                    Finalize Only
                </button>
                <button
                    onClick={() => { setMode('update'); setMessage(''); }}
                    className={`btn ${mode === 'update' ? 'btn-outline' : 'btn-primary'}`}
                    disabled={busy}
                >
                    Upload Excel & Update
                </button>
            </div>

            {mode === 'update' ? (
                <>
                    {/* Card #1: Excel upload & parse */}
                    <div className="card">
                        <h2>Update Grades from Excel</h2>
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
                                id="file-upd"
                                type="file"
                                accept=".xlsx"
                                onChange={e => {
                                    setFile(e.target.files?.[0] || null);
                                    setMessage('');
                                }}
                                style={{ display: 'none' }}
                                disabled={busy}
                            />
                            <button
                                type="submit"
                                className="btn btn-primary"
                                disabled={busy}
                            >
                                {busy ? 'Parsing…' : 'Analyze File'}
                            </button>
                        </form>
                    </div>

                    {/* Card #2: details & update */}
                    {count > 0 && (
                        <div className="card" style={{ marginTop: '1rem' }}>
                            <h2>File Details</h2>
                            <div className="form-grid" style={{
                                gridTemplateColumns: 'auto 1fr',
                                rowGap: '1rem',
                                columnGap: '1rem',
                                alignItems: 'center'
                            }}>
                                <label style={{ textAlign: 'right' }}>Course</label>
                                <select
                                    value={course}
                                    onChange={e => setCourse(e.target.value)}
                                    className="input"
                                    disabled={busy}
                                >
                                    <option value="">-- Select course --</option>
                                    {courseOptions.map(o =>
                                        <option key={o} value={o}>{o}</option>
                                    )}
                                </select>

                                <label style={{ textAlign: 'right' }}>Semester</label>
                                <select
                                    value={period}
                                    onChange={e => setPeriod(e.target.value)}
                                    className="input"
                                    disabled={busy}
                                >
                                    <option value="">-- Select semester --</option>
                                    {periodOptions.map(o =>
                                        <option key={o} value={o}>{o}</option>
                                    )}
                                </select>

                                <label style={{ textAlign: 'right' }}>Record Count</label>
                                <input
                                    type="text"
                                    readOnly
                                    className="input"
                                    value={count}
                                />
                            </div>

                            <div className="btn-group" style={{ marginTop: '1rem' }}>
                                <button
                                    onClick={handleUpdate}
                                    className="btn btn-success"
                                    disabled={busy}
                                >
                                    {busy ? 'Updating…' : 'Update Grades'}
                                </button>
                                <button
                                    onClick={handleCancel}
                                    className="btn btn-secondary"
                                    disabled={busy}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </>
            ) : (
                /* Finalize-only card */
                <div className="card">
                    <h2>Finalize Grades</h2>
                    <div className="form-grid" style={{
                        gridTemplateColumns: 'auto 1fr',
                        rowGap: '1rem',
                        columnGap: '1rem',
                        alignItems: 'center'

                    }}>
                        <label style={{ textAlign: 'right' }}>Course</label>
                        <select
                            value={course}
                            onChange={e => setCourse(e.target.value)}
                            className="input"
                            disabled={busy}
                        >
                            <option value="">-- Select course --</option>
                            {courseOptions.map(o =>
                                <option key={o} value={o}>{o}</option>
                            )}
                        </select>

                        <label style={{ textAlign: 'right' }}>Semester</label>
                        <select
                            value={period}
                            onChange={e => setPeriod(e.target.value)}
                            className="input"
                            disabled={busy}
                        >
                            <option value="">-- Select semester --</option>
                            {periodOptions.map(o =>
                                <option key={o} value={o}>{o}</option>
                            )}
                        </select>
                    </div>
                    <div className="btn-group" style={{ marginTop: '1rem' }}>
                        <button
                            onClick={handleFinalize}
                            className="btn btn-success"
                            disabled={!course || !period || busy}
                        >
                            {busy ? 'Finalizing…' : 'Finalize Grades'}
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