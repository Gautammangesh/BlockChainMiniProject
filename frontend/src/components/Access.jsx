import { useState } from "react";
import { ethers } from "ethers";
import artifacts from "../abi/MedicalRecords.json";

function Access({ account, provider }) {
  const [doctorAddr, setDoctorAddr] = useState("");
  const [loading, setLoading] = useState(false);

  const handleAccess = async (action) => {
    if (!doctorAddr) return;
    setLoading(true);
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(artifacts.address, artifacts.abi, signer);
      
      const tx = action === 'grant' 
        ? await contract.grantAccess(doctorAddr)
        : await contract.revokeAccess(doctorAddr);
      
      await tx.wait();
      alert(`Access ${action}ed successfully!`);
    } catch (error) {
      console.error(error);
      alert("Transaction failed: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-container">
      <h3>🔑 Medical Data Access Control</h3>
      <p>Grant or revoke specific doctors' permission to view and upload your medical records.</p>
      
      <div className="access-form">
        <input
          type="text"
          placeholder="Enter Doctor Wallet Address (0x...)"
          value={doctorAddr}
          onChange={(e) => setDoctorAddr(e.target.value)}
        />
        <div className="button-group">
          <button 
            className="grant-btn" 
            onClick={() => handleAccess('grant')}
            disabled={loading}
          >
            {loading ? "Processing..." : "Grant Access"}
          </button>
          <button 
            className="revoke-btn" 
            onClick={() => handleAccess('revoke')}
            disabled={loading}
          >
            {loading ? "Processing..." : "Revoke Access"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Access;
