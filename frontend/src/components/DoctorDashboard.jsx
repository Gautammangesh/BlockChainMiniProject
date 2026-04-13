import React, { useState } from 'react';
import Upload from './Upload';
import View from './View';

export default function DoctorDashboard({ account, provider }) {
  const [activeTab, setActiveTab] = useState('upload');

  return (
    <div className="dashboard doctor-dashboard">
      <div className="sidebar">
        <h3>Doctor Menu</h3>
        <button className={activeTab === 'upload' ? 'active' : ''} onClick={() => setActiveTab('upload')}>
          📤 Upload Record
        </button>
        <button className={activeTab === 'view' ? 'active' : ''} onClick={() => setActiveTab('view')}>
          📂 View Patient Records
        </button>
      </div>
      <div className="content-area">
        {activeTab === 'upload' && <Upload account={account} provider={provider} />}
        {activeTab === 'view' && <View account={account} provider={provider} role="doctor" />}
      </div>
    </div>
  );
}
