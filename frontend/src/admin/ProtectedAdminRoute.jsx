import { Navigate } from "react-router-dom";
import {
  ADMIN_PORTAL_ROLES,
  canAccessAdminSection,
  getStoredAdminData,
  hasAdminPortalAccess,
} from "./adminAccess";

function ProtectedAdminRoute({
  children,
  allowedRoles = ADMIN_PORTAL_ROLES,
  redirectTo = "/admin/dashboard",
}) {
  const token = localStorage.getItem("adminToken");
  const adminData = getStoredAdminData();

  if (!token || !adminData || !hasAdminPortalAccess(adminData.role)) {
    return <Navigate to="/adminlogin" replace />;
  }

  if (!canAccessAdminSection(adminData.role, allowedRoles)) {
    return <Navigate to={redirectTo} replace />;
  }

  return children;
}

export default ProtectedAdminRoute;
