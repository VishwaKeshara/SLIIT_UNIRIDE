import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { getStoredAdminData, isRouteManager } from "./adminAccess";

function AdminSidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const adminData = getStoredAdminData();
  const routeManager = isRouteManager(adminData?.role);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/adminlogin");
  };

  const items = [
    {
      label: "Dashboard",
      to: "/admin/dashboard",
      enabled: true,
      active: location.pathname === "/admin/dashboard",
    },
    {
      label: "User Management",
      to: "/admin/users",
      enabled: !routeManager,
      active: location.pathname === "/admin/users",
    },
    {
      label: "Complaint Management",
      to: "/admin/complaints",
      enabled: !routeManager,
      active: location.pathname === "/admin/complaints",
    },
    {
      label: "Route Oversight",
      to: routeManager ? "/routes/new" : "/admin/routes",
      enabled: true,
      active:
        location.pathname === "/admin/routes" ||
        location.pathname === "/routes/new" ||
        location.pathname === "/RouteList" ||
        location.pathname === "/RouteForm",
    },
    {
      label: "Trip Monitoring",
      to: "/admin/trips",
      enabled: !routeManager,
      active: location.pathname === "/admin/trips",
    },
    {
      label: "Analytics & Reports",
      to: "/admin/reports",
      enabled: !routeManager,
      active: location.pathname === "/admin/reports",
    },
    {
      label: "System Settings",
      enabled: false,
    },
  ];

  return (
    <aside className="w-full bg-[#0f376b] px-5 py-6 text-white lg:min-h-screen lg:w-[350px] lg:px-6 lg:py-8">
      <div className="mx-auto flex h-full w-full max-w-sm flex-col">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-[22px] bg-gradient-to-br from-[#facc15] to-[#ffd867] text-3xl font-extrabold text-[#0f376b] shadow-[0_14px_28px_rgba(250,204,21,0.28)]">
            U
          </div>

          <div>
            <h2 className="text-[2.2rem] font-extrabold leading-none tracking-tight">
              UniRide
            </h2>
            <p className="mt-2 text-lg text-blue-100">
              {routeManager ? "Route Manager Module" : "Admin Module"}
            </p>
          </div>
        </div>

        <div className="my-7 h-px bg-white/15" />

        <nav className="space-y-4">
          {items.map((item) =>
            item.enabled ? (
              <Link
                key={item.label}
                to={item.to}
                className={`block rounded-[20px] px-5 py-4 text-[1.05rem] font-bold transition ${
                  item.active
                    ? "bg-white/20"
                    : "bg-[#1b477f] hover:bg-[#28528b]"
                }`}
              >
                {item.label}
              </Link>
            ) : (
              <button
                key={item.label}
                type="button"
                disabled
                className="block w-full cursor-not-allowed rounded-[20px] bg-[#1b477f] px-5 py-4 text-left text-[1.05rem] font-bold text-white"
              >
                {item.label}
              </button>
            )
          )}
        </nav>

        <div className="mt-8 rounded-[24px] border border-white/12 bg-[#1b477f] p-6">
          <h3 className="text-2xl font-extrabold">Admin Flow</h3>
          <p className="mt-3 text-base leading-7 text-blue-50">
            Monitor operations, manage people, resolve problems, and improve
            transport decisions from one professional control center.
          </p>

          <button
            type="button"
            onClick={handleLogout}
            className="mt-6 w-full rounded-[18px] bg-[#ffbf00] px-5 py-3.5 text-xl font-extrabold text-[#111827] transition hover:bg-[#ffc933]"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default AdminSidebar;
