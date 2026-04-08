// backend/controllers/stopController.js
const Stop = require("../models/StopModel");

// ➕ Add Stop
exports.createStop = async (req, res) => {
  try {
    const { stopName, route } = req.body;

    if (!stopName || !route) {
      return res.status(400).json({ message: "Missing fields" });
    }

    // 🔢 Auto assign order (last + 1)
    const lastStop = await Stop.findOne({ route })
      .sort({ order: -1 });

    const newOrder = lastStop ? lastStop.order + 1 : 1;

    const stop = await Stop.create({
      stopName,
      route,
      order: newOrder
    });

    res.status(201).json(stop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// 📋 Get Stops by Route (ordered)
exports.getStopsByRoute = async (req, res) => {
  try {
    const stops = await Stop.find({ route: req.params.routeId })
      .sort({ order: 1 });

    res.json(stops);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✏️ Update Stop
exports.updateStop = async (req, res) => {
  try {
    const stop = await Stop.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    res.json(stop);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ❌ Delete Stop
exports.deleteStop = async (req, res) => {
  try {
    const stop = await Stop.findByIdAndDelete(req.params.id);

    if (!stop) {
      return res.status(404).json({ message: "Stop not found" });
    }

    res.json({ message: "Stop deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
