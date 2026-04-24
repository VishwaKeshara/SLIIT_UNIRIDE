import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaPlus, FaEdit, FaTrash, FaEye, FaBus, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import { getTrips, deleteTrip } from "../api/tripApi";
import axios from "../axiosinstance";

const statusStyles = {
  Scheduled: "bg-blue-100 text-blue-700",
  Ongoing:   "bg-yellow-100 text-yellow-700",
  Completed: "bg-green-100 text-green-700",
  Delayed:   "bg-red-100 text-red-700",
};

function Trips() {
  const navigate = useNavigate();
  const sessionUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "null");
    } catch {
      return null;
    }
  }, []);
  const isManagementView = sessionUser?.role === "driver";
  const [trips, setTrips] = useState([]);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await getTrips();
      setTrips(res.data);
    } catch {
      setError("Failed to load trips. Please ensure the server is running.");
    } finally {
      setLoading(false);
    }
  };

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/users/${sessionUser.id}/bookings`);
      setBookings(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to load your trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!sessionUser?.id) {
      navigate("/login", { state: { from: "/trips" } });
      return;
    }

    if (isManagementView) {
      fetchTrips();
      return;
    }

    fetchBookings();
  }, [isManagementView, navigate, sessionUser?.id]);

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      setMsg("Trip deleted successfully.");
      setTrips((prev) => prev.filter((t) => t._id !== id));
      setTimeout(() => setMsg(""), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete trip.");
      setTimeout(() => setError(""), 4000);
    }
  };

  if (!sessionUser?.id) {
    return null;
  }

  if (!isManagementView) {
    return (
      <section className="min-h-screen bg-slate-50 pb-16">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
          <div className="rounded-3xl bg-white p-8 shadow-md md:p-10">
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-600">My Trips</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">
              Your Related Trips
            </h1>
            <p className="mt-3 max-w-3xl text-slate-600">
              View the rides and bookings connected to your account. Students and lecturers can only see their own trip records here.
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Link
                to="/book"
                className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-yellow-600 transition"
              >
                <FaPlus /> Book Ride
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                <FaUser /> Profile
              </Link>
            </div>
          </div>

          {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">{error}</div>}

          {loading && (
            <div className="mt-10 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
            </div>
          )}

          {!loading && bookings.length === 0 && !error && (
            <div className="mt-12 rounded-3xl bg-white p-10 text-center text-slate-500 shadow-md">
              No related trips found for your account yet.
            </div>
          )}

          {!loading && bookings.length > 0 && (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {bookings.map((booking) => (
                <article key={booking._id} className="flex flex-col rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Booking</span>
                    <span className="rounded-full px-2.5 py-0.5 text-xs font-semibold bg-blue-100 text-blue-700">
                      {booking.status || "confirmed"}
                    </span>
                  </div>

                  <h2 className="text-lg font-bold text-slate-900 leading-snug">
                    {booking.route?.routeName || "Campus Shuttle Ride"}
                  </h2>

                  <div className="mt-3 space-y-2 text-sm text-slate-600 flex-1">
                    <p className="flex items-center gap-2">
                      <FaBus className="text-yellow-500 shrink-0" />
                      {booking.route?.startLocation || "Start"} to {booking.route?.endLocation || "Destination"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaCalendarAlt className="text-yellow-500 shrink-0" />
                      {new Date(booking.travelStartDate).toLocaleDateString()} - {new Date(booking.travelEndDate).toLocaleDateString()}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaClock className="text-yellow-500 shrink-0" />
                      Payment: {booking.paymentStatus || "pending"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaUser className="text-yellow-500 shrink-0" />
                      {booking.passengerName}
                    </p>
                  </div>

                  <div className="mt-4 rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
                    Total: LKR {Number(booking.totalAmount || 0).toLocaleString()}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    );
  }

  return (
    <section className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="rounded-3xl bg-white p-8 shadow-md md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-yellow-600">Management</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Trip Management</h1>
          <p className="mt-3 max-w-3xl text-slate-600">Create, view, and manage all shuttle trips. Track statuses and assign drivers.</p>
          <div className="mt-6 flex gap-3 flex-wrap">
            <Link to="/trips/add"
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-yellow-600 transition">
              <FaPlus /> Create Trip
            </Link>
            <Link to="/driver-portal"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition">
              <FaBus /> Driver Portal
            </Link>
          </div>
        </div>

        {msg && <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">✓ {msg}</div>}
        {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">✗ {error}</div>}

        {loading && (
          <div className="mt-10 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          </div>
        )}

        {!loading && trips.length === 0 && !error && (
          <div className="mt-12 text-center text-slate-500">No trips found. Click <strong>Create Trip</strong> to get started.</div>
        )}

        {!loading && trips.length > 0 && (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            {trips.map((trip) => (
              <article key={trip._id} className="flex flex-col rounded-2xl bg-white p-6 shadow-md transition hover:-translate-y-1 hover:shadow-lg">
                <div className="flex items-start justify-between mb-3">
                  <span className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Trip</span>
                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[trip.status] || "bg-slate-100 text-slate-600"}`}>
                    {trip.status}
                  </span>
                </div>

                <h2 className="text-lg font-bold text-slate-900 leading-snug">{trip.route}</h2>

                <div className="mt-3 space-y-2 text-sm text-slate-600 flex-1">
                  <p className="flex items-center gap-2"><FaUser className="text-yellow-500 shrink-0" />
                    {trip.driver?.name || "—"}
                    <span className="text-slate-400 text-xs">({trip.driver?.assignedBus || ""})</span>
                  </p>
                  <p className="flex items-center gap-2"><FaCalendarAlt className="text-yellow-500 shrink-0" /> {trip.date}</p>
                  <p className="flex items-center gap-2"><FaClock className="text-yellow-500 shrink-0" /> {trip.startTime} – {trip.endTime}</p>
                  {trip.delayReason && (
                    <p className="text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1 mt-1">⚠ {trip.delayReason}</p>
                  )}
                </div>

                <div className="mt-4 flex gap-2">
                  <button onClick={() => navigate(`/trips/${trip._id}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-slate-300 bg-slate-50 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-100 transition">
                    <FaEye /> Details
                  </button>
                  <button onClick={() => navigate(`/trips/edit/${trip._id}`)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-yellow-400 bg-yellow-50 py-1.5 text-xs font-semibold text-yellow-700 hover:bg-yellow-100 transition">
                    <FaEdit /> Edit
                  </button>
                  <button onClick={() => handleDelete(trip._id)}
                    className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border border-red-300 bg-red-50 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-100 transition">
                    <FaTrash /> Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

export default Trips;
