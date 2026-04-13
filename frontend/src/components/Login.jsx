import React from 'react';

export default function Login({ onSelectRole, account }) {
  return (
    <div className="login-card">
      <h2>Welcome Back</h2>
      <p className="subtitle">Connected as: <span className="addr">{account.slice(0, 10)}...</span></p>
      <div className="role-selection">
        <button className="role-btn patient" onClick={() => onSelectRole('patient')}>
          <div className="icon">👤</div>
          <h3>I am a Patient</h3>
          <p>Access your records and manage permissions.</p>
        </button>
        <button className="role-btn doctor" onClick={() => onSelectRole('doctor')}>
          <div className="icon">👨‍⚕️</div>
          <h3>I am a Doctor</h3>
          <p>Upload new records and view patient history.</p>
        </button>
      </div>
    </div>
  );
}
