// backend/routes/routeRoutes.js
const express = require("express");

const {
  createGeneratedRoute,
  createRoute,
  getRoutes,
  getActiveRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} = require("../controllers/routeController");

const router = express.Router();

router.post("/create", createGeneratedRoute);
router.post("/", createRoute);
router.get("/", getRoutes);
router.get("/active", getActiveRoutes);
router.get("/:id", getRouteById);
router.put("/:id", updateRoute);
router.delete("/:id", deleteRoute);

module.exports = router;
