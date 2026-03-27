import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaEdit, FaArrowLeft } from "react-icons/fa";
import { getTrip, updateTrip } from "../api/tripApi";
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
  if (!form.startTime) errors.startTime = "Start time is required.";
  if (!form.endTime) errors.endTime = "End time is required.";
  else if (form.startTime && form.endTime <= form.startTime) errors.endTime = "End time must be after start time.";
  return errors;
}

function EditTrip() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [drivers, setDrivers] = useState([]);
  const [form, setForm] = useState({ driver: "", route: "", date: "", startTime: "", endTime: "", passengers: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [tripRes, driversRes] = await Promise.all([getTrip(id), getDrivers()]);
        const t = tripRes.data;
        setForm({
          driver: t.driver?._id || t.driver || "",
          route: t.route,
          date: t.date,
          startTime: t.startTime,
          endTime: t.endTime,
          passengers: t.passengers || "",
        });
        setDrivers(driversRes.data);
      } catch {
        setServerError("Failed to load trip data.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [id]);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await updateTrip(id, form);
      navigate("/trips");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to update trip.");
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" />
    </div>
  );

  return (
    <section className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
        <button onClick={() => navigate("/trips")} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <FaArrowLeft /> Back to Trips
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-md">
          <div className="mb-6">
            <p className="text-sm uppercase tracking-widest text-yellow-600">Trip Management</p>
            <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl flex items-center gap-2">
              <FaEdit className="text-yellow-500" /> Edit Trip
            </h1>
          </div>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">✗ {serverError}</div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Driver <span className="text-red-500">*</span></label>
              <select name="driver" value={form.driver} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 bg-white ${errors.driver ? "border-red-400 bg-red-50" : "border-slate-300"}`}>
                <option value="">— Select a driver —</option>
                {drivers.map((d) => (
                  <option key={d._id} value={d._id}>{d.name} ({d.assignedBus}) — {d.status}</option>
                ))}
              </select>
              {errors.driver && <p className="mt-1 text-xs text-red-600">{errors.driver}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Route <span className="text-red-500">*</span></label>
              <select name="route" value={form.route} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 bg-white ${errors.route ? "border-red-400 bg-red-50" : "border-slate-300"}`}>
                <option value="">Select a route</option>
                {ROUTES.map((r) => <option key={r}>{r}</option>)}
              </select>
              {errors.route && <p className="mt-1 text-xs text-red-600">{errors.route}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={form.date} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.date ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
              {errors.date && <p className="mt-1 text-xs text-red-600">{errors.date}</p>}
            </div>

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

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Passengers <span className="text-slate-400 font-normal text-xs">(optional)</span></label>
              <input type="number" name="passengers" min="0" value={form.passengers} onChange={handleChange}
                className="w-full rounded-xl border border-slate-300 px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400" />
            </div>

            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white shadow hover:bg-yellow-600 disabled:opacity-60 transition">
                {submitting ? "Saving..." : "Save Changes"}
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

export default EditTrip;
