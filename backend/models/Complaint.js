const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    complaintType: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    status: { type: String, enum: ["Pending", "In Progress", "Resolved"], default: "Pending" },
    adminReply: { type: String, default: "" }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);