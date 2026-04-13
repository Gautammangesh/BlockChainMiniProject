const express = require("express");
const router = express.Router();

const {
  uploadRecord,
  getRecords,
} = require("../controllers/recordController");

router.post("/upload", uploadRecord);
router.get("/:address", getRecords);

module.exports = router;
