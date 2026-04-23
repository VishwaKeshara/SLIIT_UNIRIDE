const jwt = require("jsonwebtoken");
const User = require("../models/User");

const ADMIN_PORTAL_ROLES = ["admin", "routemanager"];

const extractToken = (headerValue = "") => {
  if (!headerValue.startsWith("Bearer ")) {
    return "";
  }

  return headerValue.slice(7).trim();
};

const requireAdminAuth = async (req, res, next) => {
  try {
    const token = extractToken(req.headers.authorization);

    if (!token) {
      return res.status(401).json({ message: "Admin authorization required" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const adminUser = await User.findById(decoded.id).select(
      "_id name email role isActive"
    );

    if (!adminUser || !adminUser.isActive) {
      return res.status(401).json({ message: "Admin session is invalid" });
    }

    if (!ADMIN_PORTAL_ROLES.includes(adminUser.role)) {
      return res.status(403).json({ message: "Admin access denied" });
    }

    req.admin = {
      id: adminUser._id,
      name: adminUser.name,
      email: adminUser.email,
      role: adminUser.role,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid or expired admin token" });
  }
};

const allowAdminRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.admin) {
    return res.status(401).json({ message: "Admin authorization required" });
  }

  if (!allowedRoles.includes(req.admin.role)) {
    return res.status(403).json({ message: "You do not have access to this action" });
  }

  next();
};

module.exports = {
  ADMIN_PORTAL_ROLES,
  requireAdminAuth,
  allowAdminRoles,
};
