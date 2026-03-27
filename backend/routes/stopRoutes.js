// backend/routes/stopRoutes.js
const express = require("express");
const router = express.Router();

const {
  createStop,
  getStopsByRoute,
  updateStop,
  deleteStop
} = require("../controllers/stopController");

// ➕ Add Stop
router.post("/", createStop);

// 📋 Get Stops by Route
router.get("/route/:routeId", getStopsByRoute);

// ✏️ Update Stop
router.put("/:id", updateStop);

// ❌ Delete Stop
router.delete("/:id", deleteStop);

module.exports = router;