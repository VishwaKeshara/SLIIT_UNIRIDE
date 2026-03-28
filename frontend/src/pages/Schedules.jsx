import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";
import {
  BusFront,
  Clock3,
  MapPin,
  Navigation,
  Repeat,
  Search,
  Users,
  ArrowRight,
  CalendarDays,
} from "lucide-react";

const API = "http://localhost:5000/api";

function Schedules() {
  const [routes, setRoutes] = useState([]);
  const [stopsByRoute, setStopsByRoute] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        setLoading(true);
        setError("");

        const routeRes = await axios.get(`${API}/routes/active`);
        const activeRoutes = routeRes.data;
        setRoutes(activeRoutes);

        const stopEntries = await Promise.all(
          activeRoutes.map(async (route) => {
            const stopRes = await axios.get(`${API}/stops/route/${route._id}`);
            return [route._id, stopRes.data];
          })
        );

        setStopsByRoute(Object.fromEntries(stopEntries));
      } catch (err) {
        setError(
          err.response?.data?.message || "Unable to load shuttle schedules."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSchedules();
  }, []);

  const normalizedSearch = searchTerm.trim().toLowerCase();

  const filteredRoutes = useMemo(() => {
    return routes.filter((route) => {
      if (!normalizedSearch) return true;

      const routeStops = stopsByRoute[route._id] || [];
      const searchableText = [
        route.routeName,
        route.startLocation,
        route.endLocation,
        route.startTime,
        route.recurrence,
        ...(route.days || []),
        ...routeStops.map((stop) => stop.stopName),
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      return searchableText.includes(normalizedSearch);
    });
  }, [normalizedSearch, routes, stopsByRoute]);

  const totalStops = filteredRoutes.reduce(
    (count, route) => count + (stopsByRoute[route._id]?.length || 0),
    0
  );

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[32px] border border-cyan-400/10 bg-white/10 shadow-[0_30px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl">
          <div className="grid gap-8 px-6 py-8 lg:grid-cols-[1.4fr_0.8fr] lg:px-8 lg:py-10">
            <div>
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100">
                <BusFront size={16} />
                UniRide Operations
              </div>

              <h1 className="max-w-3xl text-4xl font-bold tracking-tight text-white sm:text-5xl">
                Shuttle Schedule Center
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-200 sm:text-lg">
                View active shuttle departures, route coverage, stop sequences,
                and recurring service patterns in one professional operations
                dashboard.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  to="/book"
                  className="inline-flex items-center gap-2 rounded-2xl bg-cyan-400 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-300"
                >
                  Book a Ride <ArrowRight size={16} />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center gap-2 rounded-2xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                >
                  Contact Support
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Active Routes</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {filteredRoutes.length}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Covered Stops</p>
                <p className="mt-2 text-3xl font-bold text-white">
                  {totalStops}
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Service Mode</p>
                <p className="mt-2 text-lg font-semibold text-cyan-100">
                  Live Schedule
                </p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-5">
                <p className="text-sm text-slate-300">Availability</p>
                <p className="mt-2 text-lg font-semibold text-emerald-300">
                  Active Only
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="mb-8 rounded-[28px] border border-cyan-400/10 bg-white/10 p-5 shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-xl">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300">
                Search Schedules
              </p>
              <p className="mt-1 text-sm text-slate-200">
                Search by route name, departure time, location, recurrence, or stop.
              </p>
            </div>

            <div className="relative w-full lg:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search route, stop, or location"
                className="w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
              />
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/20 bg-red-500/10 px-4 py-4 text-sm text-red-100">
            {error}
          </div>
        )}

        {loading ? (
          <div className="rounded-[28px] border border-white/10 bg-white/10 px-6 py-16 text-center shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-xl">
            <p className="text-lg font-medium text-slate-200">
              Loading active shuttle schedules...
            </p>
          </div>
        ) : filteredRoutes.length === 0 ? (
          <div className="rounded-[28px] border border-white/10 bg-white/10 px-6 py-16 text-center shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white">
              <Navigation size={28} />
            </div>
            <h3 className="text-xl font-semibold text-white">
              {searchTerm ? "No matching schedules found" : "No active schedules available"}
            </h3>
            <p className="mt-2 text-sm text-slate-200">
              {searchTerm
                ? "Try another route, stop, location, or departure time."
                : "Active shuttle schedules will appear here once routes are available."}
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {filteredRoutes.map((route) => {
              const routeStops = stopsByRoute[route._id] || [];

              return (
                <article
                  key={route._id}
                  className="overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(2,8,23,0.18)]"
                >
                  <div className="bg-gradient-to-r from-cyan-50 via-white to-slate-50 p-6 md:p-8">
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-6 flex items-start gap-4">
                          <div className="rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 text-white shadow-lg">
                            <BusFront size={22} />
                          </div>
                          <div>
                            <div className="flex flex-wrap items-center gap-3">
                              <h2 className="text-2xl font-bold text-slate-900">
                                {route.routeName}
                              </h2>
                              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">
                                Active Service
                              </span>
                            </div>
                            <p className="mt-1 text-sm text-slate-500">
                              Operational route with live booking availability
                            </p>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50">
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                              <MapPin size={16} className="text-green-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Origin
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {route.startLocation}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50">
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                              <Navigation size={16} className="text-red-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Destination
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {route.endLocation}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50">
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                              <Clock3 size={16} className="text-blue-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Departure
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {route.startTime}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50">
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                              <Users size={16} className="text-indigo-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Capacity
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {route.seatCapacity} Seats
                            </p>
                          </div>
                        </div>

                        <div className="mt-4 grid gap-4 md:grid-cols-[1fr_1.1fr]">
                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                              <Repeat size={16} className="text-cyan-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Recurrence
                              </span>
                            </div>
                            <p className="text-sm font-semibold capitalize text-slate-900">
                              {route.recurrence}
                              {route.recurrence === "weekly" && route.days?.length > 0
                                ? ` (${route.days.join(", ")})`
                                : ""}
                            </p>
                          </div>

                          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="mb-2 flex items-center gap-2 text-slate-600">
                              <CalendarDays size={16} className="text-amber-600" />
                              <span className="text-xs font-semibold uppercase tracking-wide">
                                Stop Coverage
                              </span>
                            </div>
                            <p className="text-sm font-semibold text-slate-900">
                              {routeStops.length > 0
                                ? `${routeStops.length} registered stops`
                                : "Stops will be updated soon"}
                            </p>
                          </div>
                        </div>

                        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                          <div className="mb-4 flex items-center gap-2">
                            <Navigation size={18} className="text-slate-700" />
                            <h3 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                              Stop Sequence
                            </h3>
                          </div>

                          {routeStops.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {routeStops.map((stop, index) => (
                                <div
                                  key={stop._id}
                                  className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
                                >
                                  <span className="rounded-full bg-cyan-100 px-2 py-0.5 text-xs font-semibold text-cyan-700">
                                    {index + 1}
                                  </span>
                                  {stop.stopName}
                                </div>
                              ))}
                            </div>
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
                              No stop locations published for this route yet.
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex min-w-[220px] flex-col gap-3 xl:items-stretch">
                        <Link
                          to="/book"
                          state={{ selectedRoute: route }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-cyan-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
                        >
                          Book This Route
                        </Link>
                        <div className="rounded-2xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                            Schedule Status
                          </p>
                          <p className="mt-2 text-sm font-semibold text-emerald-600">
                            Available For Booking
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

export default Schedules;
