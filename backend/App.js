const express = require("express");
const cors = require("cors");

const routeRoutes = require("./routes/routeRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");

const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoutes");
const complaintRoutes = require("./routes/complaintRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/api/admin", adminRoutes);
app.use("/api/users", userRoutes);
app.use("/api/complaints", complaintRoutes);

app.use("/api/routes", routeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("SLIIT-UniRide Backend Running");
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;