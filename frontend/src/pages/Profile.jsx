import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import {
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaCreditCard,
  FaEnvelope,
  FaExclamationTriangle,
  FaFilter,
  FaIdBadge,
  FaMapMarkerAlt,
  FaPhoneAlt,
  FaReceipt,
  FaSearch,
  FaShieldAlt,
  FaTimesCircle,
  FaUserCircle,
} from "react-icons/fa";

function getLoggedInUser() {
  try {
    return JSON.parse(
      localStorage.getItem("userData") || localStorage.getItem("user") || "null",
    );
  } catch {
    return null;
  }
}

function formatDate(value, options = {}) {
  if (!value) return "Not available";

  return new Date(value).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

function formatDateTime(value) {
  if (!value) return "Not available";

  return new Date(value).toLocaleString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatLkr(amount) {
  return `LKR ${Number(amount || 0).toLocaleString()}`;
}

function getStatusClass(type, value) {
  const styles = {
    booking: {
      confirmed: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      cancelled: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    },
    payment: {
      paid: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      failed: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
      refunded: "bg-slate-100 text-slate-700 ring-1 ring-slate-200",
    },
    complaint: {
      pending: "bg-amber-50 text-amber-700 ring-1 ring-amber-200",
      "in progress": "bg-sky-50 text-sky-700 ring-1 ring-sky-200",
      resolved: "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",
      rejected: "bg-rose-50 text-rose-700 ring-1 ring-rose-200",
    },
  };

  return (
    styles[type]?.[value] || "bg-slate-100 text-slate-700 ring-1 ring-slate-200"
  );
}

function InfoTile({ icon, label, value }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#10324c] text-sm text-white shadow-sm">
          {icon}
        </span>
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
            {label}
          </p>
          <p className="mt-2 text-sm font-semibold text-slate-800 sm:text-base">
            {value}
          </p>
        </div>
      </div>
    </div>
  );
}

function EmptyState({ title, description }) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-5 py-10 text-center">
      <p className="text-base font-semibold text-slate-700">{title}</p>
      <p className="mt-2 text-sm leading-6 text-slate-500">{description}</p>
    </div>
  );
}

