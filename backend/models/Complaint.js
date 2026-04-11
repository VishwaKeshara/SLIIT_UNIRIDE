const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      required: true,
      trim: true,
    },
    userEmail: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 8,
      maxlength: 100,
    },
    type: {
      type: String,
      enum: ["booking", "driver", "schedule", "payment", "other"],
      required: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
      minlength: 30,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ["pending", "in progress", "resolved", "rejected"],
      default: "pending",
    },
    adminResponse: {
      type: String,
      default: "",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
