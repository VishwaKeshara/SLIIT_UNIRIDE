// backend/routes/routeRoutes.js
const express = require("express");
const router  = express.Router();

const {
  createRoute,
  getRoutes,
  getActiveRoutes,
  getRouteById,
  updateRoute,
  deleteRoute
} = require("../controllers/routeController");

router.post("/",         createRoute);
router.get("/",          getRoutes);
router.get("/active",    getActiveRoutes);  // must be before /:id
router.get("/:id",       getRouteById);
router.put("/:id",       updateRoute);
router.delete("/:id",    deleteRoute);

module.exports = router;
