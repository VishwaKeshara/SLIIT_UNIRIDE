// backend/models/BookingModel.js
const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    passengerName: { type: String, required: true },
    mobileNumber:  { type: String, required: true },
    email:         { type: String },
    studentId:     { type: String },
    isRegistered:  { type: Boolean, default: false },

    route: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Route",
      required: true
    },

    boardingStop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Stop"
    },

    travelDate: { type: Date, required: true },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Booking", bookingSchema);
