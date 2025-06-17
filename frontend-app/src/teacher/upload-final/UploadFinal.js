import React, { useState } from 'react';
import axios from 'axios';
import '../Theme.css';

export default function UploadFinal() {
  const [cls, setCls] = useState('');
  const [sem, setSem] = useState('');
  const [msg, setMsg] = useState('');

  const finish = async () => {
    try {
      await axios.patch(
        `http://localhost:5003/grades/finalize/class/${cls}/semester/${sem}`, {},
        {
          headers: {
            'x-user-email': localStorage.getItem('email'),
            'x-user-role': 'teacher'
          }
        }
      );
      setMsg('Βαθμολογία οριστικοποιήθηκε!');
    } catch {
      setMsg('Σφάλμα οριστικοποίησης.');
    }
  };

  return (
    <div className="page-container">
      <div className="card">
        <h2>Οριστικοποίηση Βαθμολογίας</h2>
        <div className="input-grid">
          <input className="input" placeholder="Όνομα Τάξης" value={cls} onChange={e => setCls(e.target.value)} />
          <input className="input" placeholder="Εξάμηνο" value={sem} onChange={e => setSem(e.target.value)} />
        </div>
        <button onClick={finish} className="btn btn-primary">Finalize</button>
        {msg && <p className="status">{msg}</p>}
      </div>
    </div>
  );
}
