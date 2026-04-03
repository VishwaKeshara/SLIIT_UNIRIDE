import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserCog,
  FaClipboardList,
  FaSignOutAlt,
  FaRoute,
} from "react-icons/fa";
import RouteList from "../features/Shuttle & Route Management/RouteList";

function ManageRoutes() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/adminlogin");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8fbff] via-[#eef6ff] to-[#f5f9ff]">
      <aside className="w-72 bg-[#1e293b] text-white flex flex-col p-8 shadow-xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold">UniRide</h2>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-4 text-base">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 hover:bg-gray-700 px-5 py-3 rounded-xl transition text-lg"
          >
            <FaTachometerAlt /> Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 hover:bg-gray-700 px-5 py-3 rounded-xl transition text-lg"
          >
            <FaUserCog /> Manage Users
          </Link>

          <Link
            to="/admin/complaints"
            className="flex items-center gap-3 hover:bg-gray-700 px-5 py-3 rounded-xl transition text-lg"
          >
            <FaClipboardList /> Complaints
          </Link>

          <Link
            to="/admin/routes"
            className="flex items-center gap-3 bg-blue-600 px-5 py-3 rounded-xl font-semibold text-lg"
          >
            <FaRoute /> Manage Routes
          </Link>
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-semibold text-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      <main className="flex-1">
        <RouteList
          embedded
          allowRouteEditing={false}
          allowStopManagement={false}
          allowStatusToggle
          title="Manage Routes"
          description="View, search, edit, and maintain all shuttle routes from the admin panel."
        />
      </main>
    </div>
  );
}

export default ManageRoutes;
