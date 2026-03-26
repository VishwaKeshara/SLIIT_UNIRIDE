const Complaint = require("../models/Complaint");

const createComplaint = async (req, res) => {
  try {
    const { userId, userName, userEmail, title, type, message, status } = req.body;

    if (!userId || !userName || !userEmail || !title || !type || !message) {
      return res.status(400).json({
        message: "Title, type, and message are required.",
      });
    }

    const complaint = new Complaint({
      userId,
      userName,
      userEmail,
      title,
      type,
      message,
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