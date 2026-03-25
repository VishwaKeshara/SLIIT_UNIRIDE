const express = require("express");
const cors = require("cors");
const routeRoutes = require("./routes/routeRoutes");
const driverRoutes = require("./routes/driverRoutes");
const tripRoutes = require("./routes/tripRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SLIIT-UniRide Backend Running");
});

app.use("/api/routes", routeRoutes);
app.use("/api/drivers", driverRoutes);
app.use("/api/trips", tripRoutes);

module.exports = app;
