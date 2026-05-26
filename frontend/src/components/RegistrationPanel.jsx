import { useState } from "react";
import { getContract } from "../utils/contract";

export default function RegistrationPanel({ provider, onRegistered }) {
  const [role, setRole] = useState("patient");
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(null);

  const handleSubmit = async () => {
    if (!name.trim()) {
      setStatus({ type: "error", message: "Name is required." });
      return;
    }

    if (role === "doctor" && !specialty.trim()) {
      setStatus({ type: "error", message: "Specialty is required for doctors." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Sending registration transaction..." });

    try {
      const contract = await getContract(provider, true);
      const tx =
        role === "doctor"
          ? await contract.registerDoctor(name.trim(), specialty.trim())
          : await contract.registerPatient(name.trim());
      await tx.wait();

      setStatus({ type: "success", message: "Registration completed successfully." });
      await onRegistered();
    } catch (error) {
      setStatus({ type: "error", message: error.reason || error.shortMessage || error.message });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="panel onboarding-panel">
      <div className="panel-header">
        <p className="eyebrow">MediChain Consent</p>
        <h2>Create your account</h2>
        <p className="subtitle">
          Each wallet can be registered once as either a doctor or a patient.
        </p>
      </div>

      {status && <div className={`status-msg ${status.type}`}>{status.message}</div>}

      <div className="segmented-control">
        <button className={role === "patient" ? "active" : ""} onClick={() => setRole("patient")}>
          Patient
        </button>
        <button className={role === "doctor" ? "active" : ""} onClick={() => setRole("doctor")}>
          Doctor
        </button>
      </div>

      <div className="form-grid">
        <label>
          <span>Name</span>
          <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" />
        </label>

        {role === "doctor" && (
          <label>
            <span>Specialty</span>
            <input
              value={specialty}
              onChange={(e) => setSpecialty(e.target.value)}
              placeholder="Cardiology, Neurology, General Medicine..."
            />
          </label>
        )}
      </div>

      <button className="primary-btn" disabled={loading} onClick={handleSubmit}>
        {loading ? "Registering..." : `Register as ${role === "doctor" ? "Doctor" : "Patient"}`}
      </button>
    </section>
  );
}
