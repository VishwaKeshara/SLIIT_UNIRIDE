import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import {
  FaBell, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaReply, FaArrowLeft, FaPlay, FaReceipt, FaRoute,
} from "react-icons/fa";

function normalizeRouteLabel(value) {
  return String(value || "").trim().toLowerCase();
}

function getRouteAliases(routeValue) {
  if (!routeValue) return [];

  if (typeof routeValue === "string") {
    return [normalizeRouteLabel(routeValue)].filter(Boolean);
  }

  const aliases = [
    normalizeRouteLabel(routeValue.routeName),
    normalizeRouteLabel(
      `${routeValue.startLocation || ""} - ${routeValue.endLocation || ""}`
    ),
  ];

  return [...new Set(aliases.filter(Boolean))];
}

export default function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const sessionUser = useMemo(() => {
    try {
      const u = JSON.parse(localStorage.getItem("userData") || localStorage.getItem("user") || "null");
      if (u) return u;
      const a = JSON.parse(localStorage.getItem("adminData") || "null");
      if (a) return a;
      return null;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    if (!sessionUser) {
      navigate("/login", { state: { from: location.pathname } });
      return;
    }

    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripRes, bookingRes, complaintRes, notificationRes] = await Promise.all([
          axios.get("/trips"),
          sessionUser && sessionUser.role !== "admin" && sessionUser.role !== "routemanager"
            ? axios.get(`/users/${sessionUser.id}/bookings`)
            : Promise.resolve({ data: [] }),
          axios.get("/complaints"),
          sessionUser ? axios.get(`/notifications/user/${sessionUser.id}`) : Promise.resolve({ data: [] }),
        ]);
        setTrips(tripRes.data);
        setBookings(bookingRes.data);
        setComplaints(complaintRes.data);
        setNotifications(notificationRes.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname, navigate, sessionUser]);

  if (!sessionUser) {
    return null;
  }

  // Mark notification as read
  const markAsRead = async (notificationId) => {
    try {
      await axios.patch(`/notifications/${notificationId}/read`);
      // Update local state
      setNotifications(prev => prev.map(n => 
        n._id === notificationId ? { ...n, isRead: true } : n
      ));
    } catch (err) {
      console.error("Failed to mark notification as read", err);
    }
  };

  // Mark all unread notifications as read when component mounts
  useEffect(() => {
    if (notifications.length > 0) {
      const unreadIds = notifications.filter((n) => !n.isRead).map((n) => n._id);
      unreadIds.forEach((id) => markAsRead(id));
    }
  }, [notifications]);

  // Build notification items
  const allNotifications = [];
  const userRouteKeys = new Set(
    bookings.flatMap((booking) => getRouteAliases(booking.route)).filter(Boolean),
  );
  const userTripNotifications = trips.filter((trip) => {
    if (!sessionUser || sessionUser.role === "admin" || sessionUser.role === "routemanager") return false;
    return getRouteAliases(trip.route).some((alias) => userRouteKeys.has(alias));
  });

  // Backend notifications (payment, etc.)
  notifications.forEach((n) => {
    let icon, badge, badgeColor;
    switch (n.type) {
      case "payment_verified":
        icon = <FaCheckCircle className="text-green-400" />;
        badge = "Payment Verified";
        badgeColor = "bg-green-500/15 text-green-400 border-green-500/30";
        break;
      case "payment_refunded":
        icon = <FaCheckCircle className="text-blue-400" />;
        badge = "Payment Refunded";
        badgeColor = "bg-blue-500/15 text-blue-400 border-blue-500/30";
        break;
      case "payment_failed":
        icon = <FaExclamationTriangle className="text-red-400" />;
        badge = "Payment Failed";
        badgeColor = "bg-red-500/15 text-red-400 border-red-500/30";
        break;
      case "trip_delayed":
        icon = <FaExclamationTriangle className="text-red-400" />;
        badge = n.metadata?.audience === "admin" ? "Admin Alert" : "Delayed";
        badgeColor = "bg-red-500/15 text-red-400 border-red-500/30";
        break;
      default:
        icon = <FaBell className="text-gray-400" />;
        badge = "Notification";
        badgeColor = "bg-gray-500/15 text-gray-400 border-gray-500/30";
    }

    allNotifications.push({
      id: `backend-${n._id}`,
      type: n.type,
      icon,
      title: n.title,
      message: n.message,
      status:
        n.type === "trip_delayed"
          ? n.metadata?.audience === "admin"
            ? "Admin"
            : "Trip"
          : "Payment",
      time: n.createdAt,
      badge,
      badgeColor,
      isRead: n.isRead,
    });
  });

  // Trip delay notifications
  userTripNotifications.filter((t) => t.status === "Delayed").forEach((t) => {
    allNotifications.push({
      id: `trip-delay-${t._id}`,
      type: "trip_delay",
      icon: <FaExclamationTriangle className="text-red-400" />,
      title: `Trip Delayed: ${t.route}`,
      message: t.delayReason || "A trip on your route has been delayed.",
      status: "Trip",
      time: t.updatedAt || t.date,
      badge: "Delayed",
      badgeColor: "bg-red-500/15 text-red-400 border-red-500/30",
    });
  });

  // Trip completed notifications
  userTripNotifications.filter((t) => t.status === "Completed").forEach((t) => {
    allNotifications.push({
      id: `trip-done-${t._id}`,
      type: "trip_completed",
      icon: <FaCheckCircle className="text-emerald-400" />,
      title: `Trip Completed: ${t.route}`,
      message: `The trip on ${t.date} (${t.startTime} – ${t.endTime}) has been completed.`,
      status: "Trip",
      time: t.updatedAt || t.date,
      badge: "Completed",
      badgeColor: "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
    });
  });

  // Trip ongoing notifications
  userTripNotifications.filter((t) => t.status === "Ongoing").forEach((t) => {
    allNotifications.push({
      id: `trip-ongoing-${t._id}`,
      type: "trip_ongoing",
      icon: <FaPlay className="text-orange-400" />,
      title: `Trip Ongoing: ${t.route}`,
      message: `Trip in progress from ${t.startTime} to ${t.endTime} with ${t.passengers} passengers.`,
      status: "Trip",
      time: t.updatedAt || t.date,
      badge: "Ongoing",
      badgeColor: "bg-orange-500/15 text-orange-400 border-orange-500/30",
    });
  });

  // Trip scheduled notifications
  userTripNotifications.filter((t) => t.status === "Scheduled").forEach((t) => {
    allNotifications.push({
      id: `trip-scheduled-${t._id}`,
      type: "trip_scheduled",
      icon: <FaClock className="text-blue-400" />,
      title: `Trip Scheduled: ${t.route}`,
      message: `Trip scheduled on ${t.date} from ${t.startTime} to ${t.endTime}.`,
      status: "Trip",
      time: t.updatedAt || t.date,
      badge: "Scheduled",
      badgeColor: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    });
  });

  // Complaint response notifications for the current user
  complaints
    .filter((c) => {
      if (!sessionUser || sessionUser.role === "admin" || sessionUser.role === "routemanager") return false;
      return (
        c.userEmail?.toLowerCase() === sessionUser.email?.toLowerCase() ||
        c.userId === sessionUser.id
      );
    })
    .forEach((c) => {
      if (!c.adminResponse) return;
      allNotifications.push({
        id: `complaint-response-${c._id}`,
        type: "complaint_response",
        icon: <FaReply className="text-cyan-400" />,
        title: `Complaint Response: ${c.title}`,
        message: c.adminResponse,
        status: "Complaint",
        time: c.updatedAt || c.createdAt,
        badge: "Complaint",
        badgeColor: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
      });
    });

  // Sort newest first
  allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Filter by type
  const filtered =
    activeFilter === "all"
      ? allNotifications
      : allNotifications.filter(
          (n) =>
            (activeFilter === "Trips" && n.type.startsWith("trip_")) ||
            (activeFilter === "Admin" && n.status === "Admin") ||
            (activeFilter === "Complaints" && n.type === "complaint_response") ||
            (activeFilter === "Payments" && n.type.startsWith("payment_"))
        );

  const filterTabs = [
    { key: "all", label: "All", count: allNotifications.length },
    {
      key: "Trips",
      label: "Trips",
      count: allNotifications.filter((n) => n.type.startsWith("trip_")).length,
    },
    {
      key: "Admin",
      label: "Admin",
      count: allNotifications.filter((n) => n.status === "Admin").length,
    },
    {
      key: "Complaints",
      label: "Complaints",
      count: allNotifications.filter((n) => n.type === "complaint_response").length,
    },
    {
      key: "Payments",
      label: "Payments",
      count: allNotifications.filter((n) => n.type.startsWith("payment_")).length,
    },
  ];

  const formatTime = (t) => {
    if (!t) return "";
    const d = new Date(t);
    const now = new Date();
    const diffMs = now - d;
    const diffMins = Math.floor(diffMs / 60000);
    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    const diffHrs = Math.floor(diffMins / 60);
    if (diffHrs < 24) return `${diffHrs}h ago`;
    const diffDays = Math.floor(diffHrs / 24);
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  const summaryCards = [
    {
      label: "All Updates",
      value: allNotifications.length,
      tone: "text-cyan-200",
      detail: "Personal alerts tied to your account",
    },
    {
      label: "Payments",
      value: allNotifications.filter((n) => n.type.startsWith("payment_")).length,
      tone: "text-emerald-300",
      detail: "Verification, refunds, and payment actions",
    },
    {
      label: "Complaints",
      value: allNotifications.filter((n) => n.type === "complaint_response").length,
      tone: "text-orange-300",
      detail: "Replies from the support team",
    },
    {
      label: "Trip Updates",
      value: allNotifications.filter((n) => n.type.startsWith("trip_")).length,
      tone: "text-sky-300",
      detail: "Route progress and schedule changes",
    },
  ];

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(56,189,248,0.12),transparent_22%),radial-gradient(circle_at_top_right,rgba(249,115,22,0.10),transparent_18%),linear-gradient(180deg,#eef6fb_0%,#f7fbfe_42%,#ffffff_100%)] pb-20 text-slate-900">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[36px] border border-slate-200/80 bg-[linear-gradient(135deg,#f8fcff_0%,#eef7fc_52%,#e8f2f8_100%)] shadow-[0_26px_80px_rgba(15,23,42,0.12)] backdrop-blur-xl">
          <div className="border-b border-slate-200/80 bg-[linear-gradient(90deg,rgba(255,255,255,0.8),rgba(255,255,255,0.4))] px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-slate-500 md:px-10">
            UniRide Notification Center
          </div>
          <div className="p-6 md:px-10 md:py-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-orange-400">
                Account Updates
              </p>
              <h1 className="flex items-center gap-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-100 text-orange-500 ring-1 ring-orange-200 shadow-[0_10px_30px_rgba(249,115,22,0.12)]">
                  <FaBell />
                </span>
                Notifications
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">
                Review payment confirmations, complaint responses, and trip updates
                connected to your personal UniRide activity in one organized space.
              </p>
            </div>

            <div className="flex flex-col gap-4 lg:items-end">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                <FaArrowLeft /> Back to Home
              </Link>
              <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
                {summaryCards.map((card) => (
                  <div
                    key={card.label}
                    className="rounded-2xl border border-slate-200/80 bg-white/90 p-4 backdrop-blur-sm"
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                      {card.label}
                    </p>
                    <p className={`mt-3 text-3xl font-black ${card.tone}`}>{card.value}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{card.detail}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-slate-200/80 bg-white/90 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                Filter Notifications
              </p>
              <p className="mt-1 text-sm text-slate-600">
                View all updates or focus on a specific category.
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
            {filterTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveFilter(tab.key)}
                className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                  activeFilter === tab.key
                    ? "bg-orange-500 text-white shadow-lg shadow-orange-500/20"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeFilter === tab.key ? "bg-white/20" : "bg-white/10"
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
            </div>
          </div>
        </div>

        <div className="mt-8 space-y-5">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[30px] border border-slate-200/80 bg-white/90 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.08)] backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] bg-slate-100 text-4xl text-slate-400 ring-1 ring-slate-200">
                <FaBell />
              </div>
              <h2 className="text-xl font-bold text-slate-900">No notifications yet</h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">
                New complaint replies, trip alerts, and payment updates connected to
                your profile will appear here automatically.
              </p>
            </div>
          ) : (
            filtered.map((notif) => {
              const categoryIcon =
                notif.status === "Trip" ? (
                  <FaRoute className="text-sky-300" />
                ) : notif.status === "Complaint" ? (
                  <FaReply className="text-cyan-300" />
                ) : (
                  <FaReceipt className="text-emerald-300" />
                );

              return (
                <article
                  key={notif.id}
                  className="group overflow-hidden rounded-[30px] border border-slate-200/80 bg-[linear-gradient(135deg,rgba(255,255,255,0.95),rgba(247,250,252,0.98))] shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl transition hover:border-slate-300 hover:shadow-[0_20px_55px_rgba(15,23,42,0.12)]"
                >
                  <div className="grid gap-0 lg:grid-cols-[88px_1fr_170px]">
                    <div className="flex items-center justify-center border-b border-slate-200 bg-slate-50 px-6 py-6 lg:border-b-0 lg:border-r">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-white text-xl shadow-inner">
                        {notif.icon}
                      </div>
                    </div>

                    <div className="px-6 py-5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="inline-flex items-center gap-2 rounded-full bg-sky-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-sky-700 ring-1 ring-sky-200">
                          {categoryIcon}
                          {notif.status}
                        </span>
                        <span
                          className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider border ${notif.badgeColor}`}
                        >
                          {notif.badge}
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-bold text-slate-900">{notif.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-slate-600">{notif.message}</p>
                    </div>

                    <div className="flex items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-6 py-4 text-sm text-slate-600 lg:flex-col lg:items-start lg:justify-center lg:border-l lg:border-t-0">
                      <span className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                        Received
                      </span>
                      <span className="font-medium text-slate-800">{formatTime(notif.time)}</span>
                      <span className="text-xs uppercase tracking-[0.22em] text-slate-400">
                        {notif.isRead === false ? "Unread" : "Seen"}
                      </span>
                    </div>
                  </div>
                </article>
              );
            })
          )}
        </div>

        {!loading && allNotifications.length > 0 && (
          <div className="mt-10 rounded-[30px] border border-slate-200/80 bg-white/90 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.08)] backdrop-blur-xl">
            <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-orange-300">
                Trip Status Summary
              </p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Your ride-related activity</h2>
              </div>
              <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                Related to your booked routes
              </span>
            </div>
            <div className="grid gap-4 sm:grid-cols-4">
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-3xl font-black text-emerald-400">
                  {userTripNotifications.filter((t) => t.status === "Completed").length}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">Completed</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-3xl font-black text-red-400">
                  {userTripNotifications.filter((t) => t.status === "Delayed").length}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">Delayed</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-3xl font-black text-orange-400">
                  {userTripNotifications.filter((t) => t.status === "Ongoing").length}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">Ongoing</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                <p className="text-3xl font-black text-blue-400">
                  {userTripNotifications.filter((t) => t.status === "Scheduled").length}
                </p>
                <p className="mt-1 text-sm font-medium text-slate-600">Scheduled</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
