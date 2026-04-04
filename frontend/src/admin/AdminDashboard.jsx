import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosinstance";
import { getStoredAdminData, isRouteManager } from "./adminAccess";
import AdminSidebar from "./AdminSidebar";

function AdminDashboard() {
  const adminData = getStoredAdminData();
  const routeManager = isRouteManager(adminData?.role);

  const [recentComplaints, setRecentComplaints] = useState([]);
  const [tripStatuses, setTripStatuses] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    totalBookings: 0,
    peakHour: "",
  });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const requests = [
        axios.get("/admin/summary"),
        axios.get("/complaints"),
        axios.get("/trips"),
      ];

      if (!routeManager) {
        requests.push(axios.get("/bookings"));
      }

      const [summaryRes, complaintsRes, tripsRes, bookingsRes] =
        await Promise.all(requests);

      setSummary(summaryRes.data);
      setRecentComplaints(complaintsRes.data.slice(0, 4));
      setTripStatuses(tripsRes.data.slice(0, 4));
      setBookings(bookingsRes?.data || []);
    } catch (error) {
      console.error("Failed to fetch admin dashboard data", error);
    }
  };

  const paymentSummary = useMemo(() => {
    const paidBookings = bookings.filter(
      (booking) => booking.paymentStatus === "paid"
    );
    const pendingPayments = bookings.filter(
      (booking) => booking.paymentStatus === "pending"
    ).length;
    const failedPayments = bookings.filter(
      (booking) => booking.paymentStatus === "failed"
    ).length;
    const totalRevenue = paidBookings.reduce(
      (sum, booking) => sum + (booking.totalAmount || 0),
      0
    );

    return {
      totalRevenue,
      pendingPayments,
      failedPayments,
      paidCount: paidBookings.length,
    };
  }, [bookings]);

  const tripSummary = useMemo(() => {
    return {
      ongoing: tripStatuses.filter((trip) => trip.status === "Ongoing").length,
      delayed: tripStatuses.filter((trip) => trip.status === "Delayed").length,
    };
  }, [tripStatuses]);

  const formatComplaintType = (type) => {
    if (type === "booking") return "Booking";
    if (type === "driver") return "Driver";
    if (type === "schedule") return "Schedule";
    if (type === "payment") return "Payment";
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

  const getTripBadgeClass = (status) => {
    if (status === "Completed") return "bg-[#dff7ec] text-[#049b63]";
    if (status === "Delayed") return "bg-[#ffe3e1] text-[#ef534f]";
    if (status === "Ongoing") return "bg-[#e8eefb] text-[#0a3772]";
    return "bg-[#fff3dc] text-[#d08a00]";
  };

  const headerActions = [
    {
      label: "Complaints",
      to: "/admin/complaints",
      enabled: !routeManager,
      className: "bg-[#e8eefb] text-[#0a3772]",
    },
    {
      label: "Reports",
      to: routeManager ? "/admin/routes" : "/admin/reports",
      enabled: true,
      className: "bg-[#ffbf00] text-[#111827]",
    },
    {
      label: routeManager ? "Routes" : "Users",
      to: routeManager ? "/admin/routes" : "/admin/users",
      enabled: true,
      className: "bg-[#143d7a] text-white",
    },
  ];

  const statCards = routeManager
    ? [
        { label: "Trips Today", value: summary.totalBookings },
        { label: "Open Issues", value: summary.totalComplaints },
        { label: "Ongoing Trips", value: tripSummary.ongoing },
        { label: "Delayed Trips", value: tripSummary.delayed },
      ]
    : [
        { label: "Total Users", value: summary.totalUsers },
        { label: "Open Complaints", value: summary.totalComplaints },
        { label: "Trips Today", value: summary.totalBookings },
        {
          label: "Revenue",
          value: `Rs. ${paymentSummary.totalRevenue.toFixed(0)}`,
        },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-end xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              Admin Dashboard
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[#5c79a8] sm:text-lg">
              A clean overview of operations, complaints, trips, and payments.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {headerActions.map((action) =>
              action.enabled ? (
                <Link
                  key={action.label}
                  to={action.to}
                  className={`rounded-3xl px-6 py-3.5 text-base font-extrabold shadow-sm transition hover:opacity-90 ${action.className}`}
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
              className="rounded-[28px] border border-blue-100 bg-white p-6 shadow-[0_18px_45px_rgba(80,122,191,0.14)]"
            >
              <p className="text-[1rem] font-bold text-[#5c79a8]">
                {card.label}
              </p>
              <h2 className="mt-4 text-4xl font-extrabold text-[#0b2f67]">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-8 2xl:grid-cols-[1.35fr_0.95fr]">
          <div className="space-y-8">
            {!routeManager && (
              <section className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.14)]">
                <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div>
                    <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-3xl">
                      Payments Snapshot
                    </h3>
                    <p className="mt-1 text-sm text-[#617ba4]">
                      A quick finance view without leaving the dashboard.
                    </p>
                  </div>

                  <Link
                    to="/admin/reports"
                    className="rounded-[18px] bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-[#0a3772]"
                  >
                    Open Reports
                  </Link>
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                  <div className="rounded-[22px] border border-blue-100 bg-[#f7faff] p-5">
                    <p className="text-sm font-bold text-[#5c79a8]">Revenue</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#0b2f67]">
                      Rs. {paymentSummary.totalRevenue.toFixed(2)}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-blue-100 bg-[#f7faff] p-5">
                    <p className="text-sm font-bold text-[#5c79a8]">Pending</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#d08a00]">
                      {paymentSummary.pendingPayments}
                    </p>
                  </div>
                  <div className="rounded-[22px] border border-blue-100 bg-[#f7faff] p-5">
                    <p className="text-sm font-bold text-[#5c79a8]">Failed</p>
                    <p className="mt-3 text-3xl font-extrabold text-[#ef534f]">
                      {paymentSummary.failedPayments}
                    </p>
                  </div>
                </div>
              </section>
            )}

            <section className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.14)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-3xl">
                    Recent Complaints
                  </h3>
                  <p className="mt-1 text-sm text-[#617ba4]">
                    Latest issues that may need attention.
                  </p>
                </div>

                {!routeManager && (
                  <Link
                    to="/admin/complaints"
                    className="rounded-[18px] bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-[#0a3772]"
                  >
                    Manage
                  </Link>
                )}
              </div>

              <div className="space-y-4">
                {recentComplaints.length === 0 ? (
                  <div className="rounded-[22px] border border-blue-100 bg-[#f7faff] px-5 py-8 text-center text-base font-bold text-[#5c79a8]">
                    No complaints found
                  </div>
                ) : (
                  recentComplaints.map((complaint) => (
                    <div
                      key={complaint._id}
                      className="flex flex-col gap-4 rounded-[22px] border border-blue-100 bg-[#f7faff] px-5 py-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div>
                        <h4 className="text-lg font-extrabold text-[#0b1f45]">
                          {complaint.title}
                        </h4>
                        <p className="mt-1 text-sm text-[#617ba4]">
                          {formatComplaintType(complaint.type)} Issue
                        </p>
                      </div>
                      <span
                        className={`inline-flex rounded-full px-5 py-2 text-sm font-extrabold ${getComplaintBadgeClass(
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
            <section className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.14)]">
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-3xl">
                  Booking Insight
                </h3>
                <span className="rounded-full bg-[#dff7ec] px-4 py-2 text-sm font-bold text-[#049b63]">
                  Live
                </span>
              </div>

              <div className="rounded-[22px] border border-blue-100 bg-[#f7faff] px-6 py-8 text-center">
                <p className="text-sm font-bold uppercase tracking-[0.2em] text-[#5c79a8]">
                  Peak Booking Window
                </p>
                <p className="mt-4 text-4xl font-extrabold text-[#0b2f67]">
                  {summary.peakHour || "N/A"}
                </p>
              </div>
            </section>

            <section className="rounded-[32px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.14)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-3xl">
                    Trip Status
                  </h3>
                  <p className="mt-1 text-sm text-[#617ba4]">
                    Current trip activity at a glance.
                  </p>
                </div>

                <Link
                  to={routeManager ? "/routes/new" : "/admin/trips"}
                  className="rounded-[18px] bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-[#0a3772]"
                >
                  Open Trips
                </Link>
              </div>

              <div className="space-y-4">
                {tripStatuses.length === 0 ? (
                  <div className="rounded-[22px] border border-blue-100 bg-[#f7faff] px-5 py-8 text-center text-base font-bold text-[#5c79a8]">
                    No trips found
                  </div>
                ) : (
                  tripStatuses.map((trip) => (
                    <div
                      key={trip._id}
                      className="rounded-[22px] border border-blue-100 bg-[#f7faff] px-5 py-5"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                        <div>
                          <h4 className="text-lg font-extrabold text-[#0b1f45]">
                            {trip.route}
                          </h4>
                          <p className="mt-1 text-sm text-[#617ba4]">
                            Driver: {trip.driver?.name || "Unassigned"}
                          </p>
                        </div>
                        <span
                          className={`inline-flex rounded-full px-5 py-2 text-sm font-extrabold ${getTripBadgeClass(
                            trip.status
                          )}`}
                        >
                          {trip.status}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </div>
        </div>

        <div className="mt-8 rounded-[24px] border border-blue-100 bg-white px-6 py-4 text-sm text-slate-500 shadow-[0_18px_45px_rgba(80,122,191,0.1)]">
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
