const express = require("express");
const router = express.Router();

const {
  getUserNotifications,
  markAsRead,
} = require("../controllers/notificationController");

// Get notifications for a user
router.get("/user/:userId", getUserNotifications);

// Mark notification as read
router.patch("/:id/read", markAsRead);

module.exports = router;