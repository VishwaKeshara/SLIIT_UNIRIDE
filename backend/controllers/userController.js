// backend/controllers/userController.js
const User    = require("../models/UserModel");
const Booking = require("../models/BookingModel");

// GET USER PROFILE BY ID (excludes password)
exports.getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BOOKINGS FOR A USER (matched by phoneNumber)
exports.getUserBookings = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("phoneNumber");
    if (!user) return res.status(404).json({ message: "User not found" });

    const bookings = await Booking.find({ mobileNumber: user.phoneNumber })
      .populate("route", "routeName startLocation endLocation startTime")
      .populate("boardingStop", "stopName order")
      .sort({ travelDate: -1 });

    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
