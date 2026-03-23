const express = require("express");
const router = express.Router();
const { adminLogin, getAdminSummary } = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get("/summary", getAdminSummary);

module.exports = router;