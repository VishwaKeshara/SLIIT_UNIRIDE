const mongoose = require("mongoose");

const tripSchema = new mongoose.Schema(
  {
    driver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Driver",
      required: [true, "Driver is required"],
    },
    route: {
      type: String,
      required: [true, "Route is required"],
      trim: true,
    },
    date: {
      type: String,
      required: [true, "Date is required"],
    },
    startTime: {
      type: String,
      required: [true, "Start time is required"],
    },
    endTime: {
      type: String,
      required: [true, "End time is required"],
    },
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed", "Delayed"],
      default: "Scheduled",
    },
    delayReason: {
      type: String,
      default: "",
    },
    passengers: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Trip", tripSchema);
