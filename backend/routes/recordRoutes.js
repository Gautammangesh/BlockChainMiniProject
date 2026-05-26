const express = require("express");
const router = express.Router();

const {
  uploadRecord,
  getRecords,
  getPendingRequests,
  getPatientRequests,
  getAccessStatus,
} = require("../controllers/recordController");

router.post("/upload", uploadRecord);
router.get("/patient/:address/requests", getPatientRequests);
router.get("/patient/:address/pending", getPendingRequests);
router.get("/access/:patient/:doctor", getAccessStatus);
router.get("/:address", getRecords);

module.exports = router;
