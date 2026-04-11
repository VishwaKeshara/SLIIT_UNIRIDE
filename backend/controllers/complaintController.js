const Complaint = require("../models/Complaint");

const createComplaint = async (req, res) => {
  try {
    const { userId, userName, userEmail, title, type, message, status } = req.body;
    const normalizedTitle = title?.trim();
    const normalizedMessage = message?.trim();
    const normalizedUserName = userName?.trim();
    const normalizedEmail = userEmail?.trim().toLowerCase();
    const allowedTypes = ["booking", "driver", "schedule", "payment", "other"];

    if (
      !userId ||
      !normalizedUserName ||
      !normalizedEmail ||
      !normalizedTitle ||
      !type ||
      !normalizedMessage
    ) {
      return res.status(400).json({
        message: "User details, subject, category, and description are required.",
      });
    }

    if (!allowedTypes.includes(type)) {
      return res.status(400).json({
        message: "Please select a valid complaint category.",
      });
    }

    if (normalizedTitle.length < 8 || normalizedTitle.length > 100) {
      return res.status(400).json({
        message: "Complaint subject must be between 8 and 100 characters.",
      });
    }

    if (normalizedMessage.length < 30 || normalizedMessage.length > 1000) {
      return res.status(400).json({
        message: "Complaint description must be between 30 and 1000 characters.",
      });
    }

    const complaint = new Complaint({
      userId,
      userName: normalizedUserName,
      userEmail: normalizedEmail,
      title: normalizedTitle,
      type,
      message: normalizedMessage,
      status: status || "pending",
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully.",
      complaint,
    });
  } catch (error) {
    console.error("Create complaint error:", error);
    res.status(500).json({
      message: "Failed to submit complaint.",
      error: error.message,
    });
  }
};

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find().sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch complaints.",
      error: error.message,
    });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { status, adminResponse } = req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminResponse },
      { new: true, runValidators: true }
    );

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found." });
    }

    res.status(200).json({
      message: "Complaint updated successfully.",
      complaint: updatedComplaint,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update complaint.",
      error: error.message,
    });
  }
};

module.exports = {
  createComplaint,
  getAllComplaints,
  updateComplaint,
};
