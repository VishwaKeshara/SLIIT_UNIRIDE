import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";
import { getStoredAdminRole, isRouteManager } from "../../admin/adminAccess";
import {
  BusFront,
  MapPin,
  Route as RouteIcon,
  Users,
  Clock3,
  Repeat,
  CalendarDays,
  Pencil,
  Trash2,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  Navigation,
  Search,
} from "lucide-react";


function RouteList({
  readOnly = false,
  title = "Route List",
  description = "All saved shuttle routes appear here.",
  embedded = false,
  allowRouteEditing = true,
  allowStopManagement = true,
  allowStatusToggle = false,
}) {
  const location = useLocation();
  const adminRole = getStoredAdminRole();
  const routeManagerView = !readOnly && isRouteManager(adminRole);
  const [routes, setRoutes] = useState([]);
  const [stopsByRoute, setStopsByRoute] = useState({});
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(
    location.state?.successMessage || ""
  );
  const [editingRouteId, setEditingRouteId] = useState("");
  const [editingStopId, setEditingStopId] = useState("");
  const [editingStopName, setEditingStopName] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editForm, setEditForm] = useState({
    routeName: "",
    startLocation: "",
    endLocation: "",
    seatCapacity: "",
    startTime: "",
    recurrence: "none",
    days: [],
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const canEditRoutes = allowRouteEditing;
  const canManageStops = allowStopManagement;
  const canToggleStatus = allowStatusToggle && !routeManagerView;
  const canDeleteRoutes = true;

  useEffect(() => {
    setSuccessMessage(location.state?.successMessage || "");
    fetchRoutes();
  }, [location.key]);

  const startEditing = (route) => {
    setEditingRouteId(route._id);
    setError("");
    setSuccessMessage("");
    setEditForm({
      routeName: route.routeName || "",
      startLocation: route.startLocation || "",
      endLocation: route.endLocation || "",
      seatCapacity: route.seatCapacity || "",
      startTime: route.startTime || "",
      recurrence: route.recurrence || "none",
      days: route.days || [],
    });
  };

  const cancelEditing = () => {
    setEditingRouteId("");
  };

  const toggleDay = (day) => {
    setEditForm((current) => ({
      ...current,
      days: current.days.includes(day)
        ? current.days.filter((currentDay) => currentDay !== day)
        : [...current.days, day],
    }));
  };

  const fetchRoutes = async () => {
    try {
      setError("");
      const endpoint = readOnly
        ? "http://localhost:5000/api/routes/active"
        : "http://localhost:5000/api/routes";
      const res = await axios.get(endpoint);
      setRoutes(res.data);
      await fetchStopsForRoutes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load routes.");
    }
  };

  const fetchStopsForRoutes = async (routeList) => {
    try {
      const stopEntries = await Promise.all(
        routeList.map(async (route) => {
          const res = await axios.get(
            `http://localhost:5000/api/stops/route/${route._id}`
          );
          return [route._id, res.data];
        })
      );

      setStopsByRoute(Object.fromEntries(stopEntries));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stop locations.");
    }
  };

  const refreshRouteStops = async (routeId) => {
    try {
      const res = await axios.get(
        `http://localhost:5000/api/stops/route/${routeId}`
      );
      setStopsByRoute((current) => ({
        ...current,
        [routeId]: res.data,
      }));
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load stop locations.");
    }
  };

  const updateRoute = async (id) => {
    try {
      setError("");
      await axios.put(`http://localhost:5000/api/routes/${id}`, {
        ...editForm,
        seatCapacity: Number(editForm.seatCapacity),
      });
      setSuccessMessage("Route updated successfully.");
      setEditingRouteId("");
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update route.");
    }
  };

  const toggleRouteStatus = async (route) => {
    try {
      setError("");
      setSuccessMessage("");
      await axios.put(`http://localhost:5000/api/routes/${route._id}`, {
        routeName: route.routeName,
        startLocation: route.startLocation,
        endLocation: route.endLocation,
        seatCapacity: Number(route.seatCapacity),
        startTime: route.startTime,
        recurrence: route.recurrence || "none",
        days: route.days || [],
        active: !route.active,
      });
      setSuccessMessage(
        route.active
          ? "Route deactivated successfully."
          : "Route activated successfully."
      );
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update route status.");
    }
  };

  const deleteRoute = async (id) => {
    try {
      await axios.delete(`http://localhost:5000/api/routes/${id}`);
      setSuccessMessage("Route deleted successfully.");
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete route.");
    }
  };

  const startEditingStop = (stop) => {
    setEditingStopId(stop._id);
    setEditingStopName(stop.stopName);
    setError("");
    setSuccessMessage("");
  };

  const cancelEditingStop = () => {
    setEditingStopId("");
    setEditingStopName("");
  };

  const updateStop = async (routeId, stopId) => {
    if (!editingStopName.trim()) {
      setError("Stop location is required.");
      return;
    }

    try {
      setError("");
      await axios.put(`http://localhost:5000/api/stops/${stopId}`, {
        stopName: editingStopName.trim(),
      });
      setSuccessMessage("Stop location updated successfully.");
      cancelEditingStop();
      await refreshRouteStops(routeId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update stop location.");
    }
  };

  const deleteStop = async (routeId, stopId) => {
    try {
      setError("");
      await axios.delete(`http://localhost:5000/api/stops/${stopId}`);
      setSuccessMessage("Stop location deleted successfully.");
      if (editingStopId === stopId) {
        cancelEditingStop();
      }
      await refreshRouteStops(routeId);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to delete stop location.");
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-700 shadow-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-200";

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredRoutes = routes.filter((route) => {
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

  const wrapperClass = embedded
    ? "relative min-h-full bg-transparent"
    : readOnly
      ? "relative min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800"
      : "relative min-h-screen bg-gradient-to-br from-[#f8fbff] via-[#eef6ff] to-[#f5f9ff]";

  const overlayClass =
    embedded || !readOnly
      ? "hidden"
      : "absolute inset-0 bg-slate-950/65";

  const headerCardClass =
    readOnly
      ? "mb-8 overflow-hidden rounded-[32px] border border-cyan-400/10 bg-gradient-to-r from-slate-950/95 via-[#0d2237]/95 to-[#123b57]/95 shadow-[0_30px_90px_rgba(2,8,23,0.45)] backdrop-blur-xl"
      : "mb-8 overflow-hidden rounded-3xl border border-blue-100 bg-white/90 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm";

  const pillClass =
    readOnly
      ? "mb-4 inline-flex items-center gap-2 rounded-full border border-cyan-300/20 bg-cyan-400/10 px-4 py-2 text-sm font-medium text-cyan-100"
      : "mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700";

  const titleClass =
    readOnly
      ? "text-3xl font-bold tracking-tight text-white md:text-4xl"
      : "text-3xl font-bold tracking-tight text-slate-800 md:text-4xl";

  const descriptionClass =
    readOnly
      ? "mt-3 max-w-2xl text-sm leading-6 text-slate-200 md:text-base"
      : "mt-3 max-w-2xl text-sm leading-6 text-slate-500 md:text-base";

  const statCardClass =
    readOnly
      ? "rounded-2xl border border-white/10 bg-white/10 p-4 text-white shadow-inner"
      : "rounded-2xl border border-blue-100 bg-blue-50/70 p-4 text-slate-800";

  const statLabelClass = readOnly ? "text-sm text-slate-200" : "text-sm text-slate-500";

  const searchPanelClass =
    readOnly
      ? "mb-6 rounded-[28px] border border-cyan-400/10 bg-white/10 p-4 shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-xl sm:p-5"
      : "mb-6 rounded-3xl border border-blue-100 bg-white/90 p-4 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm sm:p-5";

  const searchTitleClass =
    readOnly
      ? "text-sm font-semibold uppercase tracking-[0.2em] text-slate-300"
      : "text-sm font-semibold uppercase tracking-[0.2em] text-slate-600";

  const searchDescClass =
    readOnly
      ? "mt-1 text-sm text-slate-200"
      : "mt-1 text-sm text-slate-500";

  const searchInputClass =
    readOnly
      ? "w-full rounded-2xl border border-white/10 bg-slate-950/60 py-3 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
      : "w-full rounded-2xl border border-blue-100 bg-white py-3 pl-11 pr-4 text-sm text-slate-700 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-100";

  const emptyStateClass =
    readOnly
      ? "rounded-[28px] border border-white/10 bg-white/10 px-6 py-16 text-center shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-xl"
      : "rounded-3xl border border-blue-100 bg-white/90 px-6 py-16 text-center shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm";

  const emptyIconClass =
    readOnly
      ? "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 text-white"
      : "mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600";

  const emptyTitleClass = readOnly ? "text-xl font-semibold text-white" : "text-xl font-semibold text-slate-800";

  const emptyTextClass = readOnly ? "mt-2 text-sm text-slate-200" : "mt-2 text-sm text-slate-500";

  const routeCardClass = readOnly
    ? "overflow-hidden rounded-[28px] border border-white/10 bg-white shadow-[0_20px_60px_rgba(2,8,23,0.18)]"
    : "overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl";

  const routeShellClass = readOnly
    ? "bg-gradient-to-r from-cyan-50 via-white to-slate-50 p-6 md:p-8"
    : "p-6 md:p-8";

  const routeIconClass = readOnly
    ? "rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 p-3 text-white shadow-lg"
    : "rounded-2xl bg-blue-100 p-3 text-blue-700";

  const infoCardClass = readOnly
    ? "rounded-2xl border border-slate-200 bg-slate-50 p-4 transition hover:border-cyan-200 hover:bg-cyan-50/50"
    : "rounded-2xl border border-slate-200 bg-slate-50 p-4";

  const stopsPanelClass = readOnly
    ? "mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
    : "mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5";

  return (
    <div className={wrapperClass}>
      <div className={overlayClass}></div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Header */}
        <div className={headerCardClass}>
          <div className="grid gap-6 p-6 md:grid-cols-[1.5fr_1fr] md:p-8">
            <div>
              <div className={pillClass}>
                <BusFront size={16} />
                Shuttle Route Management
              </div>

              <h1 className={titleClass}>
                {title}
              </h1>
              <p className={descriptionClass}>
                {description}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className={statCardClass}>
                <p className={statLabelClass}>Total Routes</p>
                <p className="mt-2 text-3xl font-bold">{filteredRoutes.length}</p>
              </div>
              <div className={statCardClass}>
                <p className={statLabelClass}>Mode</p>
                <p className="mt-2 text-lg font-semibold">
                  {readOnly
                    ? "Booking View"
                    : routeManagerView
                      ? "Route Manager View"
                      : "Admin View"}
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className={searchPanelClass}>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className={searchTitleClass}>
                {readOnly ? "Search Schedules" : "Search Routes"}
              </p>
              <p className={searchDescClass}>
                {readOnly
                  ? "Find routes by name, location, time, recurrence, or stop."
                  : routeManagerView
                    ? "Manage route details and stops while route status controls stay disabled."
                    : "Quickly find routes by name, location, time, recurrence, or stop."}
              </p>
            </div>

            <div className="relative w-full md:max-w-md">
              <Search
                size={18}
                className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search routes, stops, or locations"
                className={searchInputClass}
              />
            </div>
          </div>

          {!readOnly && (
            <div className="mt-4 flex flex-wrap gap-3">
              <Link
                to="/routes/new"
                className="inline-flex items-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
              >
                <PlusCircle size={18} />
                Add New Route
              </Link>
            </div>
          )}
        </div>

        {!readOnly && successMessage && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-700 shadow-sm">
            <CheckCircle2 size={18} />
            {successMessage}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700 shadow-sm">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {/* Empty State */}
        {filteredRoutes.length === 0 && !error && (
          <div className={emptyStateClass}>
            <div className={emptyIconClass}>
              <Navigation size={28} />
            </div>
            <h3 className={emptyTitleClass}>
              {searchTerm ? "No matching routes found" : "No routes available yet"}
            </h3>
            <p className={emptyTextClass}>
              {searchTerm
                ? "Try another route name, stop, location, or departure time."
                : "Added shuttle routes will appear here once they are created."}
            </p>
          </div>
        )}

        {/* Route Cards */}
        <div className="grid gap-6">
          {filteredRoutes.map((route) => (
            <div key={route._id} className={routeCardClass}>
              {!readOnly && canEditRoutes && editingRouteId === route._id ? (
                <div className="p-6 md:p-8">
                  <div className="mb-6 flex items-center gap-3">
                    <div className="rounded-xl bg-amber-100 p-3 text-amber-600">
                      <Pencil size={20} />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-slate-900">
                        Edit Route
                      </h3>
                      <p className="text-sm text-slate-500">
                        Update route details and save changes.
                      </p>
                    </div>
                  </div>

                  <div className="grid gap-4 md:grid-cols-2">
                    <input
                      type="text"
                      value={editForm.routeName}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          routeName: event.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Route Name"
                    />

                    <input
                      type="text"
                      value={editForm.startLocation}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          startLocation: event.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Start Location"
                    />

                    <input
                      type="text"
                      value={editForm.endLocation}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          endLocation: event.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="End Location"
                    />

                    <input
                      type="number"
                      value={editForm.seatCapacity}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          seatCapacity: event.target.value,
                        })
                      }
                      className={inputClass}
                      placeholder="Seat Capacity"
                    />

                    <input
                      type="time"
                      value={editForm.startTime}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          startTime: event.target.value,
                        })
                      }
                      className={inputClass}
                    />

                    <select
                      value={editForm.recurrence}
                      onChange={(event) =>
                        setEditForm({
                          ...editForm,
                          recurrence: event.target.value,
                          days:
                            event.target.value === "weekly"
                              ? editForm.days
                              : [],
                        })
                      }
                      className={inputClass}
                    >
                      <option value="none">One Time</option>
                      <option value="daily">Daily</option>
                      <option value="weekly">Weekly</option>
                    </select>
                  </div>

                  {editForm.recurrence === "weekly" && (
                    <div className="mt-5 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                      <div className="mb-3 flex items-center gap-2 text-slate-700">
                        <CalendarDays size={18} className="text-indigo-600" />
                        <p className="text-sm font-semibold">Select Days</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {weekDays.map((day) => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                              editForm.days.includes(day)
                                ? "border-blue-600 bg-blue-600 text-white"
                                : "border-slate-300 bg-white text-slate-700 hover:border-blue-400 hover:text-blue-600"
                            }`}
                          >
                            {day}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="mt-6 flex flex-wrap gap-3">
                    <button
                      type="button"
                      onClick={() => updateRoute(route._id)}
                      className="rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                    >
                      Update Route
                    </button>
                    <button
                      type="button"
                      onClick={cancelEditing}
                      className="rounded-xl bg-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className={routeShellClass}>
                  <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                    {/* Left Section */}
                    <div className="flex-1">
                      <div className="mb-5 flex items-start gap-4">
                        <div className={routeIconClass}>
                          <RouteIcon size={22} />
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-3">
                            <h3 className="text-2xl font-bold text-slate-900">
                              {route.routeName}
                            </h3>
                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                route.active === false
                                  ? "bg-red-100 text-red-700"
                                  : "bg-green-100 text-green-700"
                              }`}
                            >
                              {route.active === false ? "Inactive" : "Active"}
                            </span>
                          </div>
                          <p className="mt-1 text-sm text-slate-500">
                            Shuttle route details and stop management
                          </p>
                        </div>
                      </div>

                      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                        <div className={infoCardClass}>
                          <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <MapPin size={16} className="text-green-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Start
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {route.startLocation}
                          </p>
                        </div>

                        <div className={infoCardClass}>
                          <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <MapPin size={16} className="text-red-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Destination
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {route.endLocation}
                          </p>
                        </div>

                        <div className={infoCardClass}>
                          <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <Users size={16} className="text-blue-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Capacity
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {route.seatCapacity} Seats
                          </p>
                        </div>

                        <div className={infoCardClass}>
                          <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <Clock3 size={16} className="text-purple-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Start Time
                            </span>
                          </div>
                          <p className="text-sm font-semibold text-slate-900">
                            {route.startTime}
                          </p>
                        </div>

                        <div className={`${infoCardClass} md:col-span-2 xl:col-span-2`}>
                          <div className="mb-2 flex items-center gap-2 text-slate-600">
                            <Repeat size={16} className="text-indigo-600" />
                            <span className="text-xs font-semibold uppercase tracking-wide">
                              Recurrence
                            </span>
                          </div>
                          <p className="text-sm font-semibold capitalize text-slate-900">
                            {route.recurrence}
                            {route.recurrence === "weekly" &&
                            route.days?.length > 0
                              ? ` (${route.days.join(", ")})`
                              : ""}
                          </p>
                        </div>
                      </div>

                      {/* Stops */}
                      <div className={stopsPanelClass}>
                        <div className="mb-4 flex items-center gap-2">
                          <Navigation size={18} className="text-slate-700" />
                          <h4 className="text-sm font-bold uppercase tracking-wide text-slate-800">
                            Stop Locations
                          </h4>
                        </div>

                        <div className="space-y-3">
                          {(stopsByRoute[route._id] || []).length > 0 ? (
                            (stopsByRoute[route._id] || []).map(
                              (stop, index) => (
                                <div
                                  key={stop._id}
                                  className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm"
                                >
                                  {editingStopId === stop._id && !readOnly && canManageStops ? (
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center">
                                      <span className="text-sm font-semibold text-slate-700">
                                        #{index + 1}
                                      </span>
                                      <input
                                        type="text"
                                        value={editingStopName}
                                        onChange={(event) =>
                                          setEditingStopName(event.target.value)
                                        }
                                        className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
                                      />
                                      <button
                                        type="button"
                                        onClick={() =>
                                          updateStop(route._id, stop._id)
                                        }
                                        className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                                      >
                                        Save
                                      </button>
                                      <button
                                        type="button"
                                        onClick={cancelEditingStop}
                                        className="rounded-xl bg-slate-200 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-300"
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  ) : (
                                    <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
                                      <p className="text-sm font-medium text-slate-700">
                                        #{index + 1} {stop.stopName}
                                      </p>

                                      {!readOnly && canManageStops && (
                                        <div className="flex flex-wrap gap-2">
                                          <button
                                            type="button"
                                            onClick={() =>
                                              startEditingStop(stop)
                                            }
                                            className="rounded-xl bg-amber-500 px-3 py-2 text-sm font-semibold text-white hover:bg-amber-600"
                                          >
                                            Edit Stop
                                          </button>
                                          <button
                                            type="button"
                                            onClick={() =>
                                              deleteStop(route._id, stop._id)
                                            }
                                            className="rounded-xl bg-red-600 px-3 py-2 text-sm font-semibold text-white hover:bg-red-700"
                                          >
                                            Delete Stop
                                          </button>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </div>
                              )
                            )
                          ) : (
                            <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-6 text-center text-sm text-slate-500">
                              No stop locations added yet.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Action Buttons */}
                    <div className="flex min-w-[220px] flex-col gap-3 xl:items-stretch">
                      {readOnly ? (
                        <Link
                          to="/book"
                          state={{ selectedRoute: route }}
                          className="inline-flex items-center justify-center gap-2 rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-blue-700"
                        >
                          <PlusCircle size={18} />
                          Book Now
                        </Link>
                      ) : (
                        <>
                          {canManageStops && (
                            <Link
                              to={`/stop/${route._id}`}
                              state={{ route }}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-slate-900"
                            >
                              <Navigation size={18} />
                              Manage Stops
                            </Link>
                          )}

                          {canEditRoutes && (
                            <button
                              type="button"
                              onClick={() => startEditing(route)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition hover:bg-amber-600"
                            >
                              <Pencil size={18} />
                              Edit Route
                            </button>
                          )}

                          {canToggleStatus && (
                            <button
                              type="button"
                              onClick={() => toggleRouteStatus(route)}
                              className={`inline-flex items-center justify-center gap-2 rounded-2xl px-5 py-3 text-sm font-semibold text-white transition ${
                                route.active === false
                                  ? "bg-blue-500 hover:bg-blue-600"
                                  : "bg-yellow-500 hover:bg-yellow-600"
                              }`}
                            >
                              {route.active === false
                                ? "Activate Route"
                                : "Deactivate Route"}
                            </button>
                          )}

                          {canDeleteRoutes && (
                            <button
                              type="button"
                              onClick={() => deleteRoute(route._id)}
                              className="inline-flex items-center justify-center gap-2 rounded-2xl bg-red-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
                            >
                              <Trash2 size={18} />
                              Delete Route
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default RouteList;
