export const ADMIN_PORTAL_ROLES = ["admin", "routemanager"];

export function getStoredAdminData() {
  try {
    const rawAdminData = localStorage.getItem("adminData");
    return rawAdminData ? JSON.parse(rawAdminData) : null;
  } catch (error) {
    console.error("Failed to parse stored admin data", error);
    return null;
  }
}

export function getStoredAdminRole() {
  return getStoredAdminData()?.role || "";
}

export function hasAdminPortalAccess(role) {
  return ADMIN_PORTAL_ROLES.includes(role);
}

export function isRouteManager(role) {
  return role === "routemanager";
}

export function canAccessAdminSection(role, allowedRoles = ADMIN_PORTAL_ROLES) {
  return allowedRoles.includes(role);
}
