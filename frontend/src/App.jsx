import { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import Login from './components/Login';
import PatientDashboard from './components/PatientDashboard';
import DoctorDashboard from './components/DoctorDashboard';
import './App.css';

function App() {
  const [role, setRole] = useState(null);
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);

  const connectWallet = async () => {
    if (window.ethereum) {
      try {
        const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
        const walletProvider = new ethers.BrowserProvider(window.ethereum);
        setAccount(accounts[0]);
        setProvider(walletProvider);
      } catch (error) {
        console.error("User denied account access");
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  useEffect(() => {
    if (window.ethereum) {
      window.ethereum.on('accountsChanged', (accounts) => {
        setAccount(accounts[0] || null);
      });
    }
  }, []);

  return (
    <div className="app-container">
      <header className="navbar">
        <div className="logo">🛡️ HeartCare AI</div>
        <div className="wallet-info">
          {account ? (
            <span className="account-tag">{account.slice(0, 6)}...{account.slice(-4)}</span>
          ) : (
            <button className="connect-btn" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>
      <main className="main-content">
        {!account && (
          <div className="hero-section">
            <h1>Decentralized Medical Records</h1>
            <p>Secure, transparent, and patient-controlled healthcare data management.</p>
            <button className="cta-btn" onClick={connectWallet}>Get Started</button>
          </div>
        )}
        {account && !role && <Login onSelectRole={setRole} account={account} />}
        {account && role === 'patient' && <PatientDashboard account={account} provider={provider} />}
        {account && role === 'doctor' && <DoctorDashboard account={account} provider={provider} />}
      </main>
    </div>
  );
}

export default App;
