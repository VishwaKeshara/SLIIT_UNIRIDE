import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { getStoredAdminRole, isRouteManager } from "../../admin/adminAccess";
import {
  ArrowLeft,
  BusFront,
  CalendarDays,
  Clock,
  MapPin,
  Repeat,
  Route,
  Users,
} from "lucide-react";

function RouteFormAdmin() {
  const navigate = useNavigate();
  const adminRole = getStoredAdminRole();
  const routeManager = isRouteManager(adminRole);

  const [form, setForm] = useState({
    routeName: "",
    startLocation: "",
    endLocation: "",
    seatCapacity: "",
    startTime: "",
    recurrence: "none",
    days: [],
  });

  const [errors, setErrors] = useState({});
  const [submitError, setSubmitError] = useState("");

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  const validate = () => {
    const newErrors = {};

    if (!form.routeName.trim()) newErrors.routeName = "Route name is required";
    if (!form.startLocation.trim()) {
      newErrors.startLocation = "Start location is required";
    }
    if (!form.endLocation.trim()) {
      newErrors.endLocation = "End location is required";
    }
    if (
      form.startLocation.trim() &&
      form.endLocation.trim() &&
      form.startLocation.trim().toLowerCase() ===
        form.endLocation.trim().toLowerCase()
    ) {
      newErrors.endLocation = "Start and end locations cannot be the same";
    }
    if (!form.seatCapacity) {
      newErrors.seatCapacity = "Seat capacity is required";
    } else if (Number(form.seatCapacity) <= 0) {
      newErrors.seatCapacity = "Seat capacity must be greater than 0";
    } else if (Number(form.seatCapacity) > 100) {
      newErrors.seatCapacity = "Maximum 100 seats allowed";
    }
    if (!form.startTime) newErrors.startTime = "Start time is required";
    if (form.recurrence === "weekly" && form.days.length === 0) {
      newErrors.days = "Please select at least one day";
    }

    return newErrors;
  };

  const toggleDay = (day) => {
    if (form.days.includes(day)) {
      setForm((prev) => ({
        ...prev,
        days: prev.days.filter((item) => item !== day),
      }));
      return;
    }

    setForm((prev) => ({
      ...prev,
      days: [...prev.days, day],
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationErrors = validate();
    setErrors(validationErrors);
    setSubmitError("");

    if (Object.keys(validationErrors).length > 0) return;

    try {
      await axios.post("http://localhost:5000/api/routes", {
        ...form,
        seatCapacity: Number(form.seatCapacity),
      });

      alert("Route added successfully");

      setForm({
        routeName: "",
        startLocation: "",
        endLocation: "",
        seatCapacity: "",
        startTime: "",
        recurrence: "none",
        days: [],
      });

      setErrors({});
      navigate("/RouteList", {
        state: { successMessage: "Route added successfully." },
      });
    } catch (err) {
      setSubmitError("Failed to add route. Please try again.");
    }
  };

  const inputWrapperClass = (field) =>
    `mt-2 flex items-center rounded-2xl border bg-white px-4 py-3 shadow-sm transition ${
      errors[field]
        ? "border-red-400 ring-2 ring-red-100"
        : "border-blue-100 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100"
    }`;

  return (
    <section className="min-h-screen bg-gradient-to-br from-[#f8fbff] via-[#eef6ff] to-[#f5f9ff]">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <button
              type="button"
              onClick={() => navigate("/RouteList")}
              className="mb-5 inline-flex items-center gap-2 rounded-2xl border border-blue-100 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50"
            >
              <ArrowLeft size={16} />
              View Route List
            </button>

            <p className="mb-2 text-lg font-semibold text-blue-600">
              Route Administration
            </p>
            <h1 className="text-4xl font-bold text-slate-800 sm:text-5xl">
              Add Shuttle Route
            </h1>
            <p className="mt-3 max-w-2xl text-base text-slate-500">
              Create new shuttle routes with location details, start times,
              recurrence, and seat capacity using the same admin dashboard
              visual style.
            </p>
          </div>

          <div className="rounded-2xl border border-blue-100 bg-white px-6 py-4 shadow-md text-base">
            <p className="text-slate-500 text-sm">Workspace</p>
            <span className="text-xl font-bold text-blue-600">
              Route Control
            </span>
          </div>
        </div>

        <div className="mb-10 grid grid-cols-1 gap-8 xl:grid-cols-4">
          <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base text-slate-500">Route Name</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-800">
                  {form.routeName || "New Route"}
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-100">
                <Route className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base text-slate-500">Capacity</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-800">
                  {form.seatCapacity || "--"}
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-sky-100">
                <Users className="text-sky-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base text-slate-500">Departure</p>
                <h2 className="mt-3 text-2xl font-bold text-slate-800">
                  {form.startTime || "--:--"}
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100">
                <Clock className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-blue-100 bg-white/90 p-6 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-base text-slate-500">Recurrence</p>
                <h2 className="mt-3 text-2xl font-bold capitalize text-slate-800">
                  {form.recurrence}
                </h2>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-indigo-100">
                <Repeat className="text-indigo-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700">
                <BusFront size={16} />
                Shuttle Administration
              </div>

              <h2 className="text-3xl font-bold text-slate-800">
                Route Information
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Fill in the route information below to create a new shuttle
                schedule.
              </p>
            </div>

            {submitError && (
              <div className="mb-5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Route Name
                </label>
                <div className={inputWrapperClass("routeName")}>
                  <Route className="mr-3 text-blue-600" size={18} />
                  <input
                    type="text"
                    value={form.routeName}
                    onChange={(e) =>
                      setForm({ ...form, routeName: e.target.value })
                    }
                    className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                    placeholder="Ex: Malabe - Colombo"
                  />
                </div>
                {errors.routeName && (
                  <p className="mt-2 text-sm text-red-500">{errors.routeName}</p>
                )}
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Start Location
                  </label>
                  <div className={inputWrapperClass("startLocation")}>
                    <MapPin className="mr-3 text-green-600" size={18} />
                    <input
                      type="text"
                      value={form.startLocation}
                      onChange={(e) =>
                        setForm({ ...form, startLocation: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="Enter starting point"
                    />
                  </div>
                  {errors.startLocation && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.startLocation}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    End Location
                  </label>
                  <div className={inputWrapperClass("endLocation")}>
                    <MapPin className="mr-3 text-red-600" size={18} />
                    <input
                      type="text"
                      value={form.endLocation}
                      onChange={(e) =>
                        setForm({ ...form, endLocation: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="Enter destination"
                    />
                  </div>
                  {errors.endLocation && (
                    <p className="mt-2 text-sm text-red-500">{errors.endLocation}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Seat Capacity
                  </label>
                  <div className={inputWrapperClass("seatCapacity")}>
                    <Users className="mr-3 text-blue-600" size={18} />
                    <input
                      type="number"
                      value={form.seatCapacity}
                      onChange={(e) =>
                        setForm({ ...form, seatCapacity: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                      placeholder="Ex: 40"
                    />
                  </div>
                  {errors.seatCapacity && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.seatCapacity}
                    </p>
                  )}
                </div>

                <div>
                  <label className="text-sm font-semibold text-slate-700">
                    Start Time
                  </label>
                  <div className={inputWrapperClass("startTime")}>
                    <Clock className="mr-3 text-purple-600" size={18} />
                    <input
                      type="time"
                      value={form.startTime}
                      onChange={(e) =>
                        setForm({ ...form, startTime: e.target.value })
                      }
                      className="w-full bg-transparent text-sm text-slate-700 outline-none"
                    />
                  </div>
                  {errors.startTime && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.startTime}
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="text-sm font-semibold text-slate-700">
                  Recurrence Type
                </label>
                <div className={inputWrapperClass("recurrence")}>
                  <Repeat className="mr-3 text-indigo-600" size={18} />
                  <select
                    value={form.recurrence}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        recurrence: e.target.value,
                        days: [],
                      })
                    }
                    className="w-full bg-transparent text-sm text-slate-700 outline-none"
                  >
                    <option value="none">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {form.recurrence === "weekly" && (
                <div className="rounded-2xl border border-blue-100 bg-blue-50/70 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarDays className="text-indigo-600" size={18} />
                    <label className="text-sm font-semibold text-slate-700">
                      Select Weekly Days
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition ${
                          form.days.includes(day)
                            ? "border-blue-600 bg-blue-600 text-white shadow-md"
                            : "border-blue-100 bg-white text-slate-700 hover:border-blue-300 hover:text-blue-600"
                        }`}
                      >
                        {day}
                      </button>
                    ))}
                  </div>

                  {errors.days && (
                    <p className="mt-3 text-sm text-red-500">{errors.days}</p>
                  )}
                </div>
              )}

              <div className="flex flex-col gap-3 sm:flex-row">
                <button
                  type="submit"
                  className="flex-1 rounded-2xl bg-gradient-to-r from-blue-500 to-sky-400 px-4 py-3.5 text-base font-semibold text-white shadow-md transition hover:scale-[1.01]"
                >
                  Add Route
                </button>

                <button
                  type="button"
                  onClick={() => navigate("/RouteList")}
                  className="rounded-2xl border border-blue-100 bg-white px-5 py-3.5 text-base font-semibold text-slate-700 shadow-sm transition hover:bg-blue-50"
                >
                  View Route List
                </button>
              </div>
            </form>
          </div>

          <div className="space-y-8">
            <div className="rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
              <h3 className="mb-3 text-3xl font-bold text-slate-800">
                Route Preview
              </h3>
              <p className="mb-6 text-base text-slate-500">
                Review the route configuration before saving it into the system.
              </p>

              <div className="space-y-4">
                <div className="rounded-2xl border border-blue-100 bg-blue-50 p-4">
                  <p className="text-sm text-slate-500">Route</p>
                  <h4 className="mt-1 text-xl font-bold text-blue-600">
                    {form.routeName || "Not set yet"}
                  </h4>
                </div>

                <div className="rounded-2xl border border-sky-100 bg-sky-50 p-4">
                  <p className="text-sm text-slate-500">Journey</p>
                  <h4 className="mt-1 text-xl font-bold text-slate-800">
                    {form.startLocation || "Start"} to {form.endLocation || "End"}
                  </h4>
                </div>

                <div className="rounded-2xl border border-indigo-100 bg-indigo-50 p-4">
                  <p className="text-sm text-slate-500">Schedule</p>
                  <h4 className="mt-1 text-xl font-bold capitalize text-slate-800">
                    {form.recurrence}
                    {form.recurrence === "weekly" && form.days.length > 0
                      ? ` (${form.days.join(", ")})`
                      : ""}
                  </h4>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
                  <p className="text-sm text-slate-500">Capacity</p>
                  <h4 className="mt-1 text-xl font-bold text-slate-800">
                    {form.seatCapacity || "--"} seats
                  </h4>
                </div>
              </div>
            </div>

            <div className="rounded-3xl border border-blue-100 bg-white/90 p-8 shadow-[0_10px_30px_rgba(59,130,246,0.08)] backdrop-blur-sm">
              <h3 className="mb-4 text-2xl font-bold text-slate-800">
                Admin Notes
              </h3>
              <div className="space-y-4 text-sm text-slate-500">
                <p>
                  Keep route names clear and consistent so students can find
                  schedules easily.
                </p>
                <p>
                  Weekly schedules should only include the actual running days
                  for that shuttle.
                </p>
                <p>
                  Seat capacity should reflect the assigned vehicle to avoid
                  overbooking issues later.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default RouteFormAdmin;
