const express = require("express");
const router = express.Router();
const { allowAdminRoles, requireAdminAuth } = require("../middleware/adminAuth");

const {
  adminLogin,
  getAdminSummary,
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require("../controllers/adminController");

router.post("/login", adminLogin);
router.get(
  "/summary",
  requireAdminAuth,
  allowAdminRoles("admin", "routemanager"),
  getAdminSummary
);

router.get("/users", requireAdminAuth, allowAdminRoles("admin"), getAllUsers);
router.post("/users", requireAdminAuth, allowAdminRoles("admin"), createUser);
router.put("/users/:id", requireAdminAuth, allowAdminRoles("admin"), updateUser);
router.delete(
  "/users/:id",
  requireAdminAuth,
  allowAdminRoles("admin"),
  deleteUser
);

module.exports = router;
