import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  MapPin,
  Route,
  Users,
  Clock,
  Repeat,
  CalendarDays,
  BusFront,
} from "lucide-react";
import heroBus from "../../assets/hero-bus.jpg.jpg";

function RouteForm() {
  const navigate = useNavigate();

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

    if (!form.routeName.trim()) {
      newErrors.routeName = "Route name is required";
    }

    if (!form.startLocation.trim()) {
      newErrors.startLocation = "Start location is required";
    }

    if (!form.endLocation.trim()) {
      newErrors.endLocation = "End location is required";
    }

    if (
      form.startLocation.trim() &&
      form.endLocation.trim() &&
      form.startLocation.trim().toLowerCase() === form.endLocation.trim().toLowerCase()
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

    if (!form.startTime) {
      newErrors.startTime = "Start time is required";
    }

    if (form.recurrence === "weekly" && form.days.length === 0) {
      newErrors.days = "Please select at least one day";
    }

    return newErrors;
  };

  const toggleDay = (day) => {
    if (form.days.includes(day)) {
      setForm({
        ...form,
        days: form.days.filter((d) => d !== day),
      });
    } else {
      setForm({
        ...form,
        days: [...form.days, day],
      });
    }
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

      alert("✅ Route added successfully");

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
      alert("❌ Error adding route");
    }
  };

  const inputWrapperClass = (field) =>
    `mt-2 flex items-center rounded-xl border bg-white/90 px-4 py-3 shadow-sm transition-all duration-200 ${
      errors[field]
        ? "border-red-500 ring-2 ring-red-200"
        : "border-gray-200 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-200"
    }`;

  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-no-repeat"
      style={{ backgroundImage: `url(${heroBus})` }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/55 backdrop-blur-[1px]"></div>

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid w-full max-w-6xl overflow-hidden rounded-3xl bg-white/10 shadow-2xl backdrop-blur-md lg:grid-cols-2">
          {/* Left content section */}
          <div className="hidden flex-col justify-center bg-gradient-to-br from-blue-900/80 to-indigo-900/70 p-10 text-white lg:flex">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-white/15">
              <BusFront size={32} />
            </div>

            <h1 className="text-4xl font-bold leading-tight">
              Smart Shuttle Route
              <br />
              Management
            </h1>

            <p className="mt-4 text-base leading-7 text-blue-100">
              Create and manage shuttle routes with better scheduling,
              recurrence handling, and seat capacity planning for a more
              organized university transport system.
            </p>

            <div className="mt-8 space-y-4">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">Efficient Route Setup</p>
                <p className="mt-1 text-sm text-blue-100">
                  Add one-time, daily, or weekly shuttle routes quickly.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">Better Scheduling</p>
                <p className="mt-1 text-sm text-blue-100">
                  Plan routes with accurate departure times and weekly day
                  selection.
                </p>
              </div>

              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <p className="text-sm font-semibold">Operational Control</p>
                <p className="mt-1 text-sm text-blue-100">
                  Keep transport operations smooth with capacity limits and
                  clear route details.
                </p>
              </div>
            </div>
          </div>

          {/* Right form section */}
          <div className="bg-white/95 p-6 sm:p-8 md:p-10">
            <div className="mb-8">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-blue-100 px-4 py-2 text-sm font-medium text-blue-700">
                <BusFront size={16} />
                Shuttle Administration
              </div>

              <h2 className="text-3xl font-bold text-gray-800">
                Add Shuttle Route
              </h2>
              <p className="mt-2 text-sm text-gray-500">
                Fill in the route information below to create a new shuttle
                schedule.
              </p>
            </div>

            {submitError && (
              <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Route Name */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
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
                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="Ex: Malabe - Colombo"
                  />
                </div>
                {errors.routeName && (
                  <p className="mt-2 text-sm text-red-500">{errors.routeName}</p>
                )}
              </div>

              {/* Start Location */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
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
                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="Enter starting point"
                  />
                </div>
                {errors.startLocation && (
                  <p className="mt-2 text-sm text-red-500">
                    {errors.startLocation}
                  </p>
                )}
              </div>

              {/* End Location */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
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
                    className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
                    placeholder="Enter destination"
                  />
                </div>
                {errors.endLocation && (
                  <p className="mt-2 text-sm text-red-500">{errors.endLocation}</p>
                )}
              </div>

              {/* Seat Capacity + Start Time */}
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className="text-sm font-semibold text-gray-700">
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
                      className="w-full bg-transparent text-sm text-gray-700 outline-none placeholder:text-gray-400"
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
                  <label className="text-sm font-semibold text-gray-700">
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
                      className="w-full bg-transparent text-sm text-gray-700 outline-none"
                    />
                  </div>
                  {errors.startTime && (
                    <p className="mt-2 text-sm text-red-500">
                      {errors.startTime}
                    </p>
                  )}
                </div>
              </div>

              {/* Recurrence */}
              <div>
                <label className="text-sm font-semibold text-gray-700">
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
                    className="w-full bg-transparent text-sm text-gray-700 outline-none"
                  >
                    <option value="none">One Time</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                  </select>
                </div>
              </div>

              {/* Weekly Days */}
              {form.recurrence === "weekly" && (
                <div className="rounded-2xl border border-gray-200 bg-gray-50 p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <CalendarDays className="text-indigo-600" size={18} />
                    <label className="text-sm font-semibold text-gray-700">
                      Select Weekly Days
                    </label>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {weekDays.map((day) => (
                      <button
                        type="button"
                        key={day}
                        onClick={() => toggleDay(day)}
                        className={`rounded-full border px-4 py-2 text-sm font-medium transition-all duration-200 ${
                          form.days.includes(day)
                            ? "border-blue-600 bg-blue-600 text-white shadow-md"
                            : "border-gray-300 bg-white text-gray-700 hover:border-blue-400 hover:text-blue-600"
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

              {/* Submit button */}
              <button
                type="submit"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 px-4 py-3 text-sm font-semibold text-white shadow-lg transition duration-300 hover:from-blue-700 hover:to-indigo-800 hover:shadow-xl"
              >
                ➕ Add Route
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default RouteForm;
