const Notification = require("../models/Notification");

// Get notifications for a user
exports.getUserNotifications = async (req, res) => {
  try {
    const userId = req.params.userId;
    const notifications = await Notification.find({ userId })
      .populate("bookingId", "route passengerName paymentStatus")
      .sort({ createdAt: -1 });

    res.json(notifications);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Mark notification as read
exports.markAsRead = async (req, res) => {
  try {
    const notification = await Notification.findByIdAndUpdate(
      req.params.id,
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ message: "Notification not found!" });
    }

    res.json(notification);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Create notification (internal function)
exports.createNotification = async (
  userId,
  type,
  title,
  message,
  bookingId = null,
  metadata = {},
  tripId = null
) => {
  try {
    const notification = new Notification({
      userId,
      type,
      title,
      message,
      bookingId,
      tripId,
      metadata
    });

    await notification.save();
    console.log(`Notification created: ${type} for user ${userId}`);
    return notification;
  } catch (err) {
    console.error("Error creating notification:", err);
    throw err;
  }
};
