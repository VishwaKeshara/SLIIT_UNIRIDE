import React, { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { FaBus, FaIdBadge, FaPhoneAlt, FaRoute, FaSearch, FaSync, FaUser } from "react-icons/fa";
import { getDrivers } from "../api/driverApi";
import Drivers from "./Drivers";

const statusStyles = {
  Available: "border border-emerald-300/60 bg-emerald-50/85 text-emerald-700",
  "On Trip": "border border-cyan-300/60 bg-cyan-50/85 text-cyan-700",
};

function DriverListPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const currentUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("userData") || "null");
    } catch {
      return null;
    }
  }, []);
  const [drivers, setDrivers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    if (!localStorage.getItem("token")) {
      navigate("/login", { state: { from: location.pathname } });
    }
  }, [location.pathname, navigate]);

  const loadDrivers = async () => {
    try {
      setLoading(true);
      setError("");
      const response = await getDrivers();
      setDrivers(response.data);
    } catch {
      setError("Failed to load drivers.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDrivers();
  }, []);

  const filteredDrivers = useMemo(() => {
    const query = searchTerm.trim().toLowerCase();

    if (!query) {
      return drivers;
    }

    return drivers.filter((driver) =>
      [
        driver.name,
        driver.licenseNumber,
        driver.contactNumber,
        driver.assignedBus,
        driver.route,
        driver.shift,
        driver.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [drivers, searchTerm]);

  if (!localStorage.getItem("token")) {
    return null;
  }

  if (currentUser?.role === "driver") {
    return <Drivers />;
  }

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] pb-16 text-white">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[2rem] border border-white/40 bg-white/18 p-8 shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-2xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-sm uppercase tracking-[0.28em] text-cyan-300">User View</p>
              <h1 className="mt-2 text-3xl font-extrabold text-white sm:text-4xl">
                Driver List
              </h1>
              <p className="mt-3 max-w-2xl text-slate-300">
                Browse active UniRide drivers and their assigned routes. This page is view-only for users.
              </p>
            </div>

            <button
              type="button"
              onClick={loadDrivers}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-2xl border border-white/35 bg-white/25 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/30"
            >
              <FaSync className={loading ? "animate-spin" : ""} />
              Refresh
            </button>
          </div>

          <div className="mt-8 grid gap-4 md:grid-cols-3">
            <div className="rounded-[1.6rem] border border-white/45 bg-white/70 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Total Drivers</p>
              <p className="mt-3 text-3xl font-extrabold text-slate-900">{drivers.length}</p>
            </div>
            <div className="rounded-[1.6rem] border border-white/45 bg-white/70 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">Available</p>
              <p className="mt-3 text-3xl font-extrabold text-emerald-600">
                {drivers.filter((driver) => driver.status === "Available").length}
              </p>
            </div>
            <div className="rounded-[1.6rem] border border-white/45 bg-white/70 p-5 backdrop-blur-xl">
              <p className="text-sm font-semibold uppercase tracking-[0.22em] text-slate-400">On Trip</p>
              <p className="mt-3 text-3xl font-extrabold text-cyan-700">
                {drivers.filter((driver) => driver.status === "On Trip").length}
              </p>
            </div>
          </div>

          <div className="relative mt-8">
            <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Search by driver name, route, bus, shift..."
              className="w-full rounded-[1.6rem] border border-white/45 bg-white/72 py-3 pl-12 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-500 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
            />
          </div>

          {error && (
            <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm font-medium text-red-200">
              {error}
            </div>
          )}

          {loading ? (
            <div className="mt-10 flex justify-center">
              <div className="h-10 w-10 animate-spin rounded-full border-4 border-cyan-400 border-t-transparent" />
            </div>
          ) : filteredDrivers.length === 0 ? (
            <div className="mt-8 rounded-[1.7rem] border border-dashed border-white/40 bg-white/45 px-6 py-12 text-center text-slate-700 backdrop-blur-xl">
              No drivers match your search.
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
              {filteredDrivers.map((driver) => (
                <article
                  key={driver._id}
                  className="rounded-[1.8rem] border border-white/45 bg-white/72 p-6 shadow-[0_18px_50px_rgba(2,8,23,0.26)] backdrop-blur-xl transition hover:-translate-y-1 hover:border-cyan-300/40 hover:bg-white/80"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-xl font-bold text-slate-900">{driver.name}</h2>
                      <p className="mt-1 text-sm text-slate-500">{driver.shift || "Shift not assigned"}</p>
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${
                        statusStyles[driver.status] || "border border-slate-200 bg-slate-100 text-slate-700"
                      }`}
                    >
                      {driver.status || "Unknown"}
                    </span>
                  </div>

                  <div className="mt-5 space-y-3 text-sm text-slate-600">
                    <p className="flex items-center gap-2">
                      <FaRoute className="text-cyan-600" />
                      {driver.route || "Route not assigned"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaBus className="text-cyan-600" />
                      {driver.assignedBus || "Bus not assigned"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaPhoneAlt className="text-cyan-600" />
                      {driver.contactNumber || "No contact number"}
                    </p>
                    <p className="flex items-center gap-2">
                      <FaIdBadge className="text-cyan-600" />
                      {driver.licenseNumber || "No license number"}
                    </p>
                  </div>

                  <div className="mt-6 rounded-[1.4rem] border border-white/55 bg-white/58 px-4 py-3 text-sm text-slate-600 backdrop-blur-md">
                    <span className="inline-flex items-center gap-2 font-medium text-slate-800">
                      <FaUser className="text-cyan-600" />
                      View only
                    </span>
                    <p className="mt-1">Users can browse driver details here, but cannot add, edit, or delete records.</p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default DriverListPage;
