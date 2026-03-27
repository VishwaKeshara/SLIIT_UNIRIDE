import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:5000/api";

function getLoggedInUserId() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).id : null;
  } catch {
    return null;
  }
}

function BookRide() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const LOGGED_IN_USER_ID = getLoggedInUserId();
  const [routesLoading, setRoutesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    selectedRoute: "",
    boardingStop: "",
    travelDate: "",
    passengerName: "",
    mobileNumber: "",
    studentId: "",
    email: "",
  });

  // Fetch logged-in user profile and pre-fill form
  useEffect(() => {
    if (!LOGGED_IN_USER_ID) return;
    axios
      .get(`${API}/users/${LOGGED_IN_USER_ID}`)
      .then((res) => {
        const u = res.data;
        setLoggedInUser(u);
        setForm((prev) => ({
          ...prev,
          passengerName: u.name || "",
          mobileNumber: u.phoneNumber || "",
          email: u.email || "",
          studentId: u.studentId || "",
        }));
      })
      .catch(() => {
        // If user fetch fails, fall back to guest mode silently
        setLoggedInUser(null);
      });
  }, []);

  // Fetch active routes on mount
  useEffect(() => {
    axios
      .get(`${API}/routes/active`)
      .then((res) => setRoutes(res.data))
      .catch(() =>
        setError(
          "Failed to load routes. Please make sure the server is running.",
        ),
      )
      .finally(() => setRoutesLoading(false));
  }, []);

  // Fetch stops when selected route changes
  useEffect(() => {
    if (!form.selectedRoute) {
      setStops([]);
      return;
    }
    axios
      .get(`${API}/stops/route/${form.selectedRoute}`)
      .then((res) => setStops(res.data))
      .catch(() => setStops([]));
  }, [form.selectedRoute]);

  const selectedRouteObj = routes.find((r) => r._id === form.selectedRoute);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
      ...(name === "selectedRoute" ? { boardingStop: "" } : {}),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        passengerName: form.passengerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        isRegistered: !!loggedInUser,
        route: form.selectedRoute,
        travelDate: form.travelDate,
        ...(form.boardingStop ? { boardingStop: form.boardingStop } : {}),
        ...(form.email ? { email: form.email.trim() } : {}),
        ...(form.studentId ? { studentId: form.studentId.trim() } : {}),
      };
      const res = await axios.post(`${API}/bookings`, payload);
      setSuccess({ booking: res.data, routeObj: selectedRouteObj });
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setError(null);
    setForm((prev) => ({
      selectedRoute: "",
      boardingStop: "",
      travelDate: "",
      // Keep user details pre-filled if logged in
      passengerName: loggedInUser?.name || "",
      mobileNumber: loggedInUser?.phoneNumber || "",
      email: loggedInUser?.email || "",
      studentId: loggedInUser?.studentId || "",
    }));
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const { booking, routeObj } = success;
    const refId = booking._id?.slice(-8).toUpperCase();
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] flex items-center justify-center px-4 py-16 text-white">
        <div className="w-full max-w-lg rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-10 shadow-2xl text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Your seat has been reserved.
          </p>

          <div className="rounded-2xl bg-black/20 border border-white/10 p-5 text-left text-sm space-y-3">
            <p>
              <span className="font-semibold text-orange-400">
                Reference&nbsp;ID:
              </span>{" "}
              <span className="font-mono font-bold text-white">{refId}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Route:</span>{" "}
              <span className="text-slate-300">{routeObj?.routeName}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">From → To:</span>{" "}
              <span className="text-slate-300">
                {routeObj?.startLocation} → {routeObj?.endLocation}
              </span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">
                Travel Date:
              </span>{" "}
              <span className="text-slate-300">
                {new Date(booking.travelDate).toLocaleDateString()}
              </span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Passenger:</span>{" "}
              <span className="text-slate-300">{booking.passengerName}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Mobile:</span>{" "}
              <span className="text-slate-300">{booking.mobileNumber}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Status:</span>{" "}
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-semibold capitalize border border-emerald-400/30">
                {booking.status}
              </span>
            </p>
          </div>

          <button
            onClick={resetForm}
            className="mt-6 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
          >
            Book Another Ride
          </button>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const showTripDetails = !!form.selectedRoute;
  const showPassengerForm = !!(form.selectedRoute && form.travelDate);

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 lg:py-14">
        <div
          className={`flex gap-8 items-start ${loggedInUser ? "flex-col lg:flex-row" : ""}`}
        >
          <div
            className={
              loggedInUser ? "flex-1 min-w-0" : "w-full max-w-2xl mx-auto"
            }
          >
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400 font-bold mb-2">
              SLIIT-UniRide
            </p>
            <h1 className="text-3xl font-extrabold text-white mb-1">
              Book a Shuttle Ride
            </h1>
            <p className="text-slate-300 mb-8">
              Reserve your seat on an upcoming SLIIT-UniRide shuttle.
            </p>

            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── Section 1: Route ─────────────────────────────────────────────── */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                    1
                  </span>
                  Select Route
                </h2>

                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Active Route <span className="text-red-400">*</span>
                </label>
                {routesLoading ? (
                  <p className="text-sm text-slate-400">Loading routes…</p>
                ) : (
                  <select
                    name="selectedRoute"
                    value={form.selectedRoute}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm bg-[#0A2233] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Select a route --</option>
                    {routes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.routeName} &nbsp;({r.startLocation} → {r.endLocation}
                        )
                      </option>
                    ))}
                  </select>
                )}

                {selectedRouteObj && (
                  <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-slate-300 space-y-1">
                    <p>
                      <span className="font-medium text-orange-400">
                        Departure:
                      </span>{" "}
                      {selectedRouteObj.startTime}
                    </p>
                    <p>
                      <span className="font-medium text-orange-400">
                        Available Seats:
                      </span>{" "}
                      {selectedRouteObj.seatCapacity}
                    </p>
                    <p>
                      <span className="font-medium text-orange-400">
                        Schedule:
                      </span>{" "}
                      {selectedRouteObj.recurrence === "none"
                        ? "One-time"
                        : selectedRouteObj.recurrence === "daily"
                          ? "Daily"
                          : `Weekly (${selectedRouteObj.days?.join(", ")})`}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Section 2: Trip Details ──────────────────────────────────────── */}
              {showTripDetails && (
                <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                      2
                    </span>
                    Trip Details
                  </h2>

                  {stops.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Boarding Stop{" "}
                        <span className="text-slate-400">(optional)</span>
                      </label>
                      <select
                        name="boardingStop"
                        value={form.boardingStop}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm bg-[#0A2233] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">
                          -- Select your boarding stop --
                        </option>
                        {stops.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.order}. {s.stopName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-slate-300 mb-1">
                      Travel Date <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="date"
                      name="travelDate"
                      value={form.travelDate}
                      onChange={handleChange}
                      required
                      min={today}
                      className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                    />
                  </div>
                </div>
              )}

              {/* ── Section 3: Passenger Info ────────────────────────────────────── */}
              {showPassengerForm && (
                <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                      3
                    </span>
                    Passenger Details
                  </h2>

                  {/* ── Logged-in user banner ─────────────────────────────────── */}
                  {loggedInUser ? (
                    <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center text-sm font-bold">
                        {loggedInUser.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {loggedInUser.name}
                        </p>
                        <p className="text-xs text-orange-400">
                          Logged in · {loggedInUser.role}
                        </p>
                      </div>
                      <span className="ml-auto inline-block px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-semibold border border-emerald-400/30">
                        ✓ Registered
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
                      <span className="text-base">👤</span>
                      <span>
                        Booking as{" "}
                        <span className="font-semibold text-orange-400">
                          guest
                        </span>{" "}
                        — enter your details below. Your mobile number will be
                        used to track your rides.
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="passengerName"
                        value={form.passengerName}
                        onChange={handleChange}
                        required
                        readOnly={!!loggedInUser}
                        placeholder="Enter your full name"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          loggedInUser
                            ? "border-white/10 bg-black/20 text-slate-400 cursor-not-allowed"
                            : "border-white/20 bg-[#0A2233] text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        required
                        readOnly={!!loggedInUser}
                        placeholder="e.g. 0771234567"
                        pattern="[0-9+\-\s]{7,15}"
                        title="Enter a valid mobile number (7–15 digits)"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          loggedInUser
                            ? "border-white/10 bg-black/20 text-slate-400 cursor-not-allowed"
                            : "border-white/20 bg-[#0A2233] text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Email <span className="text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        readOnly={!!loggedInUser}
                        placeholder="student@sliit.lk"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          loggedInUser
                            ? "border-white/10 bg-black/20 text-slate-400 cursor-not-allowed"
                            : "border-white/20 bg-[#0A2233] text-white"
                        }`}
                      />
                    </div>

                    {/* Student ID — only shown for registered users */}
                    {loggedInUser && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Student ID{" "}
                          <span className="text-slate-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={form.studentId}
                          onChange={handleChange}
                          placeholder="e.g. IT22000000"
                          className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Submit ───────────────────────────────────────────────────────── */}
              {showPassengerForm && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  {submitting ? "Confirming…" : "Confirm Booking"}
                </button>
              )}
            </form>
          </div>

          {/* ── Profile Side Panel ──────────────────────────────────────────────── */}
          {loggedInUser && (
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6 sticky top-24">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-[0.2em] mb-4">
                  Your Profile
                </h3>

                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {loggedInUser.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base leading-tight">
                      {loggedInUser.name}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold capitalize border border-orange-500/30">
                      {loggedInUser.role}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm text-slate-300 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">
                      Email
                    </p>
                    <p className="truncate">{loggedInUser.email}</p>
                  </div>
                  {loggedInUser.phoneNumber && (
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">
                        Mobile
                      </p>
                      <p>{loggedInUser.phoneNumber}</p>
                    </div>
                  )}
                </div>

                {/* View Profile Link */}
                <Link
                  to="/profile"
                  className="mt-5 block w-full text-center py-2.5 rounded-xl border border-orange-500/50 text-orange-400 text-sm font-semibold hover:bg-orange-500/10 transition-colors"
                >
                  View Full Profile →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookRide;
