import { useEffect, useRef, useState } from "react";
import { ethers } from "ethers";
import DoctorDashboard from "./components/DoctorDashboard";
import PatientDashboard from "./components/PatientDashboard";
import RegistrationPanel from "./components/RegistrationPanel";
import { loadProfile } from "./utils/contract";
import medicalRecordsAbi from "./abi/MedicalRecords.json";
import "./App.css";

function App() {
  const expectedChainId = "1337";
  const [account, setAccount] = useState(null);
  const [provider, setProvider] = useState(null);
  const [role, setRole] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [networkOk, setNetworkOk] = useState(true);
  const [chainLabel, setChainLabel] = useState("Ganache 1337");
  const [menuOpen, setMenuOpen] = useState(false);
  const [toast, setToast] = useState(null);
  const menuRef = useRef(null);

  const verifyNetwork = async (walletProvider) => {
    const network = await walletProvider.getNetwork();
    const matches = network.chainId.toString() === expectedChainId;
    setNetworkOk(matches);
    const label = matches ? `Ganache ${network.chainId}` : `${network.name || "Network"} (${network.chainId})`;
    setChainLabel(label);
    return matches;
  };

  const resetSession = () => {
    setAccount(null);
    setProvider(null);
    setRole(null);
    setProfile(null);
    setLoadingProfile(false);
    setNetworkOk(true);
    setChainLabel("Ganache 1337");
    setMenuOpen(false);
  };

  const hydrateProfile = async (walletProvider, walletAccount) => {
    if (!walletProvider || !walletAccount) {
      setRole(null);
      setProfile(null);
      return;
    }

    setLoadingProfile(true);
    try {
      const next = await loadProfile(walletProvider, walletAccount);
      setRole(next.role);
      setProfile(next.profile);
    } catch (error) {
      console.error(error);
      setRole("unregistered");
      setProfile(null);
    } finally {
      setLoadingProfile(false);
    }
  };

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask.");
      return;
    }

    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(walletProvider);
      setAccount(accounts[0]);
      const matches = await verifyNetwork(walletProvider);
      if (!matches) {
        setRole(null);
        setProfile(null);
        return;
      }
      await hydrateProfile(walletProvider, accounts[0]);
    } catch (error) {
      console.error("Wallet connection failed", error);
    }
  };

  const switchAccount = async () => {
    if (!window.ethereum) {
      return;
    }

    try {
      await window.ethereum.request({
        method: "wallet_requestPermissions",
        params: [{ eth_accounts: {} }],
      });
      const accounts = await window.ethereum.request({ method: "eth_accounts" });
      if (accounts.length) {
        const walletProvider = new ethers.BrowserProvider(window.ethereum);
        setProvider(walletProvider);
        setAccount(accounts[0]);
        const matches = await verifyNetwork(walletProvider);
        if (!matches) {
          setRole(null);
          setProfile(null);
          return;
        }
        await hydrateProfile(walletProvider, accounts[0]);
      }
      setMenuOpen(false);
    } catch (error) {
      console.error("Account switch request failed", error);
      setToast("Open MetaMask and switch the account there.");
      setTimeout(() => setToast(null), 2400);
    }
  };

  const disconnectWallet = () => {
    resetSession();
  };

  const copyAddress = async () => {
    if (!account) {
      return;
    }
    try {
      await navigator.clipboard.writeText(account);
      setToast("Address copied to clipboard");
      setTimeout(() => setToast(null), 2400);
      setMenuOpen(false);
    } catch (error) {
      console.error(error);
      prompt("Copy your wallet address", account);
    }
  };

  useEffect(() => {
    if (!window.ethereum) {
      return undefined;
    }

    const handleAccountsChanged = async (accounts) => {
      const nextAccount = accounts[0] || null;
      setAccount(nextAccount);
      setMenuOpen(false);

      if (!nextAccount) {
        setRole(null);
        setProfile(null);
        return;
      }

      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(walletProvider);
      const matches = await verifyNetwork(walletProvider);
      if (!matches) {
        setRole(null);
        setProfile(null);
        return;
      }
      await hydrateProfile(walletProvider, nextAccount);
    };

    const handleChainChanged = async () => {
      if (!window.ethereum) return;
      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(walletProvider);
      const matches = await verifyNetwork(walletProvider);
      if (matches && account) {
        await hydrateProfile(walletProvider, account);
      } else if (!matches) {
        setRole(null);
        setProfile(null);
      }
    };

    window.ethereum.on("accountsChanged", handleAccountsChanged);
    window.ethereum.on("chainChanged", handleChainChanged);
    return () => {
      window.ethereum.removeListener("accountsChanged", handleAccountsChanged);
      window.ethereum.removeListener("chainChanged", handleChainChanged);
    };
  }, [account]);

  useEffect(() => {
    if (!window.ethereum) {
      return;
    }

    const restoreSession = async () => {
      const existingAccounts = await window.ethereum.request({ method: "eth_accounts" });
      if (!existingAccounts.length) {
        return;
      }

      const walletProvider = new ethers.BrowserProvider(window.ethereum);
      setProvider(walletProvider);
      setAccount(existingAccounts[0]);

      const matches = await verifyNetwork(walletProvider);
      if (!matches) {
        setRole(null);
        setProfile(null);
        return;
      }

      await hydrateProfile(walletProvider, existingAccounts[0]);
    };

    restoreSession().catch((error) => {
      console.error("Failed to restore wallet session", error);
    });
  }, []);

  useEffect(() => {
    if (!menuOpen) {
      return;
    }

    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [menuOpen]);

  const roleLabel = role === "doctor" ? "Doctor" : role === "patient" ? "Patient" : "Unregistered";

  return (
    <div className="app-shell">
      <header className="navbar">
        <div>
          <p className="eyebrow">Ganache-ready Doctor + Patient DApp</p>
          <div className="logo">MediChain Consent</div>
        </div>
        <div className="nav-right">
          <div className="network-pill">{chainLabel}</div>
          {account ? (
            <div className="wallet-menu" ref={menuRef}>
              <button className="account-pill" onClick={() => setMenuOpen((open) => !open)}>
                {account.slice(0, 6)}...{account.slice(-4)}
              </button>
              {menuOpen && (
                <div className="wallet-dropdown">
                  <div className="wallet-dropdown-header">Session controls</div>
                  <button className="dropdown-action" onClick={copyAddress}>
                    Copy address
                  </button>
                  <button className="dropdown-action" onClick={switchAccount}>
                    Switch account
                  </button>
                  <button className="dropdown-action danger" onClick={disconnectWallet}>
                    Disconnect session
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="primary-btn" onClick={connectWallet}>Connect Wallet</button>
          )}
        </div>
      </header>

      <main className="page-wrap">
        {!networkOk && (
          <section className="warning-banner">
            Switch MetaMask to Ganache at <strong>127.0.0.1:7545</strong> with chain ID <strong>1337</strong> before using MediChain Consent.
          </section>
        )}

        {toast && <section className="toast-message">{toast}</section>}

        {!account && (
          <section className="hero-card">
            <p className="eyebrow">Doctor and Patient Access</p>
            <h1>Manage consent and records in one place.</h1>
            <p className="subtitle">
              Connect your wallet, register as a doctor or patient, manage access requests, and keep a simple record history on Ganache.
            </p>
            <button className="primary-btn" onClick={connectWallet}>Connect MetaMask</button>
          </section>
        )}

        {account && networkOk && (
          <section className="session-wrapper">
            <div className="session-overview">
              <div className="session-card">
                <p className="eyebrow">Signed in as</p>
                <h2>{roleLabel}</h2>
                <p className="subtitle">{profile?.name || "Connected account"}</p>
                <p className="muted-copy">{account}</p>
              </div>
              <div className="session-card">
                <p className="eyebrow">Network</p>
                <h2>{chainLabel}</h2>
                <p className="subtitle">Contract: {medicalRecordsAbi.address.slice(0, 6)}...{medicalRecordsAbi.address.slice(-4)}</p>
              </div>
            </div>
          </section>
        )}

        {account && networkOk && loadingProfile && <section className="panel">Loading your MediChain profile...</section>}

        {account && networkOk && !loadingProfile && role === "unregistered" && (
          <RegistrationPanel provider={provider} onRegistered={() => hydrateProfile(provider, account)} />
        )}

        {account && networkOk && !loadingProfile && role === "doctor" && (
          <DoctorDashboard account={account} provider={provider} profile={profile} />
        )}

        {account && networkOk && !loadingProfile && role === "patient" && (
          <PatientDashboard account={account} provider={provider} profile={profile} />
        )}
      </main>
    </div>
  );
}

export default App;
