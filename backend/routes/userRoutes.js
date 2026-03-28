const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  forgotPassword,
  getUserById,
  getUserBookings,
} = require("../controllers/userController");

router.post("/register",        registerUser);
router.post("/login",           loginUser);
router.put("/forgot-password",  forgotPassword);
router.get("/:id",              getUserById);       // profile
router.get("/:id/bookings",     getUserBookings);   // user bookings

module.exports = router;
