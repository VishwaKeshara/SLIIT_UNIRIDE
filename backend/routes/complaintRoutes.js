const express = require("express");
const router = express.Router();
const {
  getAllComplaints,
  updateComplaint
} = require("../controllers/complaintController");

router.get("/", getAllComplaints);
router.put("/:id", updateComplaint);

module.exports = router;