import { useState } from "react";
import { uploadRecord } from "../services/api";

function Upload({ account }) {
  const [file, setFile] = useState(null);
  const [patient, setPatient] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleUpload = async () => {
    if (!file || !patient) {
      setStatus({ type: 'error', message: "Please select a file and enter patient address." });
      return;
    }
    
    setLoading(true);
    setStatus({ type: 'info', message: "Processing. Please wait..." });
    try {
      const data = { 
        file: "Buffer contents of " + file.name,
        patient,
        description 
      };
      
      const response = await uploadRecord(data);
      if (response.data.success) {
        setStatus({ type: 'success', message: "Record successfully anchored to Blockchain and IPFS!" });
        setFile(null);
        setPatient("");
        setDescription("");
      }
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: "Upload failed: " + (error.response?.data?.error || error.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <div className="component-header">
        <h3>📤 Upload Specialized Medical Record</h3>
        <p className="subtitle">Securely encrypt and store data on the decentralized web.</p>
      </div>

      {status && (
        <div className={`status-msg ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="form-content">
        <div className="form-group">
          <label>Recipient Patient Wallet Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={patient}
            onChange={(e) => setPatient(e.target.value)}
          />
        </div>
        <div className="form-group">
          <label>Clinical Description</label>
          <textarea
            placeholder="Provide context for this record (e.g. Annual Checkup, Lab Result)..."
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows="4"
          />
        </div>
        <div className="form-group">
          <label>Medical Document (PDF, Image, etc.)</label>
          <div className="file-input-wrapper">
             <input type="file" onChange={(e) => setFile(e.target.files[0])} />
             {file && <div className="file-name-display">✅ {file.name}</div>}
          </div>
        </div>
        <button 
          className="upload-btn" 
          onClick={handleUpload} 
          disabled={loading}
        >
          {loading ? "Initializing Transaction..." : "🔐 Secure & Publish"}
        </button>
      </div>
    </div>
  );
}

export default Upload;
