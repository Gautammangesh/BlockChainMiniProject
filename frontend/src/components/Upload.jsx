import { useState } from "react";
import { uploadRecord } from "../services/api";

function Upload({ account }) {
  const [file, setFile] = useState(null);
  const [patient, setPatient] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file || !patient) {
      alert("Please select a file and enter patient address.");
      return;
    }
    
    setLoading(true);
    try {
      // In a real app we'd convert file to Buffer or base64
      // For this DApp, we'll send it as a data object
      const data = { 
        file: "Buffer contents of " + file.name, // Placeholder for actual file logic
        patient,
        description 
      };
      
      const response = await uploadRecord(data);
      if (response.data.success) {
        alert("Record uploaded successfully to IPFS and Blockchain!");
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed: " + (error.response?.data?.error || error.message));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="upload-container">
      <h3>📤 Upload New Medical Record</h3>
      <div className="form-group">
        <label>Recipient Patient Address</label>
        <input
          type="text"
          placeholder="0x..."
          value={patient}
          onChange={(e) => setPatient(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Record Description</label>
        <textarea
          placeholder="e.g. Blood Test Report, MRI Scan..."
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>
      <div className="form-group">
        <label>Select File</label>
        <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      </div>
      <button 
        className="upload-btn" 
        onClick={handleUpload} 
        disabled={loading}
      >
        {loading ? "Uploading..." : "Publish to Blockchain"}
      </button>
    </div>
  );
}

export default Upload;
