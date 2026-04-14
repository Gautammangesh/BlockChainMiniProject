import { useState } from "react";
import { ethers } from "ethers";
import artifacts from "../abi/MedicalRecords.json";

function Access({ account, provider }) {
  const [doctorAddr, setDoctorAddr] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleAccess = async (action) => {
    if (!doctorAddr) {
      setStatus({ type: 'error', message: "Please enter a doctor's wallet address." });
      return;
    }
    setLoading(true);
    setStatus({ type: 'info', message: `Initializing ${action} access transaction...` });
    try {
      const signer = await provider.getSigner();
      const contract = new ethers.Contract(artifacts.address, artifacts.abi, signer);
      
      const tx = action === 'grant' 
        ? await contract.grantAccess(doctorAddr)
        : await contract.revokeAccess(doctorAddr);
      
      const receipt = await tx.wait();
      setStatus({ type: 'success', message: `Permissions ${action}ed successfully! Block: ${receipt.blockNumber}` });
      setDoctorAddr("");
    } catch (error) {
      console.error(error);
      setStatus({ type: 'error', message: "Transaction failed: " + (error.reason || error.message) });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="access-container">
      <div className="component-header">
        <h3>🔑 Access Control Management</h3>
        <p className="subtitle">Grant or revoke specific providers' permission to your medical vault.</p>
      </div>

      {status && (
        <div className={`status-msg ${status.type}`}>
          {status.message}
        </div>
      )}

      <div className="access-form">
        <div className="form-group">
          <label>Doctor's Wallet Address</label>
          <input
            type="text"
            placeholder="0x..."
            value={doctorAddr}
            onChange={(e) => setDoctorAddr(e.target.value)}
          />
        </div>
        <div className="button-group">
          <button 
            className="grant-btn" 
            onClick={() => handleAccess('grant')}
            disabled={loading}
          >
            {loading ? "Processing..." : "✔️ Grant Access"}
          </button>
          <button 
            className="revoke-btn" 
            onClick={() => handleAccess('revoke')}
            disabled={loading}
          >
            {loading ? "Processing..." : "❌ Revoke Access"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default Access;
