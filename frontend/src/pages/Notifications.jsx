import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import {
  FaArrowLeft,
  FaBell,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaPlay,
  FaReceipt,
  FaReply,
  FaRoute,
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
      `${routeValue.startLocation || ""} - ${routeValue.endLocation || ""}`,
    ),
  ];

  return [...new Set(aliases.filter(Boolean))];
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

export default function Notifications() {
  const navigate = useNavigate();
  const location = useLocation();
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedNotificationId, setSelectedNotificationId] = useState(null);

  const sessionUser = useMemo(() => {
    try {
      const user = JSON.parse(
        localStorage.getItem("userData") ||
          localStorage.getItem("user") ||
          "null",
      );
      if (user) return user;

      const admin = JSON.parse(localStorage.getItem("adminData") || "null");
      if (admin) return admin;

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
        const [tripRes, bookingRes, complaintRes, notificationRes] =
          await Promise.all([
            axios.get("/trips"),
            sessionUser &&
            sessionUser.role !== "admin" &&
            sessionUser.role !== "routemanager"
              ? axios.get(`/users/${sessionUser.id}/bookings`)
              : Promise.resolve({ data: [] }),
            axios.get("/complaints"),
            sessionUser
              ? axios.get(`/notifications/user/${sessionUser.id}`)
              : Promise.resolve({ data: [] }),
          ]);

        setTrips(tripRes.data);
        setBookings(bookingRes.data);
        setComplaints(complaintRes.data);
        setNotifications(notificationRes.data);
      } catch (error) {
        console.error("Failed to fetch notifications", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [location.pathname, navigate, sessionUser]);

  useEffect(() => {
    if (!notifications.length) return;

    const unreadIds = notifications
      .filter((notification) => !notification.isRead)
      .map((notification) => notification._id);

    unreadIds.forEach(async (id) => {
      try {
        await axios.patch(`/notifications/${id}/read`);
      } catch (error) {
        console.error("Failed to mark notification as read", error);
      }
    });

    if (unreadIds.length) {
      setNotifications((prev) =>
        prev.map((notification) =>
          unreadIds.includes(notification._id)
            ? { ...notification, isRead: true }
            : notification,
        ),
      );
    }
  }, [notifications]);

  if (!sessionUser) {
    return null;
  }

  const allNotifications = [];
  const userRouteKeys = new Set(
    bookings.flatMap((booking) => getRouteAliases(booking.route)).filter(Boolean),
  );

  const userTripNotifications = trips.filter((trip) => {
    if (
      !sessionUser ||
      sessionUser.role === "admin" ||
      sessionUser.role === "routemanager"
    ) {
      return false;
    }

    return getRouteAliases(trip.route).some((alias) => userRouteKeys.has(alias));
  });

  notifications.forEach((notification) => {
    let icon;
    let badge;
    let badgeColor;
    let detailRows = [];

    switch (notification.type) {
      case "payment_verified":
        icon = <FaCheckCircle className="text-emerald-500" />;
        badge = "Payment Verified";
        badgeColor = "bg-emerald-50 text-emerald-700 border-emerald-200";
        detailRows = [
          { label: "Category", value: "Payment update" },
          { label: "Status", value: "Verified" },
        ];
        break;
      case "payment_refunded":
        icon = <FaCheckCircle className="text-blue-500" />;
        badge = "Payment Refunded";
        badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
        detailRows = [
          { label: "Category", value: "Payment update" },
          { label: "Status", value: "Refunded" },
        ];
        break;
      case "payment_failed":
        icon = <FaExclamationTriangle className="text-red-500" />;
        badge = "Payment Failed";
        badgeColor = "bg-red-50 text-red-700 border-red-200";
        detailRows = [
          { label: "Category", value: "Payment update" },
          { label: "Status", value: "Failed" },
        ];
        break;
      case "trip_delayed":
        icon = <FaExclamationTriangle className="text-red-500" />;
        badge =
          notification.metadata?.audience === "admin" ? "Admin Alert" : "Delayed";
        badgeColor = "bg-red-50 text-red-700 border-red-200";
        detailRows = [
          { label: "Route", value: notification.metadata?.route || "Not available" },
          { label: "Trip date", value: notification.metadata?.tripDate || "Not available" },
          {
            label: "Time window",
            value:
              notification.metadata?.startTime && notification.metadata?.endTime
                ? `${notification.metadata.startTime} - ${notification.metadata.endTime}`
                : "Not available",
          },
          {
            label: "Delay reason",
            value: notification.metadata?.delayReason || "Not available",
          },
        ];
        break;
      default:
        icon = <FaBell className="text-slate-500" />;
        badge = "Notification";
        badgeColor = "bg-slate-100 text-slate-700 border-slate-200";
        detailRows = [{ label: "Category", value: "General notification" }];
    }

    allNotifications.push({
      id: `backend-${notification._id}`,
      type: notification.type,
      icon,
      title: notification.title,
      message: notification.message,
      status:
        notification.type === "trip_delayed"
          ? notification.metadata?.audience === "admin"
            ? "Admin"
            : "Trip"
          : "Payment",
      time: notification.createdAt,
      badge,
      badgeColor,
      isRead: notification.isRead,
      detailRows,
    });
  });

  userTripNotifications
    .filter((trip) => trip.status === "Delayed")
    .forEach((trip) => {
      allNotifications.push({
        id: `trip-delay-${trip._id}`,
        type: "trip_delay",
        icon: <FaExclamationTriangle className="text-red-500" />,
        title: `Trip Delayed: ${trip.route}`,
        message: trip.delayReason || "A trip on your route has been delayed.",
        status: "Trip",
        time: trip.updatedAt || trip.date,
        badge: "Delayed",
        badgeColor: "bg-red-50 text-red-700 border-red-200",
        detailRows: [
          { label: "Route", value: trip.route || "Not available" },
          { label: "Date", value: trip.date || "Not available" },
          {
            label: "Time window",
            value: `${trip.startTime || "-"} - ${trip.endTime || "-"}`,
          },
          { label: "Passengers", value: trip.passengers || "Not available" },
          { label: "Delay reason", value: trip.delayReason || "Not available" },
        ],
      });
    });

  userTripNotifications
    .filter((trip) => trip.status === "Completed")
    .forEach((trip) => {
      allNotifications.push({
        id: `trip-done-${trip._id}`,
        type: "trip_completed",
        icon: <FaCheckCircle className="text-emerald-500" />,
        title: `Trip Completed: ${trip.route}`,
        message: `The trip on ${trip.date} (${trip.startTime} - ${trip.endTime}) has been completed.`,
        status: "Trip",
        time: trip.updatedAt || trip.date,
        badge: "Completed",
        badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
        detailRows: [
          { label: "Route", value: trip.route || "Not available" },
          { label: "Date", value: trip.date || "Not available" },
          {
            label: "Time window",
            value: `${trip.startTime || "-"} - ${trip.endTime || "-"}`,
          },
          { label: "Passengers", value: trip.passengers || "Not available" },
        ],
      });
    });

  userTripNotifications
    .filter((trip) => trip.status === "Ongoing")
    .forEach((trip) => {
      allNotifications.push({
        id: `trip-ongoing-${trip._id}`,
        type: "trip_ongoing",
        icon: <FaPlay className="text-cyan-600" />,
        title: `Trip Ongoing: ${trip.route}`,
        message: `Trip in progress from ${trip.startTime} to ${trip.endTime}.`,
        status: "Trip",
        time: trip.updatedAt || trip.date,
        badge: "Ongoing",
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        detailRows: [
          { label: "Route", value: trip.route || "Not available" },
          { label: "Date", value: trip.date || "Not available" },
          {
            label: "Time window",
            value: `${trip.startTime || "-"} - ${trip.endTime || "-"}`,
          },
          { label: "Passengers", value: trip.passengers || "Not available" },
        ],
      });
    });

  userTripNotifications
    .filter((trip) => trip.status === "Scheduled")
    .forEach((trip) => {
      allNotifications.push({
        id: `trip-scheduled-${trip._id}`,
        type: "trip_scheduled",
        icon: <FaClock className="text-blue-500" />,
        title: `Trip Scheduled: ${trip.route}`,
        message: `Trip scheduled on ${trip.date} from ${trip.startTime} to ${trip.endTime}.`,
        status: "Trip",
        time: trip.updatedAt || trip.date,
        badge: "Scheduled",
        badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
        detailRows: [
          { label: "Route", value: trip.route || "Not available" },
          { label: "Date", value: trip.date || "Not available" },
          {
            label: "Time window",
            value: `${trip.startTime || "-"} - ${trip.endTime || "-"}`,
          },
          { label: "Passengers", value: trip.passengers || "Not available" },
        ],
      });
    });

  complaints
    .filter((complaint) => {
      if (
        !sessionUser ||
        sessionUser.role === "admin" ||
        sessionUser.role === "routemanager"
      ) {
        return false;
      }

      return (
        complaint.userEmail?.toLowerCase() === sessionUser.email?.toLowerCase() ||
        complaint.userId === sessionUser.id
      );
    })
    .forEach((complaint) => {
      if (!complaint.adminResponse) return;

      allNotifications.push({
        id: `complaint-response-${complaint._id}`,
        type: "complaint_response",
        icon: <FaReply className="text-cyan-600" />,
        title: `Complaint Response: ${complaint.title}`,
        message: complaint.adminResponse,
        status: "Complaint",
        time: complaint.updatedAt || complaint.createdAt,
        badge: "Complaint",
        badgeColor: "bg-cyan-50 text-cyan-700 border-cyan-200",
        detailRows: [
          { label: "Complaint title", value: complaint.title || "Not available" },
          { label: "Category", value: complaint.type || "Not available" },
          { label: "Status", value: complaint.status || "Not available" },
          { label: "Submitted by", value: complaint.userName || "Not available" },
        ],
      });
    });

  allNotifications.sort((a, b) => new Date(b.time) - new Date(a.time));

  const filtered =
    activeFilter === "all"
      ? allNotifications
      : allNotifications.filter(
          (notification) =>
            (activeFilter === "Trips" &&
              notification.type.startsWith("trip_")) ||
            (activeFilter === "Admin" && notification.status === "Admin") ||
            (activeFilter === "Complaints" &&
              notification.type === "complaint_response") ||
            (activeFilter === "Payments" &&
              notification.type.startsWith("payment_")),
        );

  const selectedNotification =
    filtered.find((notification) => notification.id === selectedNotificationId) ||
    filtered[0] ||
    null;

  useEffect(() => {
    if (!filtered.length) {
      setSelectedNotificationId(null);
      return;
    }

    if (!selectedNotificationId || !filtered.some((item) => item.id === selectedNotificationId)) {
      setSelectedNotificationId(filtered[0].id);
    }
  }, [filtered, selectedNotificationId]);

  const filterTabs = [
    { key: "all", label: "All", count: allNotifications.length },
    {
      key: "Trips",
      label: "Trips",
      count: allNotifications.filter((notification) =>
        notification.type.startsWith("trip_"),
      ).length,
    },
    {
      key: "Admin",
      label: "Admin",
      count: allNotifications.filter((notification) => notification.status === "Admin")
        .length,
    },
    {
      key: "Complaints",
      label: "Complaints",
      count: allNotifications.filter(
        (notification) => notification.type === "complaint_response",
      ).length,
    },
    {
      key: "Payments",
      label: "Payments",
      count: allNotifications.filter((notification) =>
        notification.type.startsWith("payment_"),
      ).length,
    },
  ];

  const formatTime = (value) => {
    if (!value) return "";

    const date = new Date(value);
    const now = new Date();
    const diffMs = now - date;
    const diffMinutes = Math.floor(diffMs / 60000);

    if (diffMinutes < 1) return "Just now";
    if (diffMinutes < 60) return `${diffMinutes}m ago`;

    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;

    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString();
  };

  const summaryCards = [
    {
      label: "All Updates",
      value: allNotifications.length,
      tone: "text-cyan-700",
      detail: "Personal alerts tied to your UniRide account",
    },
    {
      label: "Payments",
      value: allNotifications.filter((notification) =>
        notification.type.startsWith("payment_"),
      ).length,
      tone: "text-emerald-600",
      detail: "Verification, refunds, and payment actions",
    },
    {
      label: "Complaints",
      value: allNotifications.filter(
        (notification) => notification.type === "complaint_response",
      ).length,
      tone: "text-orange-500",
      detail: "Replies from the support team",
    },
    {
      label: "Trip Updates",
      value: allNotifications.filter((notification) =>
        notification.type.startsWith("trip_"),
      ).length,
      tone: "text-sky-600",
      detail: "Route progress and schedule changes",
    },
  ];

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] pb-20 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[36px] border border-white/35 bg-white/14 shadow-[0_26px_80px_rgba(15,23,42,0.18)] backdrop-blur-xl">
          <div className="border-b border-white/15 bg-white/10 px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.32em] text-cyan-200 md:px-10">
            UniRide Notification Center
          </div>

          <div className="p-6 md:px-10 md:py-8">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="mb-2 text-sm font-bold uppercase tracking-[0.22em] text-cyan-300">
                  Account Updates
                </p>
                <h1 className="flex items-center gap-3 text-3xl font-extrabold text-white sm:text-4xl">
                  <span className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/15 text-cyan-300 shadow-[0_10px_30px_rgba(56,189,248,0.12)]">
                    <FaBell />
                  </span>
                  Notifications
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-300 sm:text-base">
                  Review payment confirmations, complaint responses, and trip
                  updates connected to your UniRide activity in one organized,
                  professional inbox.
                </p>
              </div>

              <div className="flex flex-col gap-4 lg:items-end">
                <Link
                  to="/home"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/20"
                >
                  <FaArrowLeft /> Back to Home
                </Link>
                <div className="grid gap-3 sm:grid-cols-2 lg:w-[520px]">
                  {summaryCards.map((card) => (
                    <div
                      key={card.label}
                      className="rounded-2xl border border-white/45 bg-white/76 p-4 backdrop-blur-sm"
                    >
                      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        {card.label}
                      </p>
                      <p className={`mt-3 text-3xl font-black ${card.tone}`}>
                        {card.value}
                      </p>
                      <p className="mt-2 text-sm leading-6 text-slate-600">
                        {card.detail}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-[28px] border border-white/35 bg-white/76 p-3 shadow-[0_20px_60px_rgba(15,23,42,0.10)] backdrop-blur-xl">
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
                  type="button"
                  onClick={() => setActiveFilter(tab.key)}
                  className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition ${
                    activeFilter === tab.key
                      ? "bg-cyan-500 text-white shadow-lg shadow-cyan-500/20"
                      : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                  }`}
                >
                  {tab.label}
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                      activeFilter === tab.key ? "bg-white/20" : "bg-slate-100"
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-8">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-[30px] border border-white/35 bg-white/76 p-10 text-center shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
              <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[28px] border border-slate-200 bg-slate-100 text-4xl text-slate-400">
                <FaBell />
              </div>
              <h2 className="text-xl font-bold text-slate-900">
                No notifications yet
              </h2>
              <p className="mx-auto mt-3 max-w-lg text-sm leading-7 text-slate-600">
                New complaint replies, trip alerts, and payment updates connected
                to your profile will appear here automatically.
              </p>
            </div>
          ) : (
            <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
              <div className="rounded-[32px] border border-white/35 bg-white/76 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                <div className="border-b border-slate-200 px-6 py-5">
                  <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
                    Notification List
                  </p>
                  <h2 className="mt-2 text-2xl font-bold text-slate-900">
                    Your updates
                  </h2>
                </div>

                <div className="max-h-[760px] overflow-y-auto p-4">
                  <div className="space-y-3">
                    {filtered.map((notification) => (
                      <button
                        key={notification.id}
                        type="button"
                        onClick={() => setSelectedNotificationId(notification.id)}
                        className={`w-full rounded-[26px] border p-4 text-left transition ${
                          selectedNotification?.id === notification.id
                            ? "border-cyan-300 bg-cyan-50/85 shadow-[0_12px_35px_rgba(34,211,238,0.12)]"
                            : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="mt-1 flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-lg">
                            {notification.icon}
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider ${notification.badgeColor}`}
                              >
                                {notification.badge}
                              </span>
                              <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                                {notification.status}
                              </span>
                            </div>

                            <h3 className="mt-3 line-clamp-1 text-base font-bold text-slate-900">
                              {notification.title}
                            </h3>
                            <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">
                              {notification.message}
                            </p>

                            <div className="mt-3 flex items-center justify-between gap-3 text-xs text-slate-500">
                              <span>{formatTime(notification.time)}</span>
                              <span>
                                {notification.isRead === false ? "Unread" : "Seen"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                {selectedNotification && (
                  <article className="rounded-[32px] border border-white/35 bg-white/76 p-6 shadow-[0_24px_70px_rgba(15,23,42,0.10)] backdrop-blur-xl md:p-8">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-xl">
                        {selectedNotification.icon}
                      </div>
                      <div>
                        <p className="text-sm uppercase tracking-[0.22em] text-cyan-600">
                          Notification Details
                        </p>
                        <h2 className="mt-1 text-2xl font-bold text-slate-900">
                          {selectedNotification.title}
                        </h2>
                      </div>
                    </div>

                    <div className="mt-5 flex flex-wrap gap-2">
                      <span
                        className={`rounded-full border px-3 py-1 text-xs font-bold uppercase tracking-wider ${selectedNotification.badgeColor}`}
                      >
                        {selectedNotification.badge}
                      </span>
                      <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-slate-600">
                        {selectedNotification.status}
                      </span>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                        Message
                      </p>
                      <p className="mt-3 text-sm leading-7 text-slate-700">
                        {selectedNotification.message}
                      </p>
                    </div>

                    <div className="mt-6 grid gap-4 sm:grid-cols-2">
                      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                          Received
                        </p>
                        <p className="mt-3 text-base font-semibold text-slate-900">
                          {formatDateTime(selectedNotification.time)}
                        </p>
                      </div>
                      <div className="rounded-[24px] border border-slate-200 bg-white p-5">
                        <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                          Read Status
                        </p>
                        <p className="mt-3 text-base font-semibold text-slate-900">
                          {selectedNotification.isRead === false
                            ? "Unread"
                            : "Seen"}
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 rounded-[24px] border border-slate-200 bg-white p-5">
                      <p className="text-sm uppercase tracking-[0.2em] text-slate-500">
                        Related Details
                      </p>
                      <div className="mt-4 grid gap-3">
                        {selectedNotification.detailRows.map((row) => (
                          <div
                            key={`${selectedNotification.id}-${row.label}`}
                            className="flex flex-col gap-1 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3"
                          >
                            <span className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                              {row.label}
                            </span>
                            <span className="text-sm font-medium text-slate-800">
                              {row.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </article>
                )}

                {!loading && allNotifications.length > 0 && (
                  <div className="rounded-[30px] border border-white/35 bg-white/76 p-6 shadow-[0_18px_50px_rgba(15,23,42,0.10)] backdrop-blur-xl">
                    <div className="mb-5 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.22em] text-cyan-600">
                          Trip Status Summary
                        </p>
                        <h2 className="mt-2 text-2xl font-bold text-slate-900">
                          Your ride-related activity
                        </h2>
                      </div>
                      <span className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                        Related to your booked routes
                      </span>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-4">
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-3xl font-black text-emerald-500">
                          {
                            userTripNotifications.filter(
                              (trip) => trip.status === "Completed",
                            ).length
                          }
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          Completed
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-3xl font-black text-red-500">
                          {
                            userTripNotifications.filter(
                              (trip) => trip.status === "Delayed",
                            ).length
                          }
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          Delayed
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-3xl font-black text-cyan-600">
                          {
                            userTripNotifications.filter(
                              (trip) => trip.status === "Ongoing",
                            ).length
                          }
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          Ongoing
                        </p>
                      </div>
                      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5 text-center">
                        <p className="text-3xl font-black text-blue-500">
                          {
                            userTripNotifications.filter(
                              (trip) => trip.status === "Scheduled",
                            ).length
                          }
                        </p>
                        <p className="mt-1 text-sm font-medium text-slate-600">
                          Scheduled
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