function Profile() {
  const navigate = useNavigate();
  const loggedInUser = getLoggedInUser();
  const currentUserId = loggedInUser?.id;

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState("overview");
  const [bookingSearch, setBookingSearch] = useState("");
  const [bookingStatusFilter, setBookingStatusFilter] = useState("all");
  const [paymentStatusFilter, setPaymentStatusFilter] = useState("all");

  useEffect(() => {
    if (!currentUserId) {
      navigate("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const [userRes, bookingsRes, complaintsRes] = await Promise.all([
          axios.get(`/users/${currentUserId}`),
          axios.get(`/users/${currentUserId}/bookings`),
          axios.get(`/complaints/user/${currentUserId}`),
        ]);

        setUser(userRes.data);
        setBookings(bookingsRes.data);
        setComplaints(complaintsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load your profile.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [currentUserId, navigate]);

  const filteredBookings = useMemo(() => {
    const query = bookingSearch.trim().toLowerCase();

    return bookings.filter((booking) => {
      const matchesSearch =
        !query ||
        [
          booking.route?.routeName,
          booking.route?.startLocation,
          booking.route?.endLocation,
          booking.boardingStop?.stopName,
          booking.paymentReference,
          booking._id,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(query);

      const matchesBookingStatus =
        bookingStatusFilter === "all" || booking.status === bookingStatusFilter;

      const paymentStatus = booking.paymentStatus || "pending";
      const matchesPaymentStatus =
        paymentStatusFilter === "all" || paymentStatus === paymentStatusFilter;

      return matchesSearch && matchesBookingStatus && matchesPaymentStatus;
    });
  }, [bookingSearch, bookingStatusFilter, bookings, paymentStatusFilter]);

  const paymentHistory = useMemo(
    () =>
      [...bookings].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [bookings],
  );

  const complaintHistory = useMemo(
    () =>
      [...complaints].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
      ),
    [complaints],
  );

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="rounded-3xl border border-slate-200 bg-white px-6 py-5 text-sm text-slate-700 shadow-lg">
          Loading your profile dashboard...
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
        <div className="max-w-lg rounded-3xl border border-rose-200 bg-white px-6 py-6 text-center text-sm text-rose-700 shadow-lg">
          {error || "Unable to load your profile."}
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const totalSpent = bookings.reduce(
    (sum, booking) =>
      booking.paymentStatus === "paid" ? sum + Number(booking.totalAmount || 0) : sum,
    0,
  );
  const paidCount = bookings.filter((booking) => booking.paymentStatus === "paid").length;
  const pendingPayments = bookings.filter(
    (booking) => (booking.paymentStatus || "pending") === "pending",
  ).length;
  const resolvedComplaints = complaints.filter(
    (complaint) => complaint.status === "resolved",
  ).length;
  const activeComplaints = complaints.filter(
    (complaint) => complaint.status === "pending" || complaint.status === "in progress",
  ).length;
  const nextRide = [...bookings]
    .filter(
      (booking) =>
        booking.status === "confirmed" &&
        new Date(booking.travelStartDate).getTime() >= new Date().setHours(0, 0, 0, 0),
    )
    .sort(
      (a, b) =>
        new Date(a.travelStartDate).getTime() - new Date(b.travelStartDate).getTime(),
    )[0];

  const stats = [
    {
      label: "Total bookings",
      value: bookings.length,
      detail: "All rides connected to your account",
      tone: "bg-sky-50 text-sky-800",
    },
    {
      label: "Total paid",
      value: formatLkr(totalSpent),
      detail: `${paidCount} completed payments`,
      tone: "bg-emerald-50 text-emerald-800",
    },
    {
      label: "Pending payments",
      value: pendingPayments,
      detail: "Payments still waiting for action",
      tone: "bg-amber-50 text-amber-800",
    },
    {
      label: "Complaints",
      value: complaints.length,
      detail: `${resolvedComplaints} resolved, ${activeComplaints} active`,
      tone: "bg-rose-50 text-rose-800",
    },
  ];

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "bookings", label: "Bookings" },
    { id: "payments", label: "Payments" },
    { id: "complaints", label: "Complaints" },
  ];

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#eef4f8_0%,#f8fafc_24%,#ffffff_100%)] pb-16">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <section className="overflow-hidden rounded-[32px] bg-[linear-gradient(135deg,#0f2f47_0%,#17486c_58%,#206388_100%)] shadow-[0_24px_60px_rgba(15,47,71,0.28)]">
          <div className="grid gap-8 px-6 py-8 text-white sm:px-8 lg:grid-cols-[1.2fr_0.8fr] lg:px-10 lg:py-10">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-cyan-100/80">
                My Profile
              </p>
              <div className="mt-5 flex flex-col gap-5 sm:flex-row sm:items-center">
                <div className="flex h-24 w-24 items-center justify-center rounded-[28px] bg-white/12 text-3xl font-black text-white ring-1 ring-white/15">
                  {initials || <FaUserCircle />}
                </div>
                <div>
                  <h1 className="text-3xl font-black tracking-tight sm:text-4xl">
                    {user.name}
                  </h1>
                  <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-100/85 sm:text-base">
                    A simpler place to check your ride history, payment records,
                    complaint updates, and personal account details.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    <span className="rounded-full bg-white/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-cyan-50 ring-1 ring-white/15">
                      {user.role}
                    </span>
                    <span className="rounded-full bg-emerald-400/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-emerald-100 ring-1 ring-emerald-300/20">
                      {user.isActive ? "Active account" : "Inactive account"}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid gap-4">
              <div className="rounded-[26px] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                <div className="flex items-center gap-3">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/12 text-cyan-50">
                    <FaShieldAlt />
                  </span>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">
                      Account status
                    </p>
                    <p className="mt-1 text-lg font-bold text-white">
                      {user.isActive ? "Verified and ready to use" : "Needs attention"}
                    </p>
                  </div>
                </div>
              </div>

              <div className="rounded-[26px] bg-white/10 p-5 ring-1 ring-white/10 backdrop-blur-sm">
                <p className="text-xs uppercase tracking-[0.2em] text-cyan-100/70">
                  Next ride
                </p>
                {nextRide ? (
                  <div className="mt-3 space-y-2">
                    <p className="text-lg font-bold text-white">
                      {nextRide.route?.routeName || "Scheduled ride"}
                    </p>
                    <p className="text-sm text-slate-100/80">
                      {nextRide.route?.startLocation || "Start"} to{" "}
                      {nextRide.route?.endLocation || "Destination"}
                    </p>
                    <p className="flex items-center gap-2 text-sm text-cyan-50">
                      <FaCalendarAlt />
                      {formatDate(nextRide.travelStartDate)}
                    </p>
                  </div>
                ) : (
                  <p className="mt-3 text-sm leading-6 text-slate-100/80">
                    No upcoming confirmed ride yet.
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-[26px] border border-slate-200 bg-white p-5 shadow-sm"
            >
              <span
                className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] ${stat.tone}`}
              >
                {stat.label}
              </span>
              <p className="mt-4 text-3xl font-black text-slate-900">{stat.value}</p>
              <p className="mt-2 text-sm leading-6 text-slate-500">{stat.detail}</p>
            </div>
          ))}
        </section>

        <section className="mt-6 rounded-[30px] border border-slate-200 bg-white p-4 shadow-sm sm:p-6">
          <div className="flex flex-wrap gap-3">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`rounded-2xl px-5 py-3 text-sm font-semibold transition ${
                  activeTab === tab.id
                    ? "bg-[#10324c] text-white shadow-lg"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {activeTab === "overview" && (
            <div className="mt-6 grid gap-8 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="space-y-8">
                <div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Personal Information
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      Account details
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    <InfoTile
                      icon={<FaEnvelope />}
                      label="Email address"
                      value={user.email || "Not added"}
                    />
                    <InfoTile
                      icon={<FaPhoneAlt />}
                      label="Phone number"
                      value={user.phoneNumber || "Not added yet"}
                    />
                    <InfoTile
                      icon={<FaIdBadge />}
                      label="Role"
                      value={user.role || "User"}
                    />
                    <InfoTile
                      icon={<FaClock />}
                      label="Member since"
                      value={formatDate(user.createdAt, { month: "long" })}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="rounded-[28px] border border-slate-200 bg-slate-50 p-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                    Ride summary
                  </p>
                  <h2 className="mt-2 text-2xl font-black text-slate-900">
                    Quick account overview
                  </h2>

                  <div className="mt-5 grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm text-slate-500">Confirmed rides</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {bookings.filter((booking) => booking.status === "confirmed").length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm text-slate-500">Cancelled rides</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {bookings.filter((booking) => booking.status === "cancelled").length}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm text-slate-500">Resolved complaints</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {resolvedComplaints}
                      </p>
                    </div>
                    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-200">
                      <p className="text-sm text-slate-500">Pending complaints</p>
                      <p className="mt-2 text-2xl font-black text-slate-900">
                        {activeComplaints}
                      </p>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="mb-4">
                    <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Recent Activity
                    </p>
                    <h2 className="mt-2 text-2xl font-black text-slate-900">
                      Latest updates
                    </h2>
                  </div>

                  <div className="space-y-4">
                    {paymentHistory.slice(0, 2).map((booking) => (
                      <div
                        key={`${booking._id}-overview`}
                        className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-base font-bold text-slate-900">
                            {booking.route?.routeName || "Ride payment"}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClass(
                              "payment",
                              booking.paymentStatus || "pending",
                            )}`}
                          >
                            {booking.paymentStatus || "pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(booking.travelStartDate)} to{" "}
                          {formatDate(booking.travelEndDate)}
                        </p>
                        <p className="mt-3 text-sm font-semibold text-slate-800">
                          {formatLkr(booking.totalAmount)}
                        </p>
                      </div>
                    ))}

                    {paymentHistory.length === 0 && (
                      <EmptyState
                        title="No recent activity"
                        description="Your latest booking and payment updates will appear here."
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "bookings" && (
            <div className="mt-6">
              <div className="grid gap-4 rounded-[28px] bg-slate-50 p-4 ring-1 ring-slate-200 lg:grid-cols-[1.2fr_0.8fr_0.8fr]">
                <label className="relative block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <FaSearch /> Search
                  </span>
                  <input
                    type="text"
                    value={bookingSearch}
                    onChange={(event) => setBookingSearch(event.target.value)}
                    placeholder="Route, location, stop or reference"
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1f6f8f] focus:ring-4 focus:ring-sky-100"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <FaFilter /> Booking status
                  </span>
                  <select
                    value={bookingStatusFilter}
                    onChange={(event) => setBookingStatusFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1f6f8f] focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="all">All bookings</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                    <FaFilter /> Payment status
                  </span>
                  <select
                    value={paymentStatusFilter}
                    onChange={(event) => setPaymentStatusFilter(event.target.value)}
                    className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition focus:border-[#1f6f8f] focus:ring-4 focus:ring-sky-100"
                  >
                    <option value="all">All payments</option>
                    <option value="paid">Paid</option>
                    <option value="pending">Pending</option>
                    <option value="failed">Failed</option>
                    <option value="refunded">Refunded</option>
                  </select>
                </label>
              </div>

              <div className="mt-6 space-y-4">
                {filteredBookings.length === 0 ? (
                  <EmptyState
                    title="No matching bookings"
                    description="Try changing your search or filters to see more booking records."
                  />
                ) : (
                  filteredBookings.map((booking) => (
                    <article
                      key={booking._id}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {booking.route?.routeName || "Campus shuttle ride"}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClass(
                                "booking",
                                booking.status || "confirmed",
                              )}`}
                            >
                              {booking.status || "confirmed"}
                            </span>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClass(
                                "payment",
                                booking.paymentStatus || "pending",
                              )}`}
                            >
                              {booking.paymentStatus || "pending"}
                            </span>
                          </div>

                          <div className="mt-4 grid gap-3 text-sm text-slate-600 sm:grid-cols-2">
                            <p className="flex items-center gap-2">
                              <FaMapMarkerAlt className="text-[#1f6f8f]" />
                              <span>
                                {booking.route?.startLocation || "Start"} to{" "}
                                {booking.route?.endLocation || "Destination"}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <FaCalendarAlt className="text-[#1f6f8f]" />
                              <span>
                                {formatDate(booking.travelStartDate)} to{" "}
                                {formatDate(booking.travelEndDate)}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <FaReceipt className="text-[#1f6f8f]" />
                              <span>
                                {booking.paymentReference ||
                                  `BK-${booking._id.slice(-8).toUpperCase()}`}
                              </span>
                            </p>
                            <p className="flex items-center gap-2">
                              <FaCreditCard className="text-[#1f6f8f]" />
                              <span>
                                {booking.paymentMethod || "cash"} |{" "}
                                {formatLkr(booking.totalAmount)}
                              </span>
                            </p>
                          </div>
                        </div>

                        <div className="min-w-[240px] rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Booking details
                          </p>
                          <div className="mt-3 space-y-2 text-sm text-slate-600">
                            <p>Booked on: {formatDateTime(booking.createdAt)}</p>
                            <p>
                              Boarding stop: {booking.boardingStop?.stopName || "Main route stop"}
                            </p>
                            <p className="capitalize">
                              Verification: {booking.verificationStatus || "unverified"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          )}

          {activeTab === "payments" && (
            <div className="mt-6 space-y-4">
              {paymentHistory.length === 0 ? (
                <EmptyState
                  title="No payment history yet"
                  description="Payment records will appear here once you complete or submit bookings."
                />
              ) : (
                paymentHistory.map((booking) => (
                  <div
                    key={`${booking._id}-payment`}
                    className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-lg font-bold text-slate-900">
                            {booking.route?.routeName || "UniRide booking payment"}
                          </p>
                          <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClass(
                              "payment",
                              booking.paymentStatus || "pending",
                            )}`}
                          >
                            {booking.paymentStatus || "pending"}
                          </span>
                        </div>
                        <p className="mt-2 text-sm text-slate-500">
                          {formatDate(booking.travelStartDate)} to{" "}
                          {formatDate(booking.travelEndDate)}
                        </p>
                        <p className="mt-2 text-sm text-slate-500">
                          Method: {booking.paymentMethod || "cash"}
                        </p>
                      </div>

                      <div className="rounded-2xl bg-slate-50 p-4 text-left ring-1 ring-slate-200 sm:min-w-[240px] sm:text-right">
                        <p className="text-2xl font-black text-slate-900">
                          {formatLkr(booking.totalAmount)}
                        </p>
                        <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">
                          {booking.paymentReference ||
                            `BK-${booking._id.slice(-8).toUpperCase()}`}
                        </p>
                        <p className="mt-2 text-sm capitalize text-slate-600">
                          Verification: {booking.verificationStatus || "unverified"}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "complaints" && (
            <div className="mt-6 space-y-4">
              {complaintHistory.length === 0 ? (
                <EmptyState
                  title="No complaints submitted"
                  description="If you raise a complaint, its status and admin reply will appear here."
                />
              ) : (
                complaintHistory.map((complaint) => {
                  const status = complaint.status || "pending";
                  const hasResponse = Boolean(complaint.adminResponse?.trim());

                  return (
                    <article
                      key={complaint._id}
                      className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-sm"
                    >
                      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-slate-900">
                              {complaint.title}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] ${getStatusClass(
                                "complaint",
                                status,
                              )}`}
                            >
                              {status}
                            </span>
                          </div>

                          <p className="mt-2 text-sm font-semibold capitalize text-[#1f6f8f]">
                            {complaint.type} complaint
                          </p>
                          <p className="mt-3 text-sm leading-7 text-slate-600">
                            {complaint.message}
                          </p>
                        </div>

                        <div className="min-w-[220px] rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                          <p className="flex items-center gap-2 text-sm text-slate-600">
                            {status === "resolved" ? (
                              <FaCheckCircle className="text-emerald-600" />
                            ) : status === "rejected" ? (
                              <FaTimesCircle className="text-rose-600" />
                            ) : (
                              <FaExclamationTriangle className="text-amber-600" />
                            )}
                            <span>{formatDateTime(complaint.createdAt)}</span>
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 ring-1 ring-slate-200">
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                          Admin response
                        </p>
                        <p className="mt-2 text-sm leading-7 text-slate-600">
                          {hasResponse
                            ? complaint.adminResponse
                            : "No admin response has been added yet. The case is still under review."}
                        </p>
                      </div>
                    </article>
                  );
                })
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

export default Profile;
