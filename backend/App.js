const express = require("express");
const cors = require("cors");

const routeRoutes   = require("./routes/routeRoutes");
const stopRoutes    = require("./routes/stopRoutes");
const bookingRoutes = require("./routes/bookingRoutes");
const userRoutes    = require("./routes/userRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(" SLIIT-UniRide Backend Running");
});

app.use("/api/routes",   routeRoutes);
app.use("/api/stops",    stopRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/users",    userRoutes);

app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Server error" });
});

module.exports = app;
