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

    travelStartDate: { type: Date, required: true },
    travelEndDate:   { type: Date, required: true },
    totalDays:       { type: Number, required: true, min: 1 },
    pricePerDay:     { type: Number, default: 0 },
    totalAmount:     { type: Number, default: 0 },

    status: {
      type: String,
      enum: ["confirmed", "cancelled"],
      default: "confirmed"
    },

    paymentMethod: {
      type: String,
      enum: ["card", "cash", "wallet"],
      default: "cash",
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "paid", "failed", "refunded"],
      default: "pending",
    },
    paymentReference: { type: String },
    verificationStatus: {
      type: String,
      enum: ["unverified", "verified", "rejected"],
      default: "unverified",
    },
    receiptUrl: { type: String, default: "" },
    refundReason: { type: String, default: "" },
    refundedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.models.Booking || mongoose.model("Booking", bookingSchema);
