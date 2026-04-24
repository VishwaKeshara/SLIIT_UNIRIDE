import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosinstance";
import {
  FaBell, FaCheckCircle, FaClock, FaExclamationTriangle,
  FaReply, FaBus, FaRoute, FaCalendarAlt, FaArrowLeft, FaPlay,
} from "react-icons/fa";

export default function Notifications() {
  const [trips, setTrips] = useState([]);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState("all");

  const sessionUser = (() => {
    try {
      const u = JSON.parse(localStorage.getItem("userData") || localStorage.getItem("user"));
      if (u) return { ...u, role: "user" };
      const a = JSON.parse(localStorage.getItem("adminData"));
      if (a) return { ...a, role: "admin" };
      return null;
    } catch {
      return null;
    }
  })();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [tripRes, complaintRes] = await Promise.all([
          axios.get("/trips"),
          axios.get("/complaints"),
        ]);
        setTrips(tripRes.data);
        setComplaints(complaintRes.data);
      } catch (err) {
        console.error("Failed to fetch notifications", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Build notification items
  const notifications = [];

  // Trip delay notifications
  trips.filter((t) => t.status === "Delayed").forEach((t) => {
    notifications.push({
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
  trips.filter((t) => t.status === "Completed").forEach((t) => {
    notifications.push({
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
  trips.filter((t) => t.status === "Ongoing").forEach((t) => {
    notifications.push({
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
  trips.filter((t) => t.status === "Scheduled").forEach((t) => {
    notifications.push({
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
      if (!sessionUser || sessionUser.role !== "user") return false;
      return (
        c.userEmail?.toLowerCase() === sessionUser.email?.toLowerCase() ||
        c.userId === sessionUser.id
      );
    })
    .forEach((c) => {
      if (!c.adminResponse) return;
      notifications.push({
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
  notifications.sort((a, b) => new Date(b.time) - new Date(a.time));

  // Filter by type
  const filtered =
    activeFilter === "all"
      ? notifications
      : notifications.filter(
          (n) =>
            (activeFilter === "Trips" && n.type.startsWith("trip_")) ||
            (activeFilter === "Complaints" && n.type === "complaint_response")
        );

  const filterTabs = [
    { key: "all", label: "All", count: notifications.length },
    {
      key: "Trips",
      label: "Trips",
      count: notifications.filter((n) => n.type.startsWith("trip_")).length,
    },
    {
      key: "Complaints",
      label: "Complaints",
      count: notifications.filter((n) => n.type === "complaint_response").length,
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

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] pb-20 text-white">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md p-6 shadow-2xl md:px-10 md:py-8 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400 font-bold mb-2">Updates</p>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl flex items-center gap-3">
                <FaBell className="text-orange-400" /> Notifications
              </h1>
              <p className="mt-2 text-slate-300 max-w-2xl">Stay updated on your complaints, trip statuses, and important alerts.</p>
            </div>
            <Link to="/home" className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition backdrop-blur-sm shrink-0">
              <FaArrowLeft /> Back to Home
            </Link>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="mt-6 flex gap-2 p-1.5 bg-black/20 rounded-xl border border-white/10 shadow-inner w-fit">
          {filterTabs.map(tab => (
            <button key={tab.key} onClick={() => setActiveFilter(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeFilter === tab.key ? "bg-orange-500 text-white shadow-lg" : "text-slate-300 hover:text-white"
              }`}>
              {tab.label}
              <span className={`rounded-full px-2 py-0.5 text-xs font-bold ${
                activeFilter === tab.key ? "bg-white/20" : "bg-white/10"
              }`}>{tab.count}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="mt-8 space-y-4">
          {loading ? (
            <div className="flex justify-center py-16">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="rounded-3xl bg-white/10 backdrop-blur-md p-10 text-center border border-white/10 shadow-2xl">
              <FaBell className="mx-auto text-5xl text-slate-500 mb-4" />
              <h2 className="text-xl font-bold text-white mb-2">No notifications yet</h2>
              <p className="text-slate-400">When there are updates to your complaints or trips, they'll appear here.</p>
            </div>
          ) : (
            filtered.map((notif) => (
              <div key={notif.id} className="group rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/10 shadow-lg hover:bg-white/15 transition">
                <div className="flex items-start gap-4">
                  {/* Icon */}
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white/10 text-lg border border-white/10 shadow-inner">
                    {notif.icon}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <h3 className="text-base font-bold text-white">{notif.title}</h3>
                      <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider border ${notif.badgeColor}`}>
                        {notif.badge}
                      </span>
                    </div>
                    <p className="text-sm text-slate-300 leading-relaxed">{notif.message}</p>
                    <p className="mt-2 text-xs text-slate-500 font-medium">{formatTime(notif.time)}</p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Summary Stats */}
        {!loading && notifications.length > 0 && (
          <div className="mt-10 grid gap-4 sm:grid-cols-4">
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/10 text-center">
              <p className="text-3xl font-black text-emerald-400">{trips.filter(t => t.status === "Completed").length}</p>
              <p className="mt-1 text-sm text-slate-400 font-medium">Completed</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/10 text-center">
              <p className="text-3xl font-black text-red-400">{trips.filter(t => t.status === "Delayed").length}</p>
              <p className="mt-1 text-sm text-slate-400 font-medium">Delayed</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/10 text-center">
              <p className="text-3xl font-black text-orange-400">{trips.filter(t => t.status === "Ongoing").length}</p>
              <p className="mt-1 text-sm text-slate-400 font-medium">Ongoing</p>
            </div>
            <div className="rounded-2xl bg-white/10 backdrop-blur-md p-5 border border-white/10 text-center">
              <p className="text-3xl font-black text-blue-400">{trips.filter(t => t.status === "Scheduled").length}</p>
              <p className="mt-1 text-sm text-slate-400 font-medium">Scheduled</p>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
