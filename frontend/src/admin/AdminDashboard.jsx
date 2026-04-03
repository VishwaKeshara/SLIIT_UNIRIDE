import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosinstance";
import { getStoredAdminData, isRouteManager } from "./adminAccess";
import AdminSidebar from "./AdminSidebar";

function AdminDashboard() {
  const adminData = getStoredAdminData();
  const routeManager = isRouteManager(adminData?.role);

  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    totalBookings: 0,
    peakHour: "",
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/admin/summary");
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const headerActions = [
    {
      label: "Open Complaints",
      to: "/admin/complaints",
      enabled: !routeManager,
      className: "bg-[#e8eefb] text-[#0a3772]",
    },
    {
      label: routeManager ? "Route Reports" : "View Reports",
      to: routeManager ? "/admin/routes" : "/admin/dashboard",
      enabled: true,
      className: "bg-[#ffbf00] text-[#111827]",
    },
    {
      label: "Manage Users",
      to: "/admin/users",
      enabled: !routeManager,
      className: "bg-[#143d7a] text-white",
    },
  ];

  const statCards = [
    {
      label: "Total Users",
      value: summary.totalUsers,
    },
    {
      label: "Open Complaints",
      value: summary.totalComplaints,
    },
    {
      label: "Active Routes",
      value: routeManager ? summary.totalBookings : 2,
    },
    {
      label: "Trips Today",
      value: summary.totalBookings,
    },
  ];

  const moduleSteps = [
    {
      title: "1. Dashboard loads first",
      description:
        "Admin immediately sees users, complaints, routes, and trip health.",
    },
    {
      title: "2. Problem areas are identified",
      description:
        "Admin checks overdue complaints, inactive routes, or delayed trips.",
    },
    {
      title: "3. Action is taken on related page",
      description:
        "Admin can add users, deactivate access, resolve complaints, or update routes.",
    },
    {
      title: "4. System records updates",
      description:
        "Counts, statuses, lists, and dashboard values refresh after each action.",
    },
  ];

  const peakHours = [
    { count: 90, time: "6 AM" },
    { count: 160, time: "7 AM" },
    { count: 190, time: "8 AM" },
    { count: 145, time: "9 AM" },
    { count: 66, time: "10 AM" },
  ];

  const recentComplaints = [
    {
      title: "Bus arrived late for Route R-07",
      meta: "Delay · High Priority",
      status: "Open",
    },
    {
      title: "Morning shuttle overcrowded",
      meta: "Capacity · Medium Priority",
      status: "Open",
    },
    {
      title: "Driver missed pickup point",
      meta: "Route Issue · High Priority",
      status: "Open",
    },
  ];

  const tripStatuses = [
    {
      trip: "TRP-2204 · R-04 Malabe",
      driver: "Driver: Nuwan Silva",
      status: "Pending",
      badgeClass: "bg-[#fff3dc] text-[#d08a00]",
    },
    {
      trip: "TRP-2207 · R-07 Kadawatha",
      driver: "Driver: Ramesh Fernando",
      status: "Delayed",
      badgeClass: "bg-[#ffe3e1] text-[#ef534f]",
    },
    {
      trip: "TRP-2212 · R-01 Kottawa",
      driver: "Driver: Kasun Perera",
      status: "Completed",
      badgeClass: "bg-[#dff7ec] text-[#049b63]",
    },
    {
      trip: "TRP-2218 · R-10 Maharagama",
      driver: "Driver: Tharindu Jay",
      status: "Pending",
      badgeClass: "bg-[#fff3dc] text-[#d08a00]",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              Admin Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            {headerActions.map((action) =>
              action.enabled ? (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`rounded-3xl px-7 py-4 text-lg font-extrabold shadow-sm transition hover:opacity-90 ${action.className}`}
                >
                  {action.label}
                </Link>
              ) : null
            )}
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]"
            >
              <p className="text-[1.05rem] font-bold text-[#5c79a8]">
                {card.label}
              </p>
              <h2 className="mt-5 text-5xl font-extrabold text-[#0b2f67]">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[1.45fr_0.95fr]">
          <div className="space-y-8">
            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                  How Admin Module Works
                </h3>
                <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
                  Professional Flow
                </span>
              </div>

              <div className="space-y-4">
                {moduleSteps.map((step) => (
                  <div
                    key={step.title}
                    className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-5"
                  >
                    <h4 className="text-xl font-extrabold text-[#0b1f45]">
                      {step.title}
                    </h4>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                  Recent Complaints
                </h3>
                <Link
                  to="/admin/complaints"
                  className="rounded-[20px] bg-[#e8eefb] px-8 py-4 text-xl font-extrabold text-[#0a3772]"
                >
                  Manage
                </Link>
              </div>

              <div className="space-y-4">
                {recentComplaints.map((complaint) => (
                  <div
                    key={complaint.title}
                    className="flex flex-col gap-4 rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h4 className="text-xl font-extrabold text-[#0b1f45]">
                        {complaint.title}
                      </h4>
                      <p className="mt-1 text-base text-[#617ba4]">
                        {complaint.meta}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-[#ffe1df] px-6 py-2 text-xl font-extrabold text-[#ef534f]">
                      {complaint.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <div className="space-y-8">
            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                  Booking Peak Hour
                </h3>
                <span className="rounded-full bg-[#dff7ec] px-5 py-2 text-lg font-bold text-[#049b63]">
                  Live Insight
                </span>
              </div>

              <div className="grid grid-cols-2 gap-y-8 text-center sm:grid-cols-5">
                {peakHours.map((slot) => (
                  <div key={slot.time}>
                    <p className="text-4xl font-extrabold text-[#0b2f67]">
                      {slot.count}
                    </p>
                    <p className="mt-3 text-xl text-[#617ba4]">{slot.time}</p>
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                  Trip Status Overview
                </h3>
                <Link
                  to={routeManager ? "/routes/new" : "/admin/routes"}
                  className="rounded-[20px] bg-[#e8eefb] px-8 py-4 text-xl font-extrabold text-[#0a3772]"
                >
                  Open Trips
                </Link>
              </div>

              <div className="space-y-4">
                {tripStatuses.map((trip) => (
                  <div
                    key={trip.trip}
                    className="flex flex-col gap-4 rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-5 md:flex-row md:items-center md:justify-between"
                  >
                    <div>
                      <h4 className="text-xl font-extrabold text-[#0b1f45]">
                        {trip.trip}
                      </h4>
                      <p className="mt-1 text-base text-[#617ba4]">
                        {trip.driver}
                      </p>
                    </div>
                    <span
                      className={`inline-flex rounded-full px-5 py-2 text-xl font-extrabold ${trip.badgeClass}`}
                    >
                      {trip.status}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 rounded-[28px] border border-blue-100 bg-white px-6 py-4 text-base text-slate-500 shadow-[0_18px_45px_rgba(80,122,191,0.12)]">
          Logged in as{" "}
          <span className="font-extrabold capitalize text-[#0a3772]">
            {adminData?.role || "admin"}
          </span>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;
