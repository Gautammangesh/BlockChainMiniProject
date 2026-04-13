import React, { useState } from 'react';
import View from './View';
import Access from './Access';

export default function PatientDashboard({ account, provider }) {
  const [activeTab, setActiveTab] = useState('view');

  return (
    <div className="dashboard patient-dashboard">
      <div className="sidebar">
        <h3>Patient Menu</h3>
        <button className={activeTab === 'view' ? 'active' : ''} onClick={() => setActiveTab('view')}>
          📂 My Records
        </button>
        <button className={activeTab === 'access' ? 'active' : ''} onClick={() => setActiveTab('access')}>
          🔑 Manage Access
        </button>
      </div>
      <div className="content-area">
        {activeTab === 'view' && <View account={account} provider={provider} role="patient" />}
        {activeTab === 'access' && <Access account={account} provider={provider} />}
      </div>
    </div>
  );
}
