// backend/routes/bookingRoutes.js
const express = require("express");
const router  = express.Router();

const {
  createBooking,
  getBookings,
  getBookingById,
  getBookingsByMobile,
  cancelBooking
} = require("../controllers/bookingController");

// CREATE
router.post("/", createBooking);

// GET ALL
router.get("/", getBookings);

// GET BY MOBILE (before /:id to avoid route conflict)
router.get("/mobile/:mobile", getBookingsByMobile);

// GET BY ID
router.get("/:id", getBookingById);

// CANCEL
router.put("/:id/cancel", cancelBooking);

module.exports = router;
