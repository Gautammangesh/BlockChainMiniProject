const { uploadToIPFS } = require("../services/ipfsService");
const {
  fetchRecords,
  fetchPendingRequests,
  fetchPatientRequests,
  fetchAccessStatus,
} = require("../services/blockchainService");

exports.uploadRecord = async (req, res) => {
  try {
    const { file, patient, description } = req.body;

    if (!file || !patient) {
      return res.status(400).json({ error: "File and patient address are required." });
    }

    const hash = await uploadToIPFS(file);
    res.json({
      success: true,
      hash,
      patient,
      description: description || "No description",
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const data = await fetchRecords(req.params.address);
    const formattedData = data.map(record => ({
      doctor: record.doctor,
      patient: record.patient,
      entryType: record.entryType,
      ipfsHash: record.ipfsHash,
      title: record.title,
      notes: record.notes,
      timestamp: record.timestamp.toString(),
    }));
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPendingRequests = async (req, res) => {
  try {
    const data = await fetchPendingRequests(req.params.address);
    const formattedData = data.map(request => ({
      doctor: request.doctor,
      message: request.message,
      status: Number(request.status),
      timestamp: request.timestamp.toString(),
    }));
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getPatientRequests = async (req, res) => {
  try {
    const data = await fetchPatientRequests(req.params.address);
    const formattedData = data.map(request => ({
      doctor: request.doctor,
      message: request.message,
      status: Number(request.status),
      timestamp: request.timestamp.toString(),
    }));
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getAccessStatus = async (req, res) => {
  try {
    const authorized = await fetchAccessStatus(req.params.patient, req.params.doctor);
    res.json({ authorized });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
