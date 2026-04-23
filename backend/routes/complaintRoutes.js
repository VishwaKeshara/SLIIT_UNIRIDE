const express = require("express");
const router = express.Router();
const { allowAdminRoles, requireAdminAuth } = require("../middleware/adminAuth");

const {
  createComplaint,
  getAllComplaints,
  getComplaintsByUser,
  updateComplaint,
} = require("../controllers/complaintController");

router.post("/", createComplaint);
router.get("/user/:userId", getComplaintsByUser);
router.get(
  "/",
  requireAdminAuth,
  allowAdminRoles("admin", "routemanager"),
  getAllComplaints
);
router.put("/:id", requireAdminAuth, allowAdminRoles("admin"), updateComplaint);

module.exports = router;
