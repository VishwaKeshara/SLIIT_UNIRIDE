// backend/routes/routeRoutes.js
const express = require("express");
const router = express.Router();

const {
  createRoute,
  getRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} = require("../controllers/routeController");

// CREATE
router.post("/", createRoute);

// GET ALL
router.get("/", getRoutes);

// GET BY ID
router.get("/:id", getRouteById);

// UPDATE
router.put("/:id", updateRoute);

// DELETE
router.delete("/:id", deleteRoute);

module.exports = router;