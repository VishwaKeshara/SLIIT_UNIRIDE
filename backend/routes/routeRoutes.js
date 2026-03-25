const express = require("express");
const router = express.Router();

// GET all routes
router.get("/", (req, res) => {
  res.json({ message: "Routes endpoint working" });
});

module.exports = router;
