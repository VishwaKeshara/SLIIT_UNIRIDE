const express = require("express");
const router = express.Router();

const {
  createComplaint,
  getAllComplaints,
  getComplaintsByUser,
  updateComplaint,
} = require("../controllers/complaintController");

router.post("/", createComplaint);
router.get("/", getAllComplaints);
router.get("/user/:userId", getComplaintsByUser);
router.put("/:id", updateComplaint);

module.exports = router;
