import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaUserPlus, FaMagic, FaArrowLeft } from "react-icons/fa";
import { addDriver } from "../api/driverApi";

const SHIFTS = ["Morning Shift", "Day Shift", "Evening Shift"];
const ROUTES = [
  "Malabe - Kaduwela",
  "Malabe - Battaramulla",
  "Malabe - Nugegoda",
  "Malabe - Maharagama",
  "Malabe - Colombo",
  "Malabe - Kandy",
];

const DEMO_DATA = {
  name: "Ruwan Dissanayake",
  licenseNumber: "B-7834521",
  contactNumber: "+94771234567",
  assignedBus: "UR-23",
  route: "Malabe - Colombo",
  shift: "Morning Shift",
};

function validate(form) {
  const errors = {};
  if (!form.name.trim()) errors.name = "Driver name is required.";
  if (!form.licenseNumber.trim()) errors.licenseNumber = "License number is required.";
  if (!form.contactNumber.trim()) {
    errors.contactNumber = "Contact number is required.";
  } else if (!/^(\+94|0)[0-9]{9}$/.test(form.contactNumber)) {
    errors.contactNumber = "Enter a valid phone number (e.g. +94771234567 or 0771234567).";
  }
  if (!form.assignedBus.trim()) errors.assignedBus = "Assigned bus is required.";
  if (!form.route) errors.route = "Route is required.";
  if (!form.shift) errors.shift = "Please select a shift.";
  return errors;
}

function AddDriver() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: "", licenseNumber: "", contactNumber: "", assignedBus: "", route: "", shift: "" });
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: "" }));
    setServerError("");
  };

  const handlePreFill = () => {
    setForm(DEMO_DATA);
    setErrors({});
    setServerError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate(form);
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setSubmitting(true);
    try {
      await addDriver(form);
      navigate("/drivers");
    } catch (err) {
      setServerError(err.response?.data?.message || "Failed to add driver. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen bg-slate-50 pb-16">
      <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6">

        {/* Back link */}
        <button onClick={() => navigate("/drivers")} className="mb-6 inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-800 transition">
          <FaArrowLeft /> Back to Drivers
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-md">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-sm uppercase tracking-widest text-yellow-600">Driver Management</p>
              <h1 className="mt-1 text-2xl font-extrabold text-slate-900 sm:text-3xl flex items-center gap-2">
                <FaUserPlus className="text-yellow-500" /> Add New Driver
              </h1>
            </div>
            <button
              type="button"
              onClick={handlePreFill}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-100 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
            >
              <FaMagic /> Pre-fill Demo
            </button>
          </div>

          {serverError && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              ✗ {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">

            {/* Driver Name */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Driver Name <span className="text-red-500">*</span></label>
              <input name="name" value={form.name} onChange={handleChange}
                placeholder="e.g. Nimal Perera"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.name ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
              {errors.name && <p className="mt-1 text-xs text-red-600">{errors.name}</p>}
            </div>

            {/* License Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">License Number <span className="text-red-500">*</span></label>
              <input name="licenseNumber" value={form.licenseNumber} onChange={handleChange}
                placeholder="e.g. B-7834521"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.licenseNumber ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
              {errors.licenseNumber && <p className="mt-1 text-xs text-red-600">{errors.licenseNumber}</p>}
            </div>

            {/* Contact Number */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
              <input name="contactNumber" value={form.contactNumber} onChange={handleChange}
                placeholder="e.g. +94771234567"
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.contactNumber ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
              {errors.contactNumber && <p className="mt-1 text-xs text-red-600">{errors.contactNumber}</p>}
            </div>

            {/* Bus & Shift row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Bus <span className="text-red-500">*</span></label>
                <input name="assignedBus" value={form.assignedBus} onChange={handleChange}
                  placeholder="e.g. UR-12"
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 ${errors.assignedBus ? "border-red-400 bg-red-50" : "border-slate-300"}`} />
                {errors.assignedBus && <p className="mt-1 text-xs text-red-600">{errors.assignedBus}</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Shift <span className="text-red-500">*</span></label>
                <select name="shift" value={form.shift} onChange={handleChange}
                  className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 bg-white ${errors.shift ? "border-red-400 bg-red-50" : "border-slate-300"}`}>
                  <option value="">Select shift</option>
                  {SHIFTS.map((s) => <option key={s}>{s}</option>)}
                </select>
                {errors.shift && <p className="mt-1 text-xs text-red-600">{errors.shift}</p>}
              </div>
            </div>

            {/* Route */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Assigned Route <span className="text-red-500">*</span></label>
              <select name="route" value={form.route} onChange={handleChange}
                className={`w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-yellow-400 bg-white ${errors.route ? "border-red-400 bg-red-50" : "border-slate-300"}`}>
                <option value="">Select a route</option>
                {ROUTES.map((r) => <option key={r}>{r}</option>)}
              </select>
              {errors.route && <p className="mt-1 text-xs text-red-600">{errors.route}</p>}
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-2">
              <button type="submit" disabled={submitting}
                className="flex-1 rounded-xl bg-yellow-500 py-3 text-sm font-bold text-white shadow hover:bg-yellow-600 disabled:opacity-60 transition">
                {submitting ? "Saving..." : "Add Driver"}
              </button>
              <button type="button" onClick={() => navigate("/drivers")}
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

export default AddDriver;
