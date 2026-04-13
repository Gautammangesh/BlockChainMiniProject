import { useState, useEffect } from "react";
import { getRecords } from "../services/api";

function View({ account, role }) {
  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [targetAddress, setTargetAddress] = useState(account);

  const fetchPatientRecords = async () => {
    setLoading(true);
    try {
      const addr = role === 'doctor' ? targetAddress : account;
      const response = await getRecords(addr);
      setRecords(response.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (role === 'patient') {
      fetchPatientRecords();
    }
  }, [account]);

  return (
    <div className="view-container">
      <h3>📂 {role === 'doctor' ? "Patient Health Records" : "My Medical History"}</h3>
      
      {role === 'doctor' && (
        <div className="search-bar">
          <input 
            type="text" 
            placeholder="Enter Patient Address"
            value={targetAddress}
            onChange={(e) => setTargetAddress(e.target.value)}
          />
          <button onClick={fetchPatientRecords}>Fetch</button>
        </div>
      )}

      {loading ? (
        <div className="loader">Searching blockchain...</div>
      ) : records.length > 0 ? (
        <div className="records-grid">
          {records.map((rec, index) => (
            <div key={index} className="record-card">
              <div className="record-header">
                <strong>ID: #{index + 1}</strong>
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
                  📄 View Document
                </a>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty-state">No medical records found for this address.</div>
      )}
    </div>
  );
}

export default View;
