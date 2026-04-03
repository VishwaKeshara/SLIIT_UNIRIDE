import React, { useEffect, useState } from "react";
import { FaPlay, FaStop, FaExclamationTriangle, FaSync, FaBus, FaRoute, FaCalendarAlt, FaClock, FaUser } from "react-icons/fa";
import { getTrips, updateTripStatus } from "../api/tripApi";

const statusStyles = {
  Scheduled: "bg-blue-100 text-blue-700",
  Ongoing:   "bg-yellow-100 text-yellow-800",
  Completed: "bg-green-100 text-green-700",
  Delayed:   "bg-red-100 text-red-700",
};

function DriverDashboard() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [msg, setMsg] = useState("");
  const [delayModal, setDelayModal] = useState(null); // { tripId }
  const [delayReason, setDelayReason] = useState("");
  const [delayError, setDelayError] = useState("");
  const [updating, setUpdating] = useState(false);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      const res = await getTrips();
      // Show non-completed trips for demo purposes
      setTrips(res.data.filter((t) => t.status !== "Completed").concat(
        res.data.filter((t) => t.status === "Completed").slice(0, 3)
      ));
    } catch {
      setError("Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, []);

  const flash = (message) => {
    setMsg(message);
    setTimeout(() => setMsg(""), 3500);
  };

  const handleStatusChange = async (tripId, status, reason = "") => {
    setUpdating(true);
    try {
      const res = await updateTripStatus(tripId, { status, delayReason: reason });
      setTrips((prev) => prev.map((t) => t._id === tripId ? { ...t, status: res.data.status, delayReason: res.data.delayReason } : t));
      flash(`Trip status updated to "${status}".`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to update trip status.");
      setTimeout(() => setError(""), 4000);
    } finally {
      setUpdating(false);
    }
  };

  const handleDelay = async () => {
    if (!delayReason.trim()) { setDelayError("Delay reason is required."); return; }
    await handleStatusChange(delayModal, "Delayed", delayReason);
    setDelayModal(null);
    setDelayReason("");
    setDelayError("");
  };

  return (
    <section className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* Header */}
        <div className="rounded-3xl bg-white p-8 shadow-md flex items-start justify-between flex-wrap gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-yellow-600">Driver Portal</p>
            <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Driver Dashboard</h1>
            <p className="mt-2 text-slate-600 max-w-2xl">
              View your assigned trips and update their status. Use the action buttons to start, complete, or report a delay.
            </p>
          </div>
          <button onClick={fetchTrips} disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition">
            <FaSync className={loading ? "animate-spin" : ""} /> Refresh
          </button>
        </div>

        {/* Messages */}
        {msg && <div className="mt-4 rounded-xl bg-green-50 border border-green-200 px-4 py-3 text-green-700 text-sm font-medium">✓ {msg}</div>}
        {error && <div className="mt-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-red-700 text-sm font-medium">✗ {error}</div>}

        {/* Loading */}
        {loading && (
          <div className="mt-10 flex justify-center">
            <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
          </div>
        )}

        {!loading && trips.length === 0 && (
          <div className="mt-12 text-center text-slate-500">No active trips assigned. Check back later.</div>
        )}

        {!loading && trips.length > 0 && (
          <div className="mt-8 space-y-5">
            {trips.map((trip) => (
              <div key={trip._id} className="rounded-2xl bg-white p-6 shadow-md transition hover:shadow-lg">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  {/* Trip info */}
                  <div className="flex-1 min-w-[200px]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-lg font-bold text-slate-900">{trip.route}</h2>
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusStyles[trip.status]}`}>
                        {trip.status}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-600">
                      <span className="flex items-center gap-1.5"><FaUser className="text-yellow-500" /> {trip.driver?.name || "—"}</span>
                      <span className="flex items-center gap-1.5"><FaBus className="text-yellow-500" /> {trip.driver?.assignedBus || "—"}</span>
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-yellow-500" /> {trip.date}</span>
                      <span className="flex items-center gap-1.5"><FaClock className="text-yellow-500" /> {trip.startTime} – {trip.endTime}</span>
                    </div>
                    {trip.delayReason && (
                      <p className="mt-2 text-xs text-red-600 bg-red-50 rounded-lg px-2 py-1 inline-block">⚠ {trip.delayReason}</p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap gap-2 items-center">
                    {trip.status === "Scheduled" && (
                      <button
                        onClick={() => handleStatusChange(trip._id, "Ongoing")}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50 transition shadow"
                      >
                        <FaPlay /> Start Trip
                      </button>
                    )}
                    {trip.status === "Ongoing" && (
                      <button
                        onClick={() => handleStatusChange(trip._id, "Completed")}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-xl bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 disabled:opacity-50 transition shadow"
                      >
                        <FaStop /> End Trip
                      </button>
                    )}
                    {(trip.status === "Scheduled" || trip.status === "Ongoing") && (
                      <button
                        onClick={() => { setDelayModal(trip._id); setDelayReason(""); setDelayError(""); }}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2 text-sm font-semibold text-white hover:bg-red-600 disabled:opacity-50 transition shadow"
                      >
                        <FaExclamationTriangle /> Report Delay
                      </button>
                    )}
                    {trip.status === "Completed" && (
                      <span className="text-sm text-green-600 font-semibold">✓ Completed</span>
                    )}
                    {trip.status === "Delayed" && (
                      <button
                        onClick={() => handleStatusChange(trip._id, "Ongoing")}
                        disabled={updating}
                        className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:bg-yellow-600 disabled:opacity-50 transition"
                      >
                        <FaPlay /> Resume Trip
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delay Reason Modal */}
      {delayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-1">Report Delay</h2>
            <p className="text-sm text-slate-500 mb-5">Please provide a reason for the delay. This will be saved to the trip record.</p>
            <textarea
              rows={3}
              value={delayReason}
              onChange={(e) => { setDelayReason(e.target.value); setDelayError(""); }}
              placeholder="e.g. Heavy traffic on Malabe road, accident ahead..."
              className={`w-full rounded-xl border px-4 py-3 text-sm outline-none transition focus:ring-2 focus:ring-red-400 resize-none ${delayError ? "border-red-400 bg-red-50" : "border-slate-300"}`}
            />
            {delayError && <p className="mt-1 text-xs text-red-600">{delayError}</p>}
            <div className="mt-4 flex gap-3">
              <button onClick={handleDelay} disabled={updating}
                className="flex-1 rounded-xl bg-red-500 py-2.5 text-sm font-bold text-white hover:bg-red-600 disabled:opacity-60 transition">
                {updating ? "Saving..." : "Confirm Delay"}
              </button>
              <button onClick={() => setDelayModal(null)}
                className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

export default DriverDashboard;
