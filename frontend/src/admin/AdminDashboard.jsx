import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosinstance";
import { getStoredAdminData, isRouteManager } from "./adminAccess";
import AdminSidebar from "./AdminSidebar";

function AdminDashboard() {
  const adminData = getStoredAdminData();
  const routeManager = isRouteManager(adminData?.role);

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [tripStatuses, setTripStatuses] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    totalBookings: 0,
    peakHour: "",
  });

  useEffect(() => {
    fetchSummary();
    fetchRecentComplaints();
    fetchTripStatuses();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/admin/summary");
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const fetchRecentComplaints = async () => {
    try {
      const res = await axios.get("/complaints");
      setRecentComplaints(res.data.slice(0, 3));
    } catch (error) {
      console.error("Failed to fetch recent complaints", error);
    }
  };

  const fetchTripStatuses = async () => {
    try {
      const res = await axios.get("/trips");
      setTripStatuses(res.data.slice(0, 4));
    } catch (error) {
      console.error("Failed to fetch trip statuses", error);
    }
  };

  const formatComplaintType = (type) => {
    if (type === "booking") return "Booking Issue";
    if (type === "driver") return "Driver Issue";
    if (type === "schedule") return "Schedule Issue";
    if (type === "payment") return "Payment Issue";
    return "Other";
  };

  const formatComplaintStatus = (status) => {
    if (status === "in progress") return "In Progress";
    if (status === "resolved") return "Resolved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const getComplaintBadgeClass = (status) => {
    if (status === "resolved") return "bg-[#dff7ec] text-[#049b63]";
    if (status === "in progress") return "bg-[#fff3dc] text-[#d08a00]";
    if (status === "rejected") return "bg-slate-200 text-slate-600";
    return "bg-[#ffe1df] text-[#ef534f]";
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

  const formatTripStatus = (status) => {
    if (status === "Scheduled") return "Scheduled";
    if (status === "Ongoing") return "Ongoing";
    if (status === "Completed") return "Completed";
    if (status === "Delayed") return "Delayed";
    return status || "Unknown";
  };

  const getTripBadgeClass = (status) => {
    if (status === "Completed") return "bg-[#dff7ec] text-[#049b63]";
    if (status === "Delayed") return "bg-[#ffe3e1] text-[#ef534f]";
    if (status === "Ongoing") return "bg-[#e8eefb] text-[#0a3772]";
    return "bg-[#fff3dc] text-[#d08a00]";
  };

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
                {recentComplaints.length === 0 ? (
                  <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-8 text-center text-base font-bold text-[#5c79a8]">
                    No complaints found
                  </div>
                ) : (
                  recentComplaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      className="flex flex-col gap-4 rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <h4 className="text-xl font-extrabold text-[#0b1f45]">
                          {complaint.title}
                        </h4>
                        <p className="mt-1 text-base text-[#617ba4]">
                          {formatComplaintType(complaint.type)}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-6 py-2 text-xl font-extrabold ${getComplaintBadgeClass(
                          complaint.status
                        )}`}
                      >
                        {formatComplaintStatus(complaint.status)}
                      </span>
                    </div>
                  ))
                )}
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

              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-10 text-center">
                <p className="text-base font-bold uppercase tracking-[0.2em] text-[#5c79a8]">
                  Peak Booking Window
                </p>
                <p className="mt-5 text-4xl font-extrabold text-[#0b2f67] sm:text-5xl">
                  {summary.peakHour || "N/A"}
                </p>
              </div>
            </section>

            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                  Trip Status Overview
                </h3>
                <Link
                  to={routeManager ? "/routes/new" : "/admin/trips"}
                  className="rounded-[20px] bg-[#e8eefb] px-8 py-4 text-xl font-extrabold text-[#0a3772]"
                >
                  Open Trips
                </Link>
              </div>

              <div className="space-y-4">
                {tripStatuses.length === 0 ? (
                  <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-8 text-center text-base font-bold text-[#5c79a8]">
                    No trips found
                  </div>
                ) : (
                  tripStatuses.map((trip) => (
                    <div
                      key={trip._id}
                      className="flex flex-col gap-4 rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <h4 className="text-xl font-extrabold text-[#0b1f45]">
                          {trip.route}
                        </h4>
                        <p className="mt-1 text-base text-[#617ba4]">
                          Driver: {trip.driver?.name || "Unassigned"}
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-5 py-2 text-xl font-extrabold ${getTripBadgeClass(
                          trip.status
                        )}`}
                      >
                        {formatTripStatus(trip.status)}
                      </span>
                    </div>
                  ))
                )}
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
