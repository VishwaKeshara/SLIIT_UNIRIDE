import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation } from "react-router-dom";

function RouteList({
  readOnly = false,
  title = "Route List",
  description = "All saved shuttle routes appear here."
}) {
  const location = useLocation();
  const [routes, setRoutes] = useState([]);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState(location.state?.successMessage || "");
  const [editingRouteId, setEditingRouteId] = useState("");
  const [editForm, setEditForm] = useState({
    routeName: "",
    startLocation: "",
    endLocation: "",
    seatCapacity: "",
    startTime: "",
    recurrence: "none",
    days: []
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  useEffect(() => {
    fetchRoutes();
  }, []);

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
      days: route.days || []
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
        : [...current.days, day]
    }));
  };

  const fetchRoutes = async () => {
    try {
      setError("");
      const res = await axios.get("http://localhost:5000/api/routes");
      setRoutes(res.data);
    } catch (err) {
      setError(err.response?.data?.message || "Unable to load routes.");
    }
  };

  const updateRoute = async (id) => {
    try {
      setError("");
      await axios.put(`http://localhost:5000/api/routes/${id}`, {
        ...editForm,
        seatCapacity: Number(editForm.seatCapacity)
      });
      setSuccessMessage("Route updated successfully.");
      setEditingRouteId("");
      fetchRoutes();
    } catch (err) {
      setError(err.response?.data?.message || "Unable to update route.");
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

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-900">{title}</h2>
          <p className="text-sm text-slate-600">{description}</p>
        </div>
      </div>

      {!readOnly && successMessage && (
        <div className="mb-4 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {successMessage}
        </div>
      )}

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid gap-4">
        {routes.length === 0 && !error && (
          <div className="rounded-xl bg-slate-100 px-4 py-6 text-center text-slate-600">
            No routes available yet.
          </div>
        )}

        {routes.map((route) => (
          <div
            key={route._id}
            className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            {!readOnly && editingRouteId === route._id ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <input
                    type="text"
                    value={editForm.routeName}
                    onChange={(event) => setEditForm({ ...editForm, routeName: event.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Route Name"
                  />
                  <input
                    type="text"
                    value={editForm.startLocation}
                    onChange={(event) => setEditForm({ ...editForm, startLocation: event.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Start Location"
                  />
                  <input
                    type="text"
                    value={editForm.endLocation}
                    onChange={(event) => setEditForm({ ...editForm, endLocation: event.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="End Location"
                  />
                  <input
                    type="number"
                    value={editForm.seatCapacity}
                    onChange={(event) => setEditForm({ ...editForm, seatCapacity: event.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                    placeholder="Seat Capacity"
                  />
                  <input
                    type="time"
                    value={editForm.startTime}
                    onChange={(event) => setEditForm({ ...editForm, startTime: event.target.value })}
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  />
                  <select
                    value={editForm.recurrence}
                    onChange={(event) =>
                      setEditForm({
                        ...editForm,
                        recurrence: event.target.value,
                        days: event.target.value === "weekly" ? editForm.days : []
                      })
                    }
                    className="rounded-lg border border-slate-300 px-3 py-2"
                  >
                    <option value="none">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>

                {editForm.recurrence === "weekly" && (
                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        key={day}
                        type="button"
                        onClick={() => toggleDay(day)}
                        className={`rounded-full border px-3 py-1 text-sm ${
                          editForm.days.includes(day)
                            ? "bg-blue-600 text-white"
                            : "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => updateRoute(route._id)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                  >
                    Update
                  </button>
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="rounded-lg bg-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-300"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-slate-900">{route.routeName}</h3>
                  <p className="text-sm text-slate-600">
                    {route.startLocation} to {route.endLocation}
                  </p>
                  <p className="text-sm text-slate-600">Seats: {route.seatCapacity}</p>
                  <p className="text-sm text-slate-600">Start time: {route.startTime}</p>
                  <p className="text-sm text-slate-600">
                    Recurrence: {route.recurrence}
                    {route.recurrence === "weekly" && route.days?.length > 0
                      ? ` (${route.days.join(", ")})`
                      : ""}
                  </p>
                </div>

                {readOnly ? (
                  <div className="flex gap-2">
                    <Link
                      to="/book"
                      state={{ selectedRoute: route }}
                      className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
                    >
                      Book Now
                    </Link>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(route)}
                      className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600"
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRoute(route._id)}
                      className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default RouteList;
