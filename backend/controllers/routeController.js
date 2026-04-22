// backend/controllers/routeController.js
const Route = require("../models/RouteModel");
const {
  GoogleApiError,
  buildRoutePayload
} = require("../services/googleRouteService");

const MIN_SEAT_CAPACITY = 45;
const MAX_SEAT_CAPACITY = 56;
const MIN_START_TIME = "05:30";
const MAX_START_TIME = "18:30";

const validateRoute = (data) => {
  if (!data.routeName) return "Route name is required";
  if (!data.startLocation) return "Start location is required";
  if (!data.endLocation) return "End location is required";
  if (data.startLocation === data.endLocation) {
    return "Start and End cannot be same";
  }

  if (!data.seatCapacity) return "Seat capacity is required";
  if (Number(data.seatCapacity) < MIN_SEAT_CAPACITY) {
    return `Seat capacity must be at least ${MIN_SEAT_CAPACITY}`;
  }
  if (Number(data.seatCapacity) > MAX_SEAT_CAPACITY) {
    return `Seat capacity cannot exceed ${MAX_SEAT_CAPACITY}`;
  }

  if (!data.startTime) return "Start time is required";
  if (data.startTime < MIN_START_TIME || data.startTime > MAX_START_TIME) {
    return "Start time must be between 05:30 AM and 06:30 PM";
  }

  if (data.recurrence === "weekly" && (!data.days || data.days.length === 0)) {
    return "Select at least one day for weekly schedule";
  }

  return null;
};

const validateRouteLocations = (data) => {
  if (!data.startLocation) return "Start location is required";
  if (!data.endLocation) return "End location is required";
  if (data.startLocation.trim() === data.endLocation.trim()) {
    return "Start and End cannot be same";
  }

  return null;
};

const buildRouteDocument = (body, generatedRoute) => ({
  routeName:
    body.routeName || `${generatedRoute.startLocation} to ${generatedRoute.endLocation}`,
  startLocation: generatedRoute.startLocation,
  endLocation: generatedRoute.endLocation,
  seatCapacity: body.seatCapacity,
  startTime: body.startTime,
  recurrence: body.recurrence || "none",
  days: Array.isArray(body.days) ? body.days : [],
  active: body.active ?? true,
  pricePerDay: body.pricePerDay ?? 0,
  distance: generatedRoute.distance,
  duration: generatedRoute.duration,
  polyline: generatedRoute.polyline,
  stops: generatedRoute.stops
});

exports.createGeneratedRoute = async (req, res) => {
  try {
    const error = validateRouteLocations(req.body);
    if (error) {
      return res.status(400).json({ message: error });
    }

    const generatedRoute = await buildRoutePayload({
      startLocation: req.body.startLocation.trim(),
      endLocation: req.body.endLocation.trim()
    });

    const route = await Route.create(buildRouteDocument(req.body, generatedRoute));

    return res.status(201).json({
      message: "Route created successfully",
      route
    });
  } catch (error) {
    if (error instanceof GoogleApiError) {
      return res.status(error.statusCode).json({ message: error.message });
    }

    return res.status(500).json({ message: error.message });
  }
};

exports.createRoute = async (req, res) => {
  try {
    const error = validateRoute(req.body);
    if (error) return res.status(400).json({ message: error });

    const route = await Route.create(req.body);
    return res.status(201).json(route);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRoutes = async (req, res) => {
  try {
    const routes = await Route.find().sort({ createdAt: -1 });
    return res.json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getActiveRoutes = async (req, res) => {
  try {
    const routes = await Route.find({ active: true }).sort({ createdAt: -1 });
    return res.json(routes);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getRouteById = async (req, res) => {
  try {
    const route = await Route.findById(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    return res.json(route);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.updateRoute = async (req, res) => {
  try {
    const error = validateRoute(req.body);
    if (error) return res.status(400).json({ message: error });

    const route = await Route.findByIdAndUpdate(req.params.id, req.body, {
      new: true
    });

    if (!route) return res.status(404).json({ message: "Route not found" });

    return res.json(route);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteRoute = async (req, res) => {
  try {
    const route = await Route.findByIdAndDelete(req.params.id);
    if (!route) return res.status(404).json({ message: "Route not found" });

    return res.json({ message: "Route deleted successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
