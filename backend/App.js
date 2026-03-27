const express = require("express");
const cors = require("cors");
const routeRoutes = require("./routes/routeRoutes");

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("SLIIT-UniRide Backend Running");
});

app.use("/api/routes", routeRoutes);

module.exports = app;
