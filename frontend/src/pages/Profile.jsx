import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

// Hardcoded until proper auth/session is implemented
const CURRENT_USER_ID = "69c549d0c8831d40e9fd3ba4";

const STATUS_STYLES = {
  confirmed: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-600",
};

// Compare only calendar date (ignore time)
function startOfDay(date) {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function Profile() {
  const [user, setUser] = useState(null);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cancelling, setCancelling] = useState(null); // booking _id being cancelled

  useEffect(() => {
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
      <div className="flex min-h-[60vh] items-center justify-center">
        <p className="text-slate-400 text-sm animate-pulse">Loading profile…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="rounded-xl bg-red-50 border border-red-200 px-6 py-8 text-red-700 text-sm">
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
    (b) => startOfDay(b.travelDate) === todayTs,
  );
  const upcomingBookings = bookings.filter(
    (b) => startOfDay(b.travelDate) >= tomorrowTs && b.status === "confirmed",
  );
  const pastBookings = bookings.filter(
    (b) => startOfDay(b.travelDate) < todayTs,
  );

  const confirmedCount = bookings.filter(
    (b) => b.status === "confirmed",
  ).length;
  const cancelledCount = bookings.filter(
    (b) => b.status === "cancelled",
  ).length;

  // ── Shared booking card renderer ─────────────────────────────────────────
  const BookingCard = ({ b, allowCancel = false }) => (
    <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div className="flex-1">
        <p className="font-semibold text-slate-800 text-sm">
          {b.route?.routeName || "Unknown Route"}
        </p>
        <p className="text-xs text-slate-500 mt-0.5">
          {b.route?.startLocation} → {b.route?.endLocation}
        </p>
        {b.boardingStop && (
          <p className="text-xs text-slate-400 mt-0.5">
            Boards at: {b.boardingStop.stopName}
          </p>
        )}
        {b.route?.startTime && (
          <p className="text-xs text-slate-400 mt-0.5">
            Departure: {b.route.startTime}
          </p>
        )}
      </div>
      <div className="flex flex-col sm:items-end gap-1.5">
        <span
          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${STATUS_STYLES[b.status] || "bg-slate-100 text-slate-600"}`}
        >
          {b.status}
        </span>
        <span className="text-xs text-slate-400">
          {new Date(b.travelDate).toLocaleDateString("en-US", {
            weekday: "short",
            year: "numeric",
            month: "short",
            day: "numeric",
          })}
        </span>
        <span className="text-xs font-mono text-slate-300">
          #{b._id.slice(-8).toUpperCase()}
        </span>
        {allowCancel && b.status === "confirmed" && (
          <button
            onClick={() => handleCancel(b._id)}
            disabled={cancelling === b._id}
            className="mt-1 px-3 py-1 rounded-lg text-xs font-semibold border border-red-300 text-red-600 bg-red-50 hover:bg-red-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-10 space-y-6">
      {/* ── Header Card ────────────────────────────────────────────────── */}
      <div className="rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-700 text-white p-8 flex flex-col sm:flex-row items-center gap-6 shadow-lg">
        <div className="flex-shrink-0 w-20 h-20 rounded-full bg-white/20 border-2 border-white/40 flex items-center justify-center text-3xl font-bold tracking-wide">
          {initials}
        </div>
        <div className="text-center sm:text-left">
          <h1 className="text-2xl font-bold">{user.name}</h1>
          <p className="text-indigo-200 text-sm mt-0.5">{user.email}</p>
          <div className="mt-2 flex flex-wrap justify-center sm:justify-start gap-2">
            <span className="inline-block px-3 py-0.5 rounded-full bg-white/20 text-xs font-semibold capitalize">
              {user.role}
            </span>
            <span
              className={`inline-block px-3 py-0.5 rounded-full text-xs font-semibold ${user.isActive ? "bg-green-400/30 text-green-100" : "bg-red-400/30 text-red-100"}`}
            >
              {user.isActive ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      </div>

      {/* ── Info & Stats Row ───────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Account Info
          </h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <span className="w-5 text-indigo-500">📧</span>
              <span className="text-slate-700">{user.email}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 text-indigo-500">📱</span>
              <span className="text-slate-700">{user.phoneNumber || "—"}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 text-indigo-500">🗓️</span>
              <span className="text-slate-700">Member since {memberSince}</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="w-5 text-indigo-500">🎓</span>
              <span className="text-slate-700 capitalize">{user.role}</span>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-4">
            Ride Summary
          </h2>
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Bookings</span>
              <span className="text-2xl font-bold text-indigo-700">
                {bookings.length}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Confirmed</span>
              <span className="text-lg font-semibold text-green-600">
                {confirmedCount}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Cancelled</span>
              <span className="text-lg font-semibold text-red-500">
                {cancelledCount}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Today's Rides ─────────────────────────────────────────────── */}
      <div className="rounded-2xl border border-yellow-200 bg-yellow-50 shadow-sm p-6">
        <h2 className="text-sm font-semibold text-yellow-700 uppercase tracking-wide mb-1 flex items-center gap-2">
          🚌 Today's Rides
        </h2>
        <p className="text-xs text-yellow-600 mb-4">
          Today's bookings cannot be cancelled.
        </p>
        {todayBookings.length === 0 ? (
          <EmptyState message="No rides scheduled for today." />
        ) : (
          <div className="space-y-3">
            {todayBookings.map((b) => (
              <BookingCard key={b._id} b={b} allowCancel={false} />
            ))}
          </div>
        )}
      </div>

      {/* ── Upcoming Bookings ─────────────────────────────────────────── */}
      <div className="rounded-2xl border border-blue-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-blue-700 uppercase tracking-wide mb-1 flex items-center gap-2">
          📅 Upcoming Bookings
        </h2>
        <p className="text-xs text-slate-400 mb-4">
          Tomorrow onwards · You can cancel these.
        </p>
        {upcomingBookings.length === 0 ? (
          <EmptyState message="No upcoming bookings." />
        ) : (
          <div className="space-y-3">
            {upcomingBookings.map((b) => (
              <BookingCard key={b._id} b={b} allowCancel={true} />
            ))}
          </div>
        )}
      </div>

      {/* ── Past Booking History ──────────────────────────────────────── */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
        <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide mb-1 flex items-center gap-2">
          🕙 Past Booking History
        </h2>
        <p className="text-xs text-slate-400 mb-4">All rides before today.</p>
        {pastBookings.length === 0 ? (
          <EmptyState message="No past bookings." />
        ) : (
          <div className="space-y-3">
            {pastBookings.map((b) => (
              <BookingCard key={b._id} b={b} allowCancel={false} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Profile;
