import { useEffect, useState } from "react";
import { getContract } from "../utils/contract";

const REQUEST_STATUS = {
  0: "None",
  1: "Pending",
  2: "Approved",
  3: "Rejected",
  4: "Revoked",
};

export default function PatientDashboard({ account, provider, profile }) {
  const [activeTab, setActiveTab] = useState("requests");
  const [requests, setRequests] = useState([]);
  const [records, setRecords] = useState([]);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  const formatRequest = (request, doctorProfile) => ({
    doctor: request.doctor,
    doctorName: doctorProfile?.name || "Unknown Doctor",
    specialty: doctorProfile?.specialty || "General Practice",
    message: request.message,
    status: Number(request.status),
    timestamp: request.timestamp.toString(),
  });

  const formatRecord = (record, doctorProfile) => ({
    doctor: record.doctor,
    doctorName: doctorProfile?.name || "Unknown Doctor",
    specialty: doctorProfile?.specialty || "General Practice",
    patient: record.patient,
    entryType: record.entryType,
    ipfsHash: record.ipfsHash,
    title: record.title,
    notes: record.notes,
    timestamp: record.timestamp.toString(),
  });

  const loadRequests = async () => {
    try {
      const contract = await getContract(provider, true);
      const data = await contract.getPatientRequests(account);
      const enriched = await Promise.all(
        data.map(async (request) => {
          const doctorProfile = await contract.doctors(request.doctor);
          return formatRequest(request, doctorProfile);
        })
      );
      setRequests(enriched);
    } catch (error) {
      setStatus({ type: "error", message: error.reason || error.shortMessage || "Could not load doctor requests." });
    }
  };

  const loadRecords = async () => {
    try {
      const contract = await getContract(provider, true);
      const data = await contract.getPatientEntries(account);
      const enriched = await Promise.all(
        data.map(async (record) => {
          const doctorProfile = await contract.doctors(record.doctor);
          return formatRecord(record, doctorProfile);
        })
      );
      setRecords(enriched.sort((a, b) => Number(b.timestamp) - Number(a.timestamp)));
    } catch (error) {
      setStatus({ type: "error", message: error.reason || error.shortMessage || "Could not load medical history." });
    }
  };

  useEffect(() => {
    if (!account) {
      return;
    }
    loadRequests();
    loadRecords();
  }, [account]);

  const respondToRequest = async (doctor, approve) => {
    setLoading(true);
    setStatus({ type: "info", message: `Submitting ${approve ? "approval" : "rejection"} transaction...` });
    try {
      const contract = await getContract(provider, true);
      const tx = await contract.respondToRequest(doctor, approve);
      await tx.wait();
      setStatus({ type: "success", message: `Request ${approve ? "approved" : "rejected"} successfully.` });
      await Promise.all([loadRequests(), loadRecords()]);
    } catch (error) {
      setStatus({ type: "error", message: error.reason || error.shortMessage || error.message });
    } finally {
      setLoading(false);
    }
  };

  const revokeAccess = async (doctor) => {
    if (!window.confirm("Revoke access for this doctor? This cannot be undone without a new approval.")) {
      return;
    }
    setLoading(true);
    setStatus({ type: "info", message: "Submitting revoke transaction..." });
    try {
      const contract = await getContract(provider, true);
      const tx = await contract.revokeAccess(doctor);
      await tx.wait();
      setStatus({ type: "success", message: "Doctor access revoked." });
      await Promise.all([loadRequests(), loadRecords()]);
    } catch (error) {
      setStatus({ type: "error", message: error.reason || error.shortMessage || error.message });
    } finally {
      setLoading(false);
    }
  };

  const pending = requests.filter((request) => request.status === 1);
  const approved = requests.filter((request) => request.status === 2);
  const rejected = requests.filter((request) => request.status === 3);
  const revoked = requests.filter((request) => request.status === 4);

  return (
    <div className="dashboard-layout">
      <aside className="dashboard-sidebar">
        <div className="profile-card">
          <p className="eyebrow">Patient</p>
          <h3>{profile?.name || "Registered Patient"}</h3>
          <p>Manage doctor access and view your records.</p>
        </div>
        <div className="sidebar-card">
          <p className="eyebrow">Access</p>
          <p className="muted-copy">Review requests and manage doctor access.</p>
        </div>
        <div className="nav-group">
          <button className={`sidebar-btn ${activeTab === "requests" ? "active" : ""}`} onClick={() => setActiveTab("requests")}>Manage Requests</button>
          <button className={`sidebar-btn ${activeTab === "history" ? "active" : ""}`} onClick={() => setActiveTab("history")}>View History</button>
        </div>
      </aside>

      <section className="main-content-panel">
        {status && <div className={`status-msg ${status.type}`}>{status.message}</div>}

        <div className="summary-grid">
          <article className="summary-card">
            <p className="eyebrow">Pending</p>
            <h3>{pending.length}</h3>
            <p className="muted-copy">Waiting for review.</p>
          </article>
          <article className="summary-card">
            <p className="eyebrow">Approved</p>
            <h3>{approved.length}</h3>
            <p className="muted-copy">Currently allowed.</p>
          </article>
          <article className="summary-card">
            <p className="eyebrow">History</p>
            <h3>{records.length}</h3>
            <p className="muted-copy">Saved records.</p>
          </article>
        </div>

        {activeTab === "requests" && (
          <div className="stack">
            <div className="panel-header">
              <p className="eyebrow">Consent Requests</p>
              <h2>Manage doctor access</h2>
              <p className="subtitle">Review each doctor request before allowing access to your records.</p>
            </div>
            <div className="records-grid">
              {pending.length ? pending.map((request, index) => (
                <article className="record-card" key={`${request.doctor}-${index}`}>
                  <div className="record-header">
                    <span className="status-badge pending">Pending</span>
                    <span>{new Date(Number(request.timestamp) * 1000).toLocaleString()}</span>
                  </div>
                  <h4>{request.doctorName}</h4>
                  <p className="muted-copy">{request.specialty}</p>
                  <p className="muted-copy">{request.doctor}</p>
                  <p>{request.message || "No message attached."}</p>
                  <div className="action-row">
                    <button className="primary-btn slim" disabled={loading} onClick={() => respondToRequest(request.doctor, true)}>Approve</button>
                    <button className="secondary-btn slim" disabled={loading} onClick={() => respondToRequest(request.doctor, false)}>Reject</button>
                  </div>
                </article>
              )) : <div className="empty-state">No new requests yet. Doctor requests will appear here when they are sent.</div>}
            </div>
            <div className="records-grid">
              {approved.map((request, index) => (
                <article className="record-card" key={`approved-${request.doctor}-${index}`}>
                  <div className="record-header">
                    <span className="status-badge approved">Approved</span>
                    <span>{new Date(Number(request.timestamp) * 1000).toLocaleDateString()}</span>
                  </div>
                  <h4>{request.doctorName}</h4>
                  <p className="muted-copy">{request.specialty}</p>
                  <p className="muted-copy">{request.doctor}</p>
                  <button className="danger-btn slim" disabled={loading} onClick={() => revokeAccess(request.doctor)}>Revoke access</button>
                </article>
              ))}
            </div>
            {rejected.length > 0 && (
              <div className="records-grid">
                {rejected.map((request, index) => (
                  <article className="record-card" key={`rejected-${request.doctor}-${index}`}>
                    <div className="record-header">
                      <span className="status-badge rejected">Rejected</span>
                      <span>{new Date(Number(request.timestamp) * 1000).toLocaleDateString()}</span>
                    </div>
                    <h4>{request.doctorName}</h4>
                    <p className="muted-copy">{request.specialty}</p>
                    <p className="muted-copy">{request.doctor}</p>
                  </article>
                ))}
              </div>
            )}
            {revoked.length > 0 && (
              <div className="records-grid">
                {revoked.map((request, index) => (
                  <article className="record-card" key={`revoked-${request.doctor}-${index}`}>
                    <div className="record-header">
                      <span className="status-badge revoked">Revoked</span>
                      <span>{new Date(Number(request.timestamp) * 1000).toLocaleDateString()}</span>
                    </div>
                    <h4>{request.doctorName}</h4>
                    <p className="muted-copy">{request.specialty}</p>
                    <p className="muted-copy">{request.doctor}</p>
                  </article>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "history" && (
          <div className="stack">
            <div className="panel-header">
              <p className="eyebrow">Medical History</p>
              <h2>Your record history</h2>
              <p className="subtitle">Browse the records that have been added to your account.</p>
            </div>
            <div className="timeline-list">
              {records.map((record, index) => (
                <article className="timeline-item" key={`${record.timestamp}-${index}`}>
                  <div className="timeline-dot" />
                  <div>
                    <div className="record-header">
                      <span>{record.entryType}</span>
                      <span>{new Date(Number(record.timestamp) * 1000).toLocaleString()}</span>
                    </div>
                    <h4>{record.title}</h4>
                    <p>{record.notes || "No notes attached."}</p>
                    <p className="muted-copy">Doctor: {record.doctorName} — {record.specialty}</p>
                    <p className="muted-copy">Wallet: {record.doctor}</p>
                    <a className="view-link" href={`https://ipfs.io/ipfs/${record.ipfsHash}`} target="_blank" rel="noreferrer">Open IPFS document</a>
                  </div>
                </article>
              ))}
              {!records.length && <div className="empty-state">No records yet. New entries will appear here after a doctor adds them.</div>}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
