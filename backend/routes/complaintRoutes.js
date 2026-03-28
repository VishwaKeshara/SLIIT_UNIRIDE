const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  updateComplaint,
} = require("../controllers/complaintController");

router.post("/", createComplaint);
router.get("/", getAllComplaints);
router.put("/:id", updateComplaint);

module.exports = router;