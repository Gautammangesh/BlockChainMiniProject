import { useState, useEffect, useCallback } from "react";
import { getRecords } from "../services/api";

function View({ account, role }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(false);
  const [targetAddress, setTargetAddress] = useState(account);
  const [error, setError] = useState(null);

  const fetchPatientRecords = useCallback(async () => {
    if (!targetAddress) return;
    setLoading(true);
    setError(null);
    try {
      const addr = role === 'doctor' ? targetAddress : account;
      const response = await getRecords(addr);
      setRecords(response.data);
    } catch (error) {
      console.error(error);
      setError("Failed to retrieve records. Ensure you have the necessary permissions.");
    } finally {
      setLoading(false);
    }
  }, [account, role, targetAddress]);

  useEffect(() => {
    if (role === 'patient') {
      fetchPatientRecords();
    }
  }, [account, role, fetchPatientRecords]);

  return (
    <div className="view-container">
      <div className="component-header">
        <h3>📂 {role === 'doctor' ? "Patient Vault Records" : "Personal Health Records"}</h3>
        <p className="subtitle">Secure records retrieved directly from the blockchain registry.</p>
      </div>
      
      {role === 'doctor' && (
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Search Patient Wallet Address (0x...)"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
          />
          <button onClick={fetchPatientRecords} disabled={loading}>
            {loading ? "Searching..." : "Fetch Records"}
          </button>
        </div>
      )}

      {error && <div className="status-msg error">{error}</div>}

      {loading ? (
        <div className="loader">Querying distributed registry...</div>
      ) : records.length > 0 ? (
        <div className="records-grid">
          {records.map((rec, index) => (
            <div key={index} className="record-card">
              <div className="record-header">
                <strong>Record #{index + 1}</strong>
                <span className="date">{new Date(Number(rec.timestamp) * 1000).toLocaleDateString()}</span>
              </div>
              <p className="description">{rec.description}</p>
              <div className="record-footer">
                <a 
                  href={`https://ipfs.io/ipfs/${rec.ipfsHash}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="view-link"
                >
                  <span className="icon">📄</span> View Document
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        !error && <div className="empty-state">
          <div className="icon">📭</div>
          <p>No medical records found for this identity.</p>
        </div>
      )}
    </div>
  );
}

export default View;
