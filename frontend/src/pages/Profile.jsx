import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:5000/api";

function getLoggedInUserId() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).id : null;
  } catch {
    return null;
  }
}

const STATUS_STYLES = {
  confirmed: "bg-emerald-400/10 text-emerald-400 border border-emerald-400/30",
  cancelled: "bg-red-400/10 text-red-400 border border-red-400/30",
};

// Compare only calendar date (ignore time)
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function Profile() {
  const navigate = useNavigate();
  const CURRENT_USER_ID = getLoggedInUserId();

  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null); // booking _id being cancelled
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    if (!CURRENT_USER_ID) {
      navigate("/login");
      return;
    }
    const fetchAll = async () => {
      try {
        const [userRes, bookingsRes] = await Promise.all([
          axios.get(`${API}/users/${CURRENT_USER_ID}`),
          axios.get(`${API}/users/${CURRENT_USER_ID}/bookings`),
        ]);
        setUser(userRes.data);
        setBookings(bookingsRes.data);
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, []);

  const handleCancel = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking?"))
      return;
    setCancelling(bookingId);
    try {
      await axios.put(`${API}/bookings/${bookingId}/cancel`);
      setBookings((prev) =>
        prev.map((b) =>
          b._id === bookingId ? { ...b, status: "cancelled" } : b,
        ),
      );
    } catch (err) {
      alert(err.response?.data?.message || "Failed to cancel booking.");
    } finally {
      setCancelling(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] flex items-center justify-center">
        <p className="text-slate-300 text-sm animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] flex items-center justify-center px-4">
        <div className="rounded-2xl bg-red-500/10 border border-red-500/30 px-6 py-8 text-red-400 text-sm max-w-lg w-full text-center">
          {error}
        </div>
      </div>
    );
  }

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  const memberSince = new Date(user.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const todayTs = startOfDay(new Date());
  const tomorrowTs = todayTs + 86_400_000;

  const todayBookings = bookings.filter(
    (b) => startOfDay(b.travelStartDate) === todayTs,
  );
  const upcomingBookings = bookings.filter(
    (b) =>
      startOfDay(b.travelStartDate) >= tomorrowTs && b.status === "confirmed",
  );
  const pastBookings = bookings.filter(
    (b) => startOfDay(b.travelStartDate) < todayTs,
  );

  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;

  // ── Filter helper ────────────────────────────────────────────────────────
  const applyFilters = (list) => {
    const q = searchQuery.trim().toLowerCase();
    return list.filter((b) => {
      // Text search: route name, locations, boarding stop, ref ID
      if (q) {
        const haystack = [
          b.route?.routeName,
          b.route?.startLocation,
          b.route?.endLocation,
          b.boardingStop?.stopName,
          b._id.slice(-8).toUpperCase(),
          b.passengerName,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!haystack.includes(q)) return false;
      }
      // Status filter
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      // Date from
      if (dateFrom) {
        const from = new Date(dateFrom).setHours(0, 0, 0, 0);
        if (startOfDay(b.travelStartDate) < from) return false;
      }
      // Date to
      if (dateTo) {
        const to = new Date(dateTo).setHours(23, 59, 59, 999);
        if (new Date(b.travelStartDate).getTime() > to) return false;
      }
      return true;
    });
  };

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    statusFilter !== "all" ||
    dateFrom !== "" ||
    dateTo !== "";

  // ── Shared booking card renderer ─────────────────────────────────────────
  const BookingCard = ({ b, allowCancel = false }) => (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <p className="font-bold text-white text-sm">
          {b.route?.routeName || "Unknown Route"}
        </p>
        <p className="text-xs text-slate-400 mt-0.5">
          {b.route?.startLocation} → {b.route?.endLocation}
        </p>
        {b.boardingStop && (
          <p className="text-xs text-slate-400 mt-0.5">
            Boards at: {b.boardingStop.stopName}
          </p>
        )}
        {b.route?.startTime && (
          <p className="text-xs text-orange-400 mt-0.5">
            Departure: {b.route.startTime}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:items-end gap-1.5">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || "bg-white/10 text-slate-400 border border-white/20"}`}
        >
          {b.status}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(b.travelStartDate).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
          {b.totalDays > 1 && (
            <>
              {" → "}
              {new Date(b.travelEndDate).toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
              {" ("}
              {b.totalDays}
              {" days)"}
            </>
          )}
        </span>
        {b.totalAmount > 0 && (
          <span className="text-xs font-semibold text-orange-400">
            LKR {b.totalAmount.toLocaleString()}
          </span>
        )}
        <span className="text-xs font-mono text-slate-500">
          #{b._id.slice(-8).toUpperCase()}
        </span>
        {allowCancel && b.status === "confirmed" && (
          <button
            onClick={() => handleCancel(b._id)}
            disabled={cancelling === b._id}
            className="mt-1 px-3 py-1 rounded-lg text-xs font-semibold border border-red-500/30 text-red-400 bg-red-500/10 hover:bg-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {cancelling === b._id ? "Cancelling…" : "Cancel Booking"}
          </button>
        )}
      </div>
    </div>
  );

  const EmptyState = ({ message }) => (
    <p className="text-sm text-slate-400 text-center py-6">{message}</p>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] text-white pb-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 py-10 lg:py-14 space-y-6">
        {/* ── Header Card ────────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-8 flex flex-col sm:flex-row items-center gap-6 shadow-2xl">
          <div className="flex-shrink-0 w-20 h-20 rounded-2xl bg-orange-500/20 border-2 border-orange-500/40 flex items-center justify-center text-3xl font-bold text-orange-400 tracking-wide">
            {initials}
          </div>
          <div className="text-center sm:text-left">
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400 font-bold mb-1">
              Profile
            </p>
            <h1 className="text-2xl font-extrabold text-white">{user.name}</h1>
            <p className="text-slate-300 text-sm mt-0.5">{user.email}</p>
            <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
              <span className="inline-block px-3 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold capitalize border border-orange-500/30">
                {user.role}
              </span>
              <span
                className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold border ${user.isActive ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30" : "bg-red-400/10 text-red-400 border-red-400/30"}`}
              >
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </div>
          </div>
        </div>

        {/* ── Info & Stats Row ───────────────────────────────────────────── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6">
            <h2 className="text-sm font-bold text-orange-400 uppercase tracking-[0.2em] mb-4">
              Account Info
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <span className="w-5">📧</span>
                <span className="text-slate-300">{user.email}</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5">📱</span>
                <span className="text-slate-300">
                  {user.phoneNumber || "—"}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5">🗓️</span>
                <span className="text-slate-300">
                  Member since {memberSince}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className="w-5">🎓</span>
                <span className="text-slate-300 capitalize">{user.role}</span>
              </div>
            </div>
          </div>

          <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6">
            <h2 className="text-sm font-bold text-orange-400 uppercase tracking-[0.2em] mb-4">
              Ride Summary
            </h2>
            <div className="flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Total Bookings</span>
                <span className="text-2xl font-bold text-orange-400">
                  {bookings.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Confirmed</span>
                <span className="text-lg font-semibold text-emerald-400">
                  {confirmedCount}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-300">Cancelled</span>
                <span className="text-lg font-semibold text-red-400">
                  {cancelledCount}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Filter Bar ───────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] flex items-center gap-2">
              🔍 Filter Bookings
            </h2>
            {hasActiveFilters && (
              <button
                onClick={() => {
                  setSearchQuery("");
                  setStatusFilter("all");
                  setDateFrom("");
                  setDateTo("");
                }}
                className="text-xs text-orange-400 hover:text-orange-300 border border-orange-400/30 px-2.5 py-1 rounded-lg bg-orange-400/10 hover:bg-orange-400/20 transition-colors"
              >
                Clear All
              </button>
            )}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Search input */}
            <div className="relative sm:col-span-2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm pointer-events-none">
                🔍
              </span>
              <input
                type="text"
                placeholder="Search by route, location, stop or ref ID…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-orange-400/50 focus:bg-white/10 transition-colors"
              />
            </div>
            {/* Status filter */}
            <div>
              <label className="block text-xs text-slate-400 mb-1 ml-1">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-orange-400/50 transition-colors appearance-none"
              >
                <option value="all" className="bg-[#0A2233]">
                  All Statuses
                </option>
                <option value="confirmed" className="bg-[#0A2233]">
                  Confirmed
                </option>
                <option value="cancelled" className="bg-[#0A2233]">
                  Cancelled
                </option>
              </select>
            </div>
            {/* Date from */}
            <div>
              <label className="block text-xs text-slate-400 mb-1 ml-1">
                From Date
              </label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-orange-400/50 transition-colors [color-scheme:dark]"
              />
            </div>
            {/* Date to */}
            <div>
              <label className="block text-xs text-slate-400 mb-1 ml-1">
                To Date
              </label>
              <input
                type="date"
                value={dateTo}
                min={dateFrom || undefined}
                onChange={(e) => setDateTo(e.target.value)}
                className="w-full px-3 py-2.5 rounded-xl bg-white/5 border border-white/10 text-sm text-white focus:outline-none focus:border-orange-400/50 transition-colors [color-scheme:dark]"
              />
            </div>
          </div>
          {hasActiveFilters && (
            <p className="mt-3 text-xs text-slate-400">
              Showing filtered results across all sections.
            </p>
          )}
        </div>

        {/* ── Today's Rides ─────────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-orange-500/30 shadow-2xl p-6">
          <h2 className="text-sm font-bold text-orange-400 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            🚌 Today's Rides
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Today's bookings cannot be cancelled.
          </p>
          {(() => {
            const filtered = applyFilters(todayBookings);
            return filtered.length === 0 ? (
              <EmptyState
                message={
                  hasActiveFilters
                    ? "No rides match your filters."
                    : "No rides scheduled for today."
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((b) => (
                  <BookingCard key={b._id} b={b} allowCancel={false} />
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Upcoming Bookings ─────────────────────────────────────────── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6">
          <h2 className="text-sm font-bold text-white uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            📅 Upcoming Bookings
          </h2>
          <p className="text-xs text-slate-400 mb-4">
            Tomorrow onwards · You can cancel these.
          </p>
          {(() => {
            const filtered = applyFilters(upcomingBookings);
            return filtered.length === 0 ? (
              <EmptyState
                message={
                  hasActiveFilters
                    ? "No bookings match your filters."
                    : "No upcoming bookings."
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((b) => (
                  <BookingCard key={b._id} b={b} allowCancel={true} />
                ))}
              </div>
            );
          })()}
        </div>

        {/* ── Past Booking History ──────────────────────────────────────── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl p-6">
          <h2 className="text-sm font-bold text-slate-300 uppercase tracking-[0.2em] mb-1 flex items-center gap-2">
            🕙 Past Booking History
          </h2>
          <p className="text-xs text-slate-400 mb-4">All rides before today.</p>
          {(() => {
            const filtered = applyFilters(pastBookings);
            return filtered.length === 0 ? (
              <EmptyState
                message={
                  hasActiveFilters
                    ? "No bookings match your filters."
                    : "No past bookings."
                }
              />
            ) : (
              <div className="space-y-3">
                {filtered.map((b) => (
                  <BookingCard key={b._id} b={b} allowCancel={false} />
                ))}
              </div>
            );
          })()}
        </div>
      </div>
    </div>
  );
}

export default Profile;
