// backend/routes/userRoutes.js
const express = require("express");
const router  = express.Router();

const { getUserById, getUserBookings } = require("../controllers/userController");

// GET USER PROFILE
router.get("/:id", getUserById);

// GET USER'S BOOKINGS
router.get("/:id/bookings", getUserBookings);

module.exports = router;
