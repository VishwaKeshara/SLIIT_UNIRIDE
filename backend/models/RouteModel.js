// backend/models/RouteModel.js
const mongoose = require("mongoose");

const routeSchema = new mongoose.Schema(
  {
    routeName: { type: String, required: true },
    startLocation: { type: String, required: true },
    endLocation: { type: String, required: true },
    seatCapacity: { type: Number, required: true },

    // ⏰ Start Time
    startTime: { type: String, required: true },

    // 🔁 Recurrence
    recurrence: {
      type: String,
      enum: ["none", "daily", "weekly"],
      default: "none"
    },

    // 📅 Days (only for weekly)
    days: {
      type: [String],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
      default: []
    },

    active: { type: Boolean, default: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Route", routeSchema);