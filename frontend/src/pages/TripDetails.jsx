import React, { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaEdit, FaRoute, FaUser, FaCalendarAlt, FaClock, FaBus, FaExclamationTriangle } from "react-icons/fa";
import { getTrip } from "../api/tripApi";

const statusStyles = {
  Scheduled: "bg-blue-100 text-blue-700 border-blue-200",
  Ongoing:   "bg-yellow-100 text-yellow-700 border-yellow-200",
  Completed: "bg-green-100 text-green-700 border-green-200",
  Delayed:   "bg-red-100 text-red-700 border-red-200",
};

function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    getTrip(id)
      .then((res) => setTrip(res.data))
      .catch(() => setError("Failed to load trip details."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
    </div>
  );

  if (error || !trip) return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-slate-50 gap-4">
      <p className="text-red-600 font-medium">{error || "Trip not found."}</p>
      <button onClick={() => navigate("/trips")} className="text-sm text-yellow-600 underline">← Back to Trips</button>
    </div>
  );

  const driver = trip.driver;

  return (
    <section className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <button onClick={() => navigate("/trips")} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <FaArrowLeft /> Back to Trips
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-md">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div>
              <p className="text-sm uppercase tracking-widest text-yellow-600">Trip Details</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900">{trip.route}</h1>
            </div>
            <span className={`rounded-full border px-3 py-1 text-sm font-semibold ${statusStyles[trip.status] || "bg-slate-100 text-slate-600"}`}>
              {trip.status}
            </span>
          </div>

          {/* Info grid */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <InfoCard icon={<FaUser className="text-yellow-500" />} label="Driver" value={driver?.name || "N/A"} />
            <InfoCard icon={<FaBus className="text-yellow-500" />} label="Bus Number" value={driver?.assignedBus || "N/A"} />
            <InfoCard icon={<FaRoute className="text-yellow-500" />} label="Route" value={trip.route} />
            <InfoCard icon={<FaCalendarAlt className="text-yellow-500" />} label="Date" value={trip.date} />
            <InfoCard icon={<FaClock className="text-yellow-500" />} label="Start Time" value={trip.startTime} />
            <InfoCard icon={<FaClock className="text-yellow-500" />} label="End Time" value={trip.endTime} />
            <InfoCard icon={<FaUser className="text-yellow-500" />} label="Passengers" value={trip.passengers ?? "—"} />
          </div>

          {/* Delay reason */}
          {trip.status === "Delayed" && trip.delayReason && (
            <div className="mt-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 flex items-start gap-2">
              <FaExclamationTriangle className="text-red-500 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-700">Delay Reason</p>
                <p className="text-sm text-red-600 mt-0.5">{trip.delayReason}</p>
              </div>
            </div>
          )}

          {/* Timestamps */}
          <div className="mt-6 border-t border-slate-100 pt-4 text-xs text-slate-400 space-y-1">
            <p>Created: {new Date(trip.createdAt).toLocaleString()}</p>
            <p>Last Updated: {new Date(trip.updatedAt).toLocaleString()}</p>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Link to={`/trips/edit/${trip._id}`}
              className="inline-flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-yellow-600 transition">
              <FaEdit /> Edit Trip
            </Link>
            <button onClick={() => navigate("/trips")}
              className="rounded-xl border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
              Close
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}

function InfoCard({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-100 bg-slate-50 p-4">
      <span className="text-lg">{icon}</span>
      <div>
        <p className="text-xs text-slate-400 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-slate-800 mt-0.5">{value}</p>
      </div>
    </div>
  );
}

export default TripDetails;
