// backend/models/RouteModel.js
const mongoose = require("mongoose");

const routeStopSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true }
  },
  { _id: false }
);

const routeSchema = new mongoose.Schema(
  {
    routeName: { type: String, trim: true },
    startLocation: { type: String, required: true, trim: true },
    endLocation: { type: String, required: true, trim: true },
    seatCapacity: { type: Number, min: 1 },
    startTime: { type: String },
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly"],
      default: "none"
    },
    days: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: []
    },
    active: { type: Boolean, default: true },
    pricePerDay: { type: Number, default: 0, min: 0 },
    distance: { type: Number, min: 0 },
    duration: { type: Number, min: 0 },
    polyline: { type: String },
    stops: { type: [routeStopSchema], default: [] }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);
