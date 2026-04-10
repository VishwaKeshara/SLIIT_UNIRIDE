import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaPlus, FaMagic, FaArrowLeft } from "react-icons/fa";
import { addTrip } from "../api/tripApi";
import { getDrivers } from "../api/driverApi";

const ROUTES = [
  "Malabe - Kaduwela",
  "Malabe - Battaramulla",
  "Malabe - Nugegoda",
  "Malabe - Maharagama",
  "Malabe - Colombo",
  "Malabe - Kandy",
];

function validate(form) {
  const errors = {};
  if (!form.driver) errors.driver = "Please select a driver.";
  if (!form.route) errors.route = "Route is required.";
  if (!form.date) errors.date = "Date is required.";
  else {
    const today = new Date();
    today.setHours(0,0,0,0);
    if (new Date(form.date) < today) errors.date = "Date cannot be in the past.";
  }
  if (!form.startTime) errors.startTime = "Start time is required.";
  if (!form.endTime) errors.endTime = "End time is required.";
  else if (form.startTime && form.endTime <= form.startTime) {
    errors.endTime = "End time must be after start time.";
  }
  return errors;
}

function AddTrip() {
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ driver: "", route: "", date: "", startTime: "", endTime: "", passengers: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    getDrivers().then((res) => setDrivers(res.data.filter((d) => d.status === "Available")));
  }, []);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handlePreFill = () => {
    const today = new Date();
    const dateStr = today.toISOString().split("T")[0];
    setForm({
      driver: drivers[0]?._id || "",
      route: "Malabe - Colombo",
      date: dateStr,
      startTime: "07:30",
      endTime: "09:00",
      passengers: "28",
    });
    setErrors({});
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await addTrip(form);
      navigate("/trips");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to create trip.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <button onClick={() => navigate("/trips")} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <FaArrowLeft /> Back to Trips
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-yellow-600">Trip Management</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl flex items-center gap-2">
                <FaPlus className="text-yellow-500" /> Create Trip
              </h1>
            </div>
            <button type="button" onClick={handlePreFill}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition">
              <FaMagic /> Pre-fill Demo
            </button>
          </div>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">✗ {serverError}</div>
          )}

          {drivers.length === 0 && (
            <div className="mb-4 rounded-xl bg-yellow-50 border border-yellow-200 px-4 py-3 text-sm text-yellow-700">
              ⚠ No available drivers. Please add a driver or wait for a driver to complete their current trip.
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Driver */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Driver <span className="text-red-500">*</span></label>
              <select name="driver" value={form.driver} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 bg-white ${errors.driver ? "border-red-400 bg-red-50" : "border-slate-300"}`}>
                <option value="">— Select an available driver —</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.assignedBus}) — {d.route}</option>
                ))}
              </select>
              {errors.driver && <p className="mt-1 text-xs text-red-600">{errors.driver}</p>}
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Route <span className="text-red-500">*</span></label>
              <select name="route" value={form.route} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 bg-white ${errors.route ? "border-red-400 bg-red-50" : "border-slate-300"}`}>
                <option value="">Select a route</option>
                {ROUTES.map((r) => <option key={r}>{r}</option>)}
              </select>
              {errors.route && <p className="mt-1 text-xs text-red-600">{errors.route}</p>}
            </div>

            {/* Date */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.date ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>

            {/* Times */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Start Time <span className="text-red-500">*</span></label>
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.startTime ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
                {errors.startTime && <p className="mt-1 text-xs text-red-600">{errors.startTime}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">End Time <span className="text-red-500">*</span></label>
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.endTime ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
                {errors.endTime && <p className="mt-1 text-xs text-red-600">{errors.endTime}</p>}
              </div>
            </div>

            {/* Passengers (optional) */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Passengers <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
              <input type="number" name="passengers" min="0" value={form.passengers} onChange={handleChange}
                placeholder="e.g. 30"
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white shadow hover:bg-yellow-600 disabled:opacity-60 transition">
                {submitting ? "Creating..." : "Create Trip"}
              </button>
              <button type="button" onClick={() => navigate("/trips")}
                className="rounded-xl border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-600 hover:bg-slate-100 transition">
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}

export default AddTrip;
