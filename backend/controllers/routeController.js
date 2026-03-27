// backend/controllers/routeController.js
const Route = require("../models/RouteModel");

// 🔍 Validation function
const validateRoute = (data) => {
  if (!data.routeName) return "Route name is required";
  if (!data.startLocation) return "Start location is required";
  if (!data.endLocation) return "End location is required";
  if (data.startLocation === data.endLocation)
    return "Start and End cannot be same";

  if (!data.seatCapacity || data.seatCapacity <= 0)
    return "Invalid seat capacity";

  if (!data.startTime) return "Start time is required";

  if (data.recurrence === "weekly" && (!data.days || data.days.length === 0))
    return "Select at least one day for weekly schedule";

  return null;
};

// CREATE
exports.createRoute = async (req, res) => {
  try {
    const error = validateRoute(req.body);
    if (error) return res.status(400).json({ message: error });

    const route = await Route.create(req.body);
    res.status(201).json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL
exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ACTIVE ROUTES
exports.getActiveRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ active: true }).sort({ createdAt: -1 });
    res.json(routes);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BY ID
exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE
exports.updateRoute = async (req, res) => {
  try {
    const error = validateRoute(req.body);
    if (error) return res.status(400).json({ message: error });

    const route = await Route.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json(route);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE
exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    res.json({ message: "Route deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
