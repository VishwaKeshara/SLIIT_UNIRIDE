const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    route: { type: String, default: "" },
    pickupLocation: { type: String, default: "" },
    bookingDate: { type: Date, default: Date.now },
    bookingTime: { type: String, default: "" },
    status: { type: String, enum: ["Booked", "Cancelled", "Completed"], default: "Booked" }
  },
  { timestamps: true }
);

module.exports = mongoose.models.AdminBooking || mongoose.model("AdminBooking", bookingSchema);