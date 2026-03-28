const mongoose = require("mongoose");

const driverSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Driver name is required"],
      trim: true,
    },
    licenseNumber: {
      type: String,
      required: [true, "License number is required"],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [8, "License Number must be exactly 8 characters"],
      maxlength: [8, "License Number must be exactly 8 characters"],
    },
    contactNumber: {
      type: String,
      required: [true, "Contact number is required"],
      match: [
        /^(\+94|0)[0-9]{9}$/,
        "Enter a valid Sri Lankan phone number (e.g. +94771234567 or 0771234567)",
      ],
    },
    assignedBus: {
      type: String,
      required: [true, "Assigned bus is required"],
      trim: true,
    },
    route: {
      type: String,
      required: [true, "Route is required"],
      trim: true,
    },
    shift: {
      type: String,
      enum: {
        values: ["Morning Shift", "Day Shift", "Evening Shift"],
        message: "Shift must be Morning Shift, Day Shift, or Evening Shift",
      },
      required: [true, "Shift is required"],
    },
    status: {
      type: String,
      enum: ["Available", "On Trip"],
      default: "Available",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Driver", driverSchema);
