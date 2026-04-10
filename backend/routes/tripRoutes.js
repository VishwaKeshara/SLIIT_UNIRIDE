const express = require("express");
const router = express.Router();
const Trip = require("../models/Trip");
const Driver = require("../models/Driver");

// Helper: check if times overlap for a driver on the same date
async function hasOverlap(driverId, date, startTime, endTime, excludeId = null) {
  const query = {
    driver: driverId,
    date,
    status: { $nin: ["Completed"] },
  };
  if (excludeId) query._id = { $ne: excludeId };

  const trips = await Trip.find(query);
  for (const t of trips) {
    const newStart = startTime;
    const newEnd = endTime;
    // Overlap: newStart < existingEnd AND newEnd > existingStart
    if (newStart < t.endTime && newEnd > t.startTime) return true;
  }
  return false;
}

// GET all trips
router.get("/", async (req, res) => {
  try {
    const trips = await Trip.find().populate("driver", "name assignedBus licenseNumber").sort({ date: -1, startTime: -1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET single trip
router.get("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate("driver");
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// POST create trip
router.post("/", async (req, res) => {
  try {
    const { driver, date, startTime, endTime } = req.body;

    // Check driver exists and is available
    const driverDoc = await Driver.findById(driver);
    if (!driverDoc) return res.status(404).json({ message: "Driver not found" });
    if (driverDoc.status === "On Trip") {
      return res.status(400).json({ message: "Driver is currently On Trip and cannot be assigned" });
    }

    // Check overlap
    const overlap = await hasOverlap(driver, date, startTime, endTime);
    if (overlap) {
      return res.status(400).json({ message: "Driver already has an overlapping trip at this time" });
    }

    const trip = new Trip(req.body);
    const saved = await trip.save();
    const populated = await saved.populate("driver", "name assignedBus licenseNumber");
    res.status(201).json(populated);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
});

// PUT update trip details
router.put("/:id", async (req, res) => {
  try {
    const { driver, date, startTime, endTime } = req.body;
    const overlap = await hasOverlap(driver, date, startTime, endTime, req.params.id);
    if (overlap) {
      return res.status(400).json({ message: "Driver already has an overlapping trip at this time" });
    }
    const updated = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    }).populate("driver", "name assignedBus licenseNumber");
    res.json(updated);
  } catch (err) {
    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({ message: messages.join(", ") });
    }
    res.status(500).json({ message: err.message });
  }
});

// PATCH update trip status (Start / End / Delay)
router.patch("/:id/status", async (req, res) => {
  try {
    const { status, delayReason } = req.body;

    if (!["Scheduled", "Ongoing", "Completed", "Delayed"].includes(status)) {
      return res.status(400).json({ message: "Invalid status value" });
    }
    if (status === "Delayed" && !delayReason?.trim()) {
      return res.status(400).json({ message: "Delay reason is required when status is Delayed" });
    }

    const trip = await Trip.findByIdAndUpdate(
      req.params.id,
      { status, delayReason: delayReason || "" },
      { new: true }
    ).populate("driver", "name assignedBus status");

    if (!trip) return res.status(404).json({ message: "Trip not found" });

    // Auto-update driver status
    let driverStatus = "Available";
    if (status === "Ongoing") driverStatus = "On Trip";
    await Driver.findByIdAndUpdate(trip.driver._id, { status: driverStatus });

    res.json(trip);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET trips by driver
router.get("/driver/:driverId", async (req, res) => {
  try {
    const trips = await Trip.find({ driver: req.params.driverId })
      .populate("driver", "name assignedBus")
      .sort({ date: 1, startTime: 1 });
    res.json(trips);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// DELETE trip
router.delete("/:id", async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return res.status(404).json({ message: "Trip not found" });
    if (trip.status === "Ongoing") {
      return res.status(400).json({ message: "Cannot delete an ongoing trip" });
    }
    await Trip.findByIdAndDelete(req.params.id);
    res.json({ message: "Trip deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
