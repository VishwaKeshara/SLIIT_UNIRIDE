import React, { useState, useEffect } from "react";
import axios from "axios";

const API = "http://localhost:5000/api";

// Simulated auth — replace with real session/token when login is implemented
// Set to null to simulate a guest user
const LOGGED_IN_USER_ID = "69c549d0c8831d40e9fd3ba4";
// const LOGGED_IN_USER_ID = null;

function BookRide() {
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
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
      <div className="max-w-lg mx-auto px-4 py-16 text-center">
        <div className="rounded-2xl bg-green-50 border border-green-200 p-10 shadow-sm">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-bold text-green-800 mb-1">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-green-700 mb-4">
            Your seat has been reserved.
          </p>

          <div className="rounded-xl bg-white border border-green-100 p-4 text-left text-sm space-y-2 shadow-sm">
            <p>
              <span className="font-semibold text-slate-600">
                Reference&nbsp;ID:
              </span>{" "}
              <span className="font-mono font-bold text-slate-900">
                {refId}
              </span>
            </p>
            <p>
              <span className="font-semibold text-slate-600">Route:</span>{" "}
              {routeObj?.routeName}
            </p>
            <p>
              <span className="font-semibold text-slate-600">From → To:</span>{" "}
              {routeObj?.startLocation} → {routeObj?.endLocation}
            </p>
            <p>
              <span className="font-semibold text-slate-600">Travel Date:</span>{" "}
              {new Date(booking.travelDate).toLocaleDateString()}
            </p>
            <p>
              <span className="font-semibold text-slate-600">Passenger:</span>{" "}
              {booking.passengerName}
            </p>
            <p>
              <span className="font-semibold text-slate-600">Mobile:</span>{" "}
              {booking.mobileNumber}
            </p>
            <p>
              <span className="font-semibold text-slate-600">Status:</span>{" "}
              <span className="inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold capitalize">
                {booking.status}
              </span>
            </p>
          </div>

          <button
            onClick={resetForm}
            className="mt-6 px-6 py-2 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 transition-colors"
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
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10">
      <h1 className="text-3xl font-bold text-slate-900 mb-1">
        Book a Shuttle Ride
      </h1>
      <p className="text-slate-500 mb-8">
        Reserve your seat on an upcoming SLIIT-UniRide shuttle.
      </p>

      {error && (
        <div className="mb-5 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* ── Section 1: Route ─────────────────────────────────────────────── */}
        <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
          <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
            <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
              1
            </span>
            Select Route
          </h2>

          <label className="block text-sm font-medium text-slate-700 mb-1">
            Active Route <span className="text-red-500">*</span>
          </label>
          {routesLoading ? (
            <p className="text-sm text-slate-400">Loading routes…</p>
          ) : (
            <select
              name="selectedRoute"
              value={form.selectedRoute}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">-- Select a route --</option>
              {routes.map((r) => (
                <option key={r._id} value={r._id}>
                  {r.routeName} &nbsp;({r.startLocation} → {r.endLocation})
                </option>
              ))}
            </select>
          )}

          {selectedRouteObj && (
            <div className="mt-4 rounded-xl bg-blue-50 border border-blue-100 p-4 text-sm text-slate-700 space-y-1">
              <p>
                <span className="font-medium">Departure:</span>{" "}
                {selectedRouteObj.startTime}
              </p>
              <p>
                <span className="font-medium">Seat Capacity:</span>{" "}
                {selectedRouteObj.seatCapacity}
              </p>
              <p>
                <span className="font-medium">Schedule:</span>{" "}
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
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                2
              </span>
              Trip Details
            </h2>

            {stops.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Boarding Stop{" "}
                  <span className="text-slate-400">(optional)</span>
                </label>
                <select
                  name="boardingStop"
                  value={form.boardingStop}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- Select your boarding stop --</option>
                  {stops.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.order}. {s.stopName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">
                Travel Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="travelDate"
                value={form.travelDate}
                onChange={handleChange}
                required
                min={today}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        )}

        {/* ── Section 3: Passenger Info ────────────────────────────────────── */}
        {showPassengerForm && (
          <div className="rounded-2xl border border-slate-200 bg-white shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold">
                3
              </span>
              Passenger Details
            </h2>

            {/* ── Logged-in user banner ─────────────────────────────────── */}
            {loggedInUser ? (
              <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-indigo-50 border border-indigo-200">
                <div className="flex-shrink-0 w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center text-sm font-bold">
                  {loggedInUser.name.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-indigo-900">
                    {loggedInUser.name}
                  </p>
                  <p className="text-xs text-indigo-600">
                    Logged in · {loggedInUser.role}
                  </p>
                </div>
                <span className="ml-auto inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold">
                  ✓ Registered
                </span>
              </div>
            ) : (
              <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-sm">
                <span className="text-base">👤</span>
                <span>
                  Booking as <span className="font-semibold">guest</span> —
                  enter your details below. Your mobile number will be used to
                  track your rides.
                </span>
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Full Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="passengerName"
                  value={form.passengerName}
                  onChange={handleChange}
                  required
                  readOnly={!!loggedInUser}
                  placeholder="Enter your full name"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loggedInUser
                      ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Mobile Number <span className="text-red-500">*</span>
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
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loggedInUser
                      ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white"
                  }`}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-slate-400">(optional)</span>
                </label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  readOnly={!!loggedInUser}
                  placeholder="student@sliit.lk"
                  className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    loggedInUser
                      ? "border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                      : "border-slate-300 bg-white"
                  }`}
                />
              </div>

              {/* Student ID — only shown for registered users */}
              {loggedInUser && (
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Student ID{" "}
                    <span className="text-slate-400">(optional)</span>
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    placeholder="e.g. IT22000000"
                    className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
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
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-semibold rounded-xl transition-colors text-sm"
          >
            {submitting ? "Confirming…" : "Confirm Booking"}
          </button>
        )}
      </form>
    </div>
  );
}

export default BookRide;
