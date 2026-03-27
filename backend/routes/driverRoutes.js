const express = require("express");
const router = express.Router();
const Driver = require("../models/Driver");
const Trip = require("../models/Trip");

// GET all drivers
router.get("/", async (req, res) => {
  try {
    const drivers = await Driver.find().sort({ createdAt: -1 });
    res.json(drivers);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single driver
router.get("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });
    res.json(driver);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create driver
router.post("/", async (req, res) => {
  try {
    // Check for duplicate license number
    const existing = await Driver.findOne({ licenseNumber: req.body.licenseNumber?.toUpperCase() });
    if (existing) {
      return res.status(400).json({ message: "License number already registered" });
    }
    const driver = new Driver(req.body);
    const saved = await driver.save();
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT update driver
router.put("/:id", async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) return res.status(404).json({ message: "Driver not found" });

    // If changing license, check uniqueness
    if (
      req.body.licenseNumber &&
      req.body.licenseNumber.toUpperCase() !== driver.licenseNumber
    ) {
      const existing = await Driver.findOne({
        licenseNumber: req.body.licenseNumber.toUpperCase(),
      });
      if (existing) {
        return res.status(400).json({ message: "License number already registered" });
      }
    }

    const updated = await Driver.findByIdAndUpdate(
      req.params.id,
      { ...req.body },
      { new: true, runValidators: true }
    );
    res.json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
});

// DELETE driver
router.delete("/:id", async (req, res) => {
  try {
    const activeTrip = await Trip.findOne({
      driver: req.params.id,
      status: { $in: ["Scheduled", "Ongoing"] },
    });
    if (activeTrip) {
      return res.status(400).json({
        message: "Cannot delete driver with active or scheduled trips",
      });
    }
    await Driver.findByIdAndDelete(req.params.id);
    res.json({ message: "Driver deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
