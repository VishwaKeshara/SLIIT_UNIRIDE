// backend/routes/bookingRoutes.js
const express = require("express");
const router  = express.Router();
const { allowAdminRoles, requireAdminAuth } = require("../middleware/adminAuth");

const {
  createBooking,
  getBookings,
  getBookingById,
  getBookingsByMobile,
  cancelBooking,
  updateBookingPayment,
  verifyBookingPayment,
  refundBookingPayment,
} = require("../controllers/bookingController");

// CREATE
router.post("/", createBooking);

// GET ALL
router.get("/", requireAdminAuth, allowAdminRoles("admin", "routemanager"), getBookings);

// GET BY MOBILE (before /:id to avoid route conflict)
router.get("/mobile/:mobile", getBookingsByMobile);

// GET BY ID
router.get("/:id", getBookingById);

// PAYMENT ADMIN ACTIONS
router.patch("/:id/payment", requireAdminAuth, allowAdminRoles("admin"), updateBookingPayment);
router.patch("/:id/verify-payment", requireAdminAuth, allowAdminRoles("admin"), verifyBookingPayment);
router.patch("/:id/refund", requireAdminAuth, allowAdminRoles("admin"), refundBookingPayment);

// CANCEL
router.put("/:id/cancel", cancelBooking);

module.exports = router;
