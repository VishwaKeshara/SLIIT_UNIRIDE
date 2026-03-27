import { Navigate } from "react-router-dom";

function ProtectedAdminRoute({ children }) {
  const token = localStorage.getItem("adminToken");
  const adminData = JSON.parse(localStorage.getItem("adminData"));

  if (!token || !adminData || adminData.role !== "admin") {
    return <Navigate to="/adminlogin" replace />;
  }

  return children;
}

export default ProtectedAdminRoute;