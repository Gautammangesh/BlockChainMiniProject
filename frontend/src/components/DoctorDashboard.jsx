import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";
import { uploadMedicalFile } from "../services/api";

const REQUEST_STATUS = {
  0: "No request",
  1: "Pending",
  2: "Approved",
  3: "Rejected",
  4: "Revoked",
};

function readFileAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Failed to read the selected file."));
    reader.readAsDataURL(file);
  });
}

export default function DoctorDashboard({ account, provider, profile }) {
  const [activeTab, setActiveTab] = useState("request");
  const [requestForm, setRequestForm] = useState({ patient: "", message: "" });
  const [entryForm, setEntryForm] = useState({
    patient: "",
    entryType: "Prescription",
    title: "",
    notes: "",
    file: null,
  });
  const [lookupAddress, setLookupAddress] = useState("");
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState(null);
  const [accessCheck, setAccessCheck] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recentPatients, setRecentPatients] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("doctorRecentPatients") || "[]");
    } catch {
      return [];
    }
  });
  const [patientStatuses, setPatientStatuses] = useState({});
  const [selectedPatient, setSelectedPatient] = useState("");
  const [copyMessage, setCopyMessage] = useState(null);

  const formatRecord = (record) => ({
    doctor: record.doctor,
    patient: record.patient,
    entryType: record.entryType,
    ipfsHash: record.ipfsHash,
    title: record.title,
    notes: record.notes,
    timestamp: record.timestamp.toString(),
  });

  const saveRecentPatients = (patient) => {
    const normalized = patient.toLowerCase();
    const updated = [normalized, ...recentPatients.filter((item) => item !== normalized)].slice(0, 6);
    setRecentPatients(updated);
    localStorage.setItem("doctorRecentPatients", JSON.stringify(updated));
  };

  const loadPatientStatuses = async () => {
    if (!provider || !recentPatients.length) {
      return;
    }
    try {
      const contract = await getContract(provider, false);
      const statusMap = {};
      await Promise.all(
        recentPatients.map(async (patient) => {
          const request = await contract.accessRequests(patient, account);
          const authorized = await contract.isAuthorized(patient, account);
          statusMap[patient] = {
            status: request.status.toString(),
            message: request.message || "",
            timestamp: request.timestamp.toString(),
            authorized,
          };
        })
      );
      setPatientStatuses(statusMap);
    } catch (error) {
      console.error("Failed to load patient statuses", error);
    }
  };

  useEffect(() => {
    loadPatientStatuses();
  }, [provider, account, recentPatients]);

  const selectPatient = (patient) => {
    setSelectedPatient(patient);
    setRequestForm((current) => ({ ...current, patient }));
    setEntryForm((current) => ({ ...current, patient }));
  };

  const copyPatientAddress = async (patient) => {
    try {
      await navigator.clipboard.writeText(patient);
      setCopyMessage("Patient address copied.");
      setTimeout(() => setCopyMessage(null), 1800);
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", message: "Could not copy patient address." });
    }
  };

  const handleRequestAccess = async () => {
    const patientAddress = requestForm.patient.trim();
    if (!patientAddress) {
      setStatus({ type: "error", message: "Patient wallet address is required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Submitting access request..." });

    try {
      const contract = await getContract(provider, true);
      const tx = await contract.requestAccess(patientAddress, requestForm.message.trim());
      await tx.wait();
      saveRecentPatients(patientAddress);
      selectPatient(patientAddress);
      setStatus({ type: "success", message: "Access request sent to the patient." });
      setRequestForm((current) => ({ ...current, patient: patientAddress, message: "" }));
    } catch (error) {
      setStatus({ type: "error", message: error.reason || error.shortMessage || error.message });
    } finally {
      setLoading(false);
    }
  };

  const handleAddEntry = async () => {
    const patientAddress = entryForm.patient.trim();
    if (!patientAddress || !entryForm.title.trim() || !entryForm.file) {
      setStatus({ type: "error", message: "Patient address, title, and file are required." });
      return;
    }

    setLoading(true);
    setStatus({ type: "info", message: "Uploading file and preparing blockchain transaction..." });

    try {
      const fileData = await readFileAsDataUrl(entryForm.file);
      const uploadResponse = await uploadMedicalFile({
        file: fileData,
        patient: patientAddress,
        description: entryForm.notes.trim(),
      });

      const contract = await getContract(provider, true);
      const tx = await contract.addMedicalEntry(
        patientAddress,
        entryForm.entryType.trim(),
        uploadResponse.data.hash,
        entryForm.title.trim(),
        entryForm.notes.trim()
      );
      await tx.wait();

      saveRecentPatients(patientAddress);
      selectPatient(patientAddress);
      setStatus({ type: "success", message: "Medical entry added successfully." });
      setEntryForm({
        patient: patientAddress,
        entryType: "Prescription",
        title: "",
        notes: "",
        file: null,
      });
    } catch (error) {
      setStatus({
        type: "error",
        message: error.response?.data?.error || error.reason || error.shortMessage || error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLookup = async () => {
    const patientAddress = lookupAddress.trim();
    if (!patientAddress) {
      setStatus({ type: "error", message: "Patient wallet address is required." });
      return;
    }

    setLoading(true);
    setStatus(null);
    try {
      const contract = await getContract(provider, true);
      const [entries, authorized] = await Promise.all([
        contract.getPatientEntries(patientAddress),
        contract.isAuthorized(patientAddress, account),
      ]);
      setRecords(entries.map(formatRecord));
      setAccessCheck(authorized);
      saveRecentPatients(patientAddress);
    } catch (error) {
      setStatus({
        type: "error",
        message: error.reason || error.shortMessage || "Could not fetch patient records.",
      });
      setRecords([]);
      setAccessCheck(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="profile-card">
          <p className="eyebrow">Doctor</p>
          <h3>{profile?.name || "Registered Doctor"}</h3>
          <p>{profile?.specialty || "Medical profile"}</p>
        </div>
        <div className="sidebar-card">
          <p className="eyebrow">Recent patients</p>
          {recentPatients.length ? (
            <div className="chip-list">
              {recentPatients.map((patient) => {
                const status = patientStatuses[patient]?.status || "0";
                const authorized = patientStatuses[patient]?.authorized;
                return (
                  <div key={patient} className="patient-chip-card">
                    <button className="chip" onClick={() => selectPatient(patient)}>
                      <span>{patient.slice(0, 6)}...{patient.slice(-4)}</span>
                      <small>{authorized ? "Approved" : REQUEST_STATUS[status] || "Unknown"}</small>
                    </button>
                    <p className="patient-chip-address">{patient}</p>
                    <button className="copy-link-btn" onClick={() => copyPatientAddress(patient)}>
                      Copy address
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="muted-copy">Recent patient addresses will appear here.</p>
          )}
        </div>
        <div className="nav-group">
          <button className={`sidebar-btn ${activeTab === "request" ? "active" : ""}`} onClick={() => setActiveTab("request")}>Request Access</button>
          <button className={`sidebar-btn ${activeTab === "entry" ? "active" : ""}`} onClick={() => setActiveTab("entry")}>Add Entry</button>
          <button className={`sidebar-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>View Patient History</button>
        </div>
      </aside>

      <section className="main-content-panel">
        {status && <div className={`status-msg ${status.type}`}>{status.message}</div>}
        {copyMessage && <div className="status-msg info">{copyMessage}</div>}

        <div className="summary-grid">
          <article className="summary-card">
            <p className="eyebrow">Doctor</p>
            <h3>{profile?.name || "Registered Doctor"}</h3>
            <p>{profile?.specialty || "Medical profile"}</p>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Selected patient</p>
            <h3>{selectedPatient ? `${selectedPatient.slice(0, 6)}...${selectedPatient.slice(-4)}` : "No patient selected"}</h3>
            <p className="muted-copy patient-address-line">{selectedPatient || "Choose a recent patient to reuse the address."}</p>
          </article>
        </div>

        {activeTab === "request" && (
          <div className="stack">
            <div className="panel-header">
              <p className="eyebrow">Consent Flow</p>
              <h2>Request patient access</h2>
              <p className="subtitle">A patient needs to approve your request before you can add a record.</p>
            </div>
            <div className="form-grid">
              <label>
                <span>Patient wallet</span>
                <input
                  value={requestForm.patient}
                  onChange={(e) => setRequestForm({ ...requestForm, patient: e.target.value })}
                  placeholder="0x..."
                />
              </label>
              <label className="full-span">
                <span>Message</span>
                <textarea
                  rows="5"
                  value={requestForm.message}
                  onChange={(e) => setRequestForm({ ...requestForm, message: e.target.value })}
                  placeholder="Explain why this patient should approve access"
                />
              </label>
            </div>
            <button className="primary-btn" disabled={loading} onClick={handleRequestAccess}>
              {loading ? "Submitting..." : "Send Access Request"}
            </button>
          </div>
        )}

        {activeTab === "entry" && (
          <div className="stack">
            <div className="panel-header">
              <p className="eyebrow">Medical Entry</p>
              <h2>Add a medical record</h2>
              <p className="subtitle">Use this after the patient has approved your request.</p>
            </div>
            <div className="form-grid">
              <label>
                <span>Patient wallet</span>
                <input
                  value={entryForm.patient}
                  onChange={(e) => setEntryForm({ ...entryForm, patient: e.target.value })}
                  placeholder="0x..."
                />
              </label>
              <label>
                <span>Entry type</span>
                <input
                  value={entryForm.entryType}
                  onChange={(e) => setEntryForm({ ...entryForm, entryType: e.target.value })}
                  placeholder="Prescription"
                />
              </label>
              <label>
                <span>Title</span>
                <input
                  value={entryForm.title}
                  onChange={(e) => setEntryForm({ ...entryForm, title: e.target.value })}
                  placeholder="Follow-up medication plan"
                />
              </label>
              <label className="full-span">
                <span>Notes</span>
                <textarea
                  rows="5"
                  value={entryForm.notes}
                  onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })}
                  placeholder="Clinical summary or key remarks"
                />
              </label>
              <label className="full-span">
                <span>File</span>
                <input type="file" onChange={(e) => setEntryForm({ ...entryForm, file: e.target.files?.[0] || null })} />
              </label>
            </div>
            <button className="primary-btn" disabled={loading} onClick={handleAddEntry}>
              {loading ? "Publishing..." : "Add Medical Entry"}
            </button>
          </div>
        )}

        {activeTab === "history" && (
          <div className="stack">
            <div className="panel-header">
              <p className="eyebrow">Patient Lookup</p>
              <h2>View patient history</h2>
            </div>
            <div className="search-bar">
              <input value={lookupAddress} onChange={(e) => setLookupAddress(e.target.value)} placeholder="Patient wallet address" />
              <button onClick={handleLookup} disabled={loading}>
                {loading ? "Checking..." : "Load History"}
              </button>
            </div>
            {accessCheck !== null && (
              <div className={`status-msg ${accessCheck ? "success" : "info"}`}>
                {accessCheck ? "This patient has approved your access." : "You do not currently have access for this patient."}
              </div>
            )}
            <div className="timeline-list">
              {records.map((record, index) => (
                <article className="timeline-item" key={`${record.timestamp}-${index}`}>
                  <div className="timeline-dot" />
                  <div>
                    <div className="record-header">
                      <strong>{record.entryType}</strong>
                      <span>{new Date(Number(record.timestamp) * 1000).toLocaleString()}</span>
                    </div>
                    <h4>{record.title}</h4>
                    <p>{record.notes || "No notes attached."}</p>
                    <p className="muted-copy">Patient: {record.patient}</p>
                    <a className="view-link" href={`https://ipfs.io/ipfs/${record.ipfsHash}`} target="_blank" rel="noreferrer">
                      Open IPFS document
                    </a>
                  </div>
                </article>
              ))}
              {!records.length && <div className="empty-state">No records loaded yet. Use the patient address above to check history.</div>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
