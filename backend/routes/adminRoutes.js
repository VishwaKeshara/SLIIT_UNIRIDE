const express = require("express");
const router = express.Router();

const {
  adminLogin,
  getAdminSummary,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get("/summary", getAdminSummary);

router.get("/users", getAllUsers);
router.post("/users", createUser);
router.put("/users/:id", updateUser);
router.delete("/users/:id", deleteUser);

module.exports = router;