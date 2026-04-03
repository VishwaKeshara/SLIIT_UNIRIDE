import React from "react";
import AdminSidebar from "./AdminSidebar";
import RouteList from "../features/Shuttle & Route Management/RouteList";

function ManageRoutes() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="min-w-0 flex-1">
        <RouteList
          embedded
          allowRouteEditing={false}
          allowStopManagement={false}
          allowStatusToggle
          title="Route Oversight"
          description="Monitor shuttle routes with the same admin-style search, filters, stats, and action workflows used in the other management pages."
        />
      </main>
    </div>
  );
}

export default ManageRoutes;
