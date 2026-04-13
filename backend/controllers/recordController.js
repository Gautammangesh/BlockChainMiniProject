const { uploadToIPFS } = require("../services/ipfsService");
const { addRecord, fetchRecords } = require("../services/blockchainService");

exports.uploadRecord = async (req, res) => {
  try {
    const { file, patient } = req.body;

    const hash = await uploadToIPFS(file);
    await addRecord(patient, hash);

    res.json({ success: true, hash });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

exports.getRecords = async (req, res) => {
  try {
    const data = await fetchRecords(req.params.address);
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
