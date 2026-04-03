// backend/controllers/bookingController.js
const Booking = require("../models/BookingModel");
const Route   = require("../models/RouteModel");

// CREATE BOOKING
exports.createBooking = async (req, res) => {
  try {
    const { passengerName, mobileNumber, route, travelStartDate, travelEndDate } = req.body;

    if (!passengerName)    return res.status(400).json({ message: "Passenger name is required" });
    if (!mobileNumber)     return res.status(400).json({ message: "Mobile number is required" });
    if (!route)            return res.status(400).json({ message: "Route is required" });
    if (!travelStartDate)  return res.status(400).json({ message: "Travel start date is required" });
    if (!travelEndDate)    return res.status(400).json({ message: "Travel end date is required" });

    // Validate mobile format (7–15 digits/+/spaces/dashes)
    if (!/^[0-9+\-\s]{7,15}$/.test(mobileNumber)) {
      return res.status(400).json({ message: "Invalid mobile number format" });
    }

    const start = new Date(travelStartDate);
    const end   = new Date(travelEndDate);
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid travel dates" });
    }
    if (end < start) {
      return res.status(400).json({ message: "End date cannot be before start date" });
    }

    const totalDays = Math.round((end - start) / 86400000) + 1;

    // Verify route exists, is active, and has available seats
    const routeDoc = await Route.findById(route);
    if (!routeDoc)              return res.status(404).json({ message: "Route not found" });
    if (!routeDoc.active)       return res.status(400).json({ message: "Selected route is not currently active" });
    if (routeDoc.seatCapacity <= 0) return res.status(400).json({ message: "No seats available on this route" });

    const pricePerDay = routeDoc.pricePerDay || 0;
    const totalAmount = pricePerDay * totalDays;

    // Decrement seat capacity atomically and create booking together
    const [, booking] = await Promise.all([
      Route.findByIdAndUpdate(route, { $inc: { seatCapacity: -1 } }, { new: true }),
      Booking.create({
        ...req.body,
        travelStartDate: start,
        travelEndDate: end,
        totalDays,
        pricePerDay,
        totalAmount,
        status: "confirmed"
      })
    ]);

    const populated = await booking.populate([
      { path: "route", select: "routeName startLocation endLocation startTime seatCapacity pricePerDay" },
      { path: "boardingStop", select: "stopName order" }
    ]);

    res.status(201).json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET ALL BOOKINGS
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.find()
      .populate("route", "routeName startLocation endLocation startTime")
      .populate("boardingStop", "stopName order")
      .sort({ createdAt: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BOOKING BY ID
exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("route")
      .populate("boardingStop");
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    res.json(booking);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET BOOKINGS BY MOBILE NUMBER (for registered or guest lookup)
exports.getBookingsByMobile = async (req, res) => {
  try {
    const bookings = await Booking.find({ mobileNumber: req.params.mobile })
      .populate("route", "routeName startLocation endLocation startTime")
      .populate("boardingStop", "stopName order")
      .sort({ travelStartDate: -1 });
    res.json(bookings);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// CANCEL BOOKING (restores the seat to the route)
exports.cancelBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "cancelled") return res.status(400).json({ message: "Booking is already cancelled" });

    // Restore seat and cancel booking atomically
    await Promise.all([
      Route.findByIdAndUpdate(booking.route, { $inc: { seatCapacity: 1 } }),
      booking.updateOne({ status: "cancelled" })
    ]);

    res.json({ ...booking.toObject(), status: "cancelled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// UPDATE PAYMENT / VERIFICATION FIELDS
exports.updateBookingPayment = async (req, res) => {
  try {
    const {
      paymentStatus,
      paymentReference,
      verificationStatus,
      receiptUrl,
    } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    if (paymentStatus !== undefined) booking.paymentStatus = paymentStatus;
    if (paymentReference !== undefined) {
      booking.paymentReference = paymentReference;
    }
    if (verificationStatus !== undefined) {
      booking.verificationStatus = verificationStatus;
    }
    if (receiptUrl !== undefined) booking.receiptUrl = receiptUrl;

    await booking.save();

    const populated = await booking.populate([
      { path: "route", select: "routeName startLocation endLocation startTime" },
      { path: "boardingStop", select: "stopName order" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// VERIFY PAYMENT AND CONFIRM BOOKING
exports.verifyBookingPayment = async (req, res) => {
  try {
    const { paymentReference = "" } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "paid";
    booking.verificationStatus = "verified";
    booking.status = "confirmed";
    if (paymentReference.trim()) {
      booking.paymentReference = paymentReference.trim();
    }

    await booking.save();

    const populated = await booking.populate([
      { path: "route", select: "routeName startLocation endLocation startTime" },
      { path: "boardingStop", select: "stopName order" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// REFUND BOOKING PAYMENT
exports.refundBookingPayment = async (req, res) => {
  try {
    const { refundReason = "" } = req.body;

    const booking = await Booking.findById(req.params.id);
    if (!booking) return res.status(404).json({ message: "Booking not found" });

    booking.paymentStatus = "refunded";
    booking.refundReason = refundReason.trim();
    booking.refundedAt = new Date();

    await booking.save();

    const populated = await booking.populate([
      { path: "route", select: "routeName startLocation endLocation startTime" },
      { path: "boardingStop", select: "stopName order" },
    ]);

    res.json(populated);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
