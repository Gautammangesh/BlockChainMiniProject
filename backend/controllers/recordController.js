const { uploadToIPFS } = require("../services/ipfsService");
const { addRecord, fetchRecords } = require("../services/blockchainService");

exports.uploadRecord = async (req, res) => {
  try {
    const { file, patient, description } = req.body;

    if (!file || !patient) {
      return res.status(400).json({ error: "File and patient address are required." });
    }

    const hash = await uploadToIPFS(file);
    await addRecord(patient, hash, description || "No description");

    res.json({ success: true, hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const data = await fetchRecords(req.params.address);
    // Convert ethers result (with numeric/named keys) to clean objects for JSON serialization
    const formattedData = data.map(record => ({
      patient: record.patient,
      doctor: record.doctor,
      ipfsHash: record.ipfsHash,
      description: record.description,
      timestamp: record.timestamp.toString(),
    }));
    res.json(formattedData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
