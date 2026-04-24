import React from "react";
import { Navigate, useLocation } from "react-router-dom";

function readSession(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function ProtectedRoleRoute({ allowedRoles = [], children, redirectTo = "/login" }) {
  const location = useLocation();
  const adminData = readSession("adminData");
  const userData = readSession("userData");
  const currentRole = adminData?.role || userData?.role || null;

  if (!currentRole) {
    return <Navigate to={redirectTo} replace state={{ from: location.pathname }} />;
  }

  if (!allowedRoles.includes(currentRole)) {
    return <Navigate to={currentRole === "admin" ? "/admin/dashboard" : "/home"} replace />;
  }

  return children;
}

export default ProtectedRoleRoute;
