import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "../axiosinstance";
import { FaSearch } from "react-icons/fa";

const statusBadgeClasses = {
  Scheduled: "bg-[#fff3dc] text-[#d08a00]",
  Ongoing: "bg-[#e8eefb] text-[#0a3772]",
  Completed: "bg-[#dff7ec] text-[#049b63]",
  Delayed: "bg-[#ffe3e1] text-[#ef534f]",
};

function TripMonitoring() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [delayModalTrip, setDelayModalTrip] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [delayError, setDelayError] = useState("");
  const [updatingTripId, setUpdatingTripId] = useState("");

  useEffect(() => {
    fetchTrips();
  }, []);

  const fetchTrips = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await axios.get("/trips");
      setTrips(res.data);
    } catch (fetchError) {
      setError(fetchError.response?.data?.message || "Failed to load trips.");
    } finally {
      setLoading(false);
    }
  };

  const updateTripStatus = async (tripId, status, customDelayReason = "") => {
    try {
      setUpdatingTripId(tripId);
      setError("");
      setSuccessMessage("");

      const res = await axios.patch(`/trips/${tripId}/status`, {
        status,
        delayReason: customDelayReason,
      });

      setTrips((currentTrips) =>
        currentTrips.map((trip) => (trip._id === tripId ? res.data : trip))
      );
      setSuccessMessage(`Trip updated to ${status}.`);
    } catch (updateError) {
      setError(
        updateError.response?.data?.message || "Failed to update trip status."
      );
    } finally {
      setUpdatingTripId("");
    }
  };

  const handleDelete = async (tripId) => {
    if (!window.confirm("Delete this trip?")) return;

    try {
      setError("");
      setSuccessMessage("");
      await axios.delete(`/trips/${tripId}`);
      setTrips((currentTrips) =>
        currentTrips.filter((trip) => trip._id !== tripId)
      );
      setSuccessMessage("Trip deleted successfully.");
    } catch (deleteError) {
      setError(
        deleteError.response?.data?.message || "Failed to delete trip."
      );
    }
  };

  const handleConfirmDelay = async () => {
    if (!delayReason.trim()) {
      setDelayError("Delay reason is required.");
      return;
    }

    await updateTripStatus(delayModalTrip._id, "Delayed", delayReason.trim());
    setDelayModalTrip(null);
    setDelayReason("");
    setDelayError("");
  };

  const today = new Date().toISOString().slice(0, 10);

  const filteredTrips = useMemo(() => {
    return trips.filter((trip) => {
      const search = searchTerm.trim().toLowerCase();
      const searchableText = [
        trip.route,
        trip.driver?.name,
        trip.driver?.assignedBus,
        trip.driver?.licenseNumber,
        trip.date,
        trip.startTime,
        trip.endTime,
        trip.status,
        trip.delayReason,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search ? searchableText.includes(search) : true;
      const matchesStatus =
        statusFilter === "all" ? true : trip.status === statusFilter;

      const matchesDate =
        dateFilter === "all"
          ? true
          : dateFilter === "today"
            ? trip.date === today
            : dateFilter === "upcoming"
              ? trip.date >= today
              : trip.date < today;

      return matchesSearch && matchesStatus && matchesDate;
    });
  }, [trips, searchTerm, statusFilter, dateFilter, today]);

  const delayedTrips = filteredTrips.filter((trip) => trip.status === "Delayed");

  const statCards = [
    { label: "Total Trips", value: trips.length },
    {
      label: "Scheduled",
      value: trips.filter((trip) => trip.status === "Scheduled").length,
    },
    {
      label: "Ongoing",
      value: trips.filter((trip) => trip.status === "Ongoing").length,
    },
    {
      label: "Delayed",
      value: trips.filter((trip) => trip.status === "Delayed").length,
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              Trip Monitoring
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[#5c79a8] sm:text-lg">
              Track live trip operations, review delays, and update shuttle
              statuses from one monitoring workspace.
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/admin/dashboard"
              className="rounded-3xl bg-[#e8eefb] px-7 py-4 text-lg font-extrabold text-[#0a3772] shadow-sm transition hover:opacity-90"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/routes"
              className="rounded-3xl bg-[#ffbf00] px-7 py-4 text-lg font-extrabold text-[#111827] shadow-sm transition hover:opacity-90"
            >
              Route Oversight
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-4">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]"
            >
              <p className="text-[1.05rem] font-bold text-[#5c79a8]">
                {card.label}
              </p>
              <h2 className="mt-5 text-5xl font-extrabold text-[#0b2f67]">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
              Filter Trips
            </h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
              Live Control
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c79a8]" />
                <input
                  type="text"
                  placeholder="Search route, driver, bus, date, or reason"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] py-3 pl-11 pr-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              >
                <option value="all">All Status</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Ongoing">Ongoing</option>
                <option value="Delayed">Delayed</option>
                <option value="Completed">Completed</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Date Scope
              </label>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              >
                <option value="all">All Dates</option>
                <option value="today">Today</option>
                <option value="upcoming">Today & Upcoming</option>
                <option value="past">Past Trips</option>
              </select>
            </div>
          </div>
        </section>

        {!loading && delayedTrips.length > 0 && (
          <section className="mb-8 rounded-[34px] border border-[#ffd2cf] bg-white p-7 shadow-[0_18px_45px_rgba(239,83,79,0.12)]">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                Delay Alerts
              </h3>
              <span className="rounded-full bg-[#ffe3e1] px-5 py-2 text-lg font-bold text-[#ef534f]">
                {delayedTrips.length} Active
              </span>
            </div>

            <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
              {delayedTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="rounded-[24px] border border-[#ffd2cf] bg-[#fff7f6] p-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h4 className="text-xl font-extrabold text-[#0b1f45]">
                        {trip.route}
                      </h4>
                      <p className="mt-1 text-base text-[#617ba4]">
                        Driver: {trip.driver?.name || "Unassigned"}
                      </p>
                    </div>
                    <span className="inline-flex rounded-full bg-[#ffe3e1] px-4 py-2 text-sm font-extrabold text-[#ef534f]">
                      Delayed
                    </span>
                  </div>
                  <p className="mt-4 text-sm font-bold text-[#ef534f]">
                    {trip.delayReason || "Delay reason pending"}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
              Trip Records
            </h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
              {filteredTrips.length} Results
            </span>
          </div>

          {successMessage && (
            <div className="mb-5 rounded-[20px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
              {successMessage}
            </div>
          )}

          {error && (
            <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {error}
            </div>
          )}

          {loading ? (
            <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">
              Loading trips...
            </div>
          ) : filteredTrips.length === 0 ? (
            <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">
              No trips found
            </div>
          ) : (
            <div className="space-y-5">
              {filteredTrips.map((trip) => (
                <div
                  key={trip._id}
                  className="rounded-[24px] border border-blue-100 bg-[#f7faff] p-5"
                >
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    <div className="flex-1">
                      <div className="mb-4 flex flex-wrap items-center gap-3">
                        <h4 className="text-2xl font-extrabold text-[#0b1f45]">
                          {trip.route}
                        </h4>
                        <span
                          className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${
                            statusBadgeClasses[trip.status] ||
                            "bg-slate-200 text-slate-600"
                          }`}
                        >
                          {trip.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                        <div className="rounded-[18px] bg-white px-4 py-4">
                          <p className="text-sm font-bold text-[#5c79a8]">
                            Driver
                          </p>
                          <p className="mt-2 text-base font-extrabold text-[#0b1f45]">
                            {trip.driver?.name || "Unassigned"}
                          </p>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-4">
                          <p className="text-sm font-bold text-[#5c79a8]">
                            Bus
                          </p>
                          <p className="mt-2 text-base font-extrabold text-[#0b1f45]">
                            {trip.driver?.assignedBus || "-"}
                          </p>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-4">
                          <p className="text-sm font-bold text-[#5c79a8]">
                            Schedule
                          </p>
                          <p className="mt-2 text-base font-extrabold text-[#0b1f45]">
                            {trip.date}
                          </p>
                          <p className="mt-1 text-sm text-[#617ba4]">
                            {trip.startTime} - {trip.endTime}
                          </p>
                        </div>

                        <div className="rounded-[18px] bg-white px-4 py-4">
                          <p className="text-sm font-bold text-[#5c79a8]">
                            Passengers
                          </p>
                          <p className="mt-2 text-base font-extrabold text-[#0b1f45]">
                            {trip.passengers ?? 0}
                          </p>
                        </div>
                      </div>

                      {trip.delayReason && (
                        <div className="mt-4 rounded-[18px] bg-[#fff4f3] px-4 py-4 text-sm font-bold text-[#ef534f]">
                          Delay Reason: {trip.delayReason}
                        </div>
                      )}
                    </div>

                    <div className="flex min-w-[220px] flex-col gap-3">
                      <Link
                        to={`/trips/${trip._id}`}
                        className="rounded-[18px] bg-[#e8eefb] px-5 py-3 text-center text-sm font-extrabold text-[#0a3772] transition hover:opacity-90"
                      >
                        View Details
                      </Link>

                      {trip.status !== "Ongoing" && (
                        <button
                          type="button"
                          onClick={() => updateTripStatus(trip._id, "Ongoing")}
                          disabled={updatingTripId === trip._id}
                          className="rounded-[18px] bg-[#143d7a] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Ongoing
                        </button>
                      )}

                      {trip.status !== "Completed" && (
                        <button
                          type="button"
                          onClick={() =>
                            updateTripStatus(trip._id, "Completed")
                          }
                          disabled={updatingTripId === trip._id}
                          className="rounded-[18px] bg-[#dff7ec] px-5 py-3 text-sm font-extrabold text-[#049b63] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Mark Completed
                        </button>
                      )}

                      {trip.status !== "Delayed" && (
                        <button
                          type="button"
                          onClick={() => {
                            setDelayModalTrip(trip);
                            setDelayReason(trip.delayReason || "");
                            setDelayError("");
                          }}
                          disabled={updatingTripId === trip._id}
                          className="rounded-[18px] bg-[#ffe3e1] px-5 py-3 text-sm font-extrabold text-[#ef534f] transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          Report Delay
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleDelete(trip._id)}
                        disabled={updatingTripId === trip._id}
                        className="rounded-[18px] bg-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        Delete Trip
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>

      {delayModalTrip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f45]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[30px] bg-white p-8 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-[#0b2f67]">
              Report Delay
            </h2>
            <p className="mt-3 text-base text-[#5c79a8]">
              Add a short reason for the delay on{" "}
              <span className="font-extrabold text-[#0b1f45]">
                {delayModalTrip.route}
              </span>
              .
            </p>

            <textarea
              rows="5"
              value={delayReason}
              onChange={(e) => {
                setDelayReason(e.target.value);
                setDelayError("");
              }}
              placeholder="Enter delay reason"
              className="mt-6 w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
            />

            {delayError && (
              <p className="mt-2 text-sm font-bold text-[#ef534f]">
                {delayError}
              </p>
            )}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={handleConfirmDelay}
                disabled={updatingTripId === delayModalTrip._id}
                className="flex-1 rounded-[18px] bg-[#ef534f] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Save Delay
              </button>
              <button
                type="button"
                onClick={() => setDelayModalTrip(null)}
                className="rounded-[18px] bg-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:opacity-90"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TripMonitoring;
