const Complaint = require("../models/Complaint");

const getAllComplaints = async (req, res) => {
  try {
    const complaints = await Complaint.find()
      .populate("userId", "name email role")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch complaints", error: error.message });
  }
};

const updateComplaint = async (req, res) => {
  try {
    const { status, adminReply } = req.body;

    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      { status, adminReply },
      { new: true, runValidators: true }
    ).populate("userId", "name email role");

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint: updatedComplaint
    });
  } catch (error) {
    res.status(500).json({ message: "Failed to update complaint", error: error.message });
  }
};

module.exports = {
  getAllComplaints,
  updateComplaint
};