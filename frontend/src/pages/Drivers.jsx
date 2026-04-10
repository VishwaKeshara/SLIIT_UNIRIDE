import React, { useEffect, useState, useCallback } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import {
  FaPhoneAlt, FaRoute, FaIdBadge, FaPlus, FaEdit, FaTrash,
  FaBus, FaPlay, FaStop, FaExclamationTriangle, FaTimes,
  FaMagic, FaSync, FaCalendarAlt, FaClock, FaUser, FaClipboardList
} from "react-icons/fa";
import { getDrivers, addDriver, updateDriver, deleteDriver } from "../api/driverApi";
import { getTrips, addTrip, updateTrip, updateTripStatus, deleteTrip } from "../api/tripApi";

// ─── Constants ─────────────────────────────────────────────────────────────
const SHIFTS = ["Morning Shift", "Day Shift", "Evening Shift"];
const ROUTES = [
  "Malabe - Kaduwela", "Malabe - Battaramulla", "Malabe - Nugegoda",
  "Malabe - Maharagama", "Malabe - Colombo", "Malabe - Kandy",
];
const DEMO_DRIVERS = [
  { name: "Ruwan Dissanayake", licenseNumber: "B1234567", contactNumber: "0771234567", assignedBus: "UR-23", route: "Malabe - Colombo", shift: "Morning Shift" },
  { name: "Kasun Perera",       licenseNumber: "C7654321", contactNumber: "0712345678", assignedBus: "UR-07", route: "Malabe - Kaduwela", shift: "Day Shift" },
];
let demoDriverIdx = 0;

// ─── Validators ────────────────────────────────────────────────────────────
function validateDriver(f) {
  const e = {};
  if (!f.name.trim())            e.name           = "Driver name is required.";
  else if (!/^[A-Za-z\s]+$/.test(f.name)) e.name  = "Name can only contain letters.";

  if (!f.licenseNumber.trim())   e.licenseNumber  = "License number is required.";
  else if (f.licenseNumber.length !== 8) e.licenseNumber = "License Number must be exactly 8 characters.";

  if (!f.contactNumber.trim())   e.contactNumber  = "Contact number is required.";
  else if (!/^07[0-9]{8}$/.test(f.contactNumber))
                                  e.contactNumber  = "Must be a 10-digit number starting with 07 (e.g., 0771234567)";
  
  if (!f.assignedBus.trim())     e.assignedBus    = "Assigned bus is required.";
  if (!f.route)                  e.route          = "Route is required.";
  if (!f.shift)                  e.shift          = "Shift is required.";
  return e;
}

function validateTrip(f) {
  const e = {};
  if (!f.driver)                 e.driver     = "Driver is required.";
  if (!f.route)                  e.route      = "Route is required.";
  if (!f.date)                   e.date       = "Date is required.";
  else {
    const today = new Date().toISOString().split("T")[0];
    if (f.date < today)          e.date       = "Date cannot be in the past.";
  }
  
  if (!f.startTime)              e.startTime  = "Start time is required.";
  if (!f.endTime)                e.endTime    = "End time is required.";
  else if (f.startTime >= f.endTime) e.endTime = "End time must be after start time.";
  
  if (f.status === "Delayed" && !f.delayReason?.trim()) {
    e.delayReason = "Delay reason is required.";
  }
  return e;
}

// ─── Status badge colours (Updated for Dark Theme) ──────────────────────────
const driverStatusCls = { 
  Available: "bg-green-400/10 text-green-400", 
  "On Trip": "bg-orange-400/10 text-orange-400" 
};
const tripStatusCls = { 
  Scheduled: "bg-blue-400/10 text-blue-400", 
  Ongoing: "bg-orange-400/10 text-orange-400", 
  Completed: "bg-emerald-400/10 text-emerald-400", 
  Delayed: "bg-red-400/10 text-red-400" 
};

export default function Drivers() {
  // ── UI State ─────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState("drivers"); // "drivers" or "trips"
  const [banner, setBanner] = useState({ type: "", msg: "" });

  const flash = (type, msg, ms = 3500) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner({ type: "", msg: "" }), ms);
  };

  // ── Drivers State ────────────────────────────────────────────────────────
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(true);

  // Driver modal
  const [driverModal, setDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({ name:"", licenseNumber:"", contactNumber:"", assignedBus:"", route:"", shift:"" });
  const [driverErrors, setDriverErrors] = useState({});
  const [driverSrvErr, setDriverSrvErr] = useState("");
  const [driverSaving, setDriverSaving] = useState(false);

  // ── Trips State ──────────────────────────────────────────────────────────
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);

  // Trip modal
  const [tripModal, setTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripForm, setTripForm] = useState({ driver:"", route:"", date:"", startTime:"", endTime:"", passengers:"" });
  const [tripErrors, setTripErrors] = useState({});
  const [tripSrvErr, setTripSrvErr] = useState("");
  const [tripSaving, setTripSaving] = useState(false);

  // Delay modal
  const [delayModal, setDelayModal] = useState(null); // { tripId }
  const [delayReason, setDelayReason] = useState("");
  const [delayError, setDelayError] = useState("");
  const [delaySaving, setDelaySaving] = useState(false);

  // ── Load Data ────────────────────────────────────────────────────────────
  const loadDrivers = useCallback(async () => {
    try { setDriversLoading(true); const res = await getDrivers(); setDrivers(res.data); }
    catch { flash("error", "Failed to load drivers."); }
    finally { setDriversLoading(false); }
  }, []);

  const loadTrips = useCallback(async () => {
    try { setTripsLoading(true); const res = await getTrips(); setTrips(res.data); }
    catch { flash("error", "Failed to load trips."); }
    finally { setTripsLoading(false); }
  }, []);

  useEffect(() => {
    loadDrivers();
    if (activeTab === "trips" || activeTab === "analytics") loadTrips();
  }, [activeTab, loadDrivers, loadTrips]);

  const refreshAction = () => {
    if (activeTab === "drivers") loadDrivers();
    if (activeTab === "trips" || activeTab === "analytics") { loadDrivers(); loadTrips(); }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // DRIVER CRUD LOGIC
  // ══════════════════════════════════════════════════════════════════════════
  const openAddDriver = () => {
    setEditingDriver(null);
    setDriverForm({ name:"", licenseNumber:"", contactNumber:"", assignedBus:"", route:"", shift:"" });
    setDriverErrors({}); setDriverSrvErr(""); setDriverModal(true);
  };

  const openEditDriver = (d) => {
    setEditingDriver(d);
    setDriverForm({ name: d.name, licenseNumber: d.licenseNumber, contactNumber: d.contactNumber, assignedBus: d.assignedBus, route: d.route, shift: d.shift });
    setDriverErrors({}); setDriverSrvErr(""); setDriverModal(true);
  };

  const handleDriverFormChange = (e) => {
    const { name, value } = e.target;
    const updated = { ...driverForm, [name]: value };
    setDriverForm(updated);
    setDriverErrors(validateDriver(updated));
    setDriverSrvErr("");
  };

  const preFillDriver = () => {
    const d = DEMO_DRIVERS[demoDriverIdx % DEMO_DRIVERS.length];
    setDriverForm(d);
    setDriverErrors(validateDriver(d));
    demoDriverIdx++; setDriverSrvErr("");
  };

  const submitDriver = async (e) => {
    e.preventDefault();
    const errs = validateDriver(driverForm);
    if (Object.keys(errs).length) { setDriverErrors(errs); return; }
    setDriverSaving(true);
    try {
      if (editingDriver) {
        const res = await updateDriver(editingDriver._id, driverForm);
        setDrivers(drivers.map((d) => d._id === editingDriver._id ? res.data : d));
        flash("success", `Driver "${res.data.name}" updated successfully.`);
      } else {
        const res = await addDriver(driverForm);
        setDrivers([res.data, ...drivers]);
        flash("success", `Driver "${res.data.name}" added successfully.`);
      }
      setDriverModal(false);
      setDriverForm({ name:"", licenseNumber:"", contactNumber:"", assignedBus:"", route:"", shift:"" });
      setDriverErrors({});
    } catch (err) {
      setDriverSrvErr(err.response?.data?.message || "An error occurred while saving driver.");
    } finally {
      setDriverSaving(false);
    }
  };

  const removeDriver = async (id, name) => {
    if (!window.confirm(`Delete driver "${name}"?`)) return;
    try {
      await deleteDriver(id);
      setDrivers(drivers.filter((d) => d._id !== id));
      flash("success", `Driver deleted.`);
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to delete driver.");
    }
  };

  // ══════════════════════════════════════════════════════════════════════════
  // TRIP CRUD & ACTIONS LOGIC
  // ══════════════════════════════════════════════════════════════════════════
  const openCreateTrip = () => {
    setEditingTrip(null);
    const today = new Date().toISOString().split("T")[0];
    setTripForm({ driver: "", route: "", date: today, startTime: "", endTime: "", passengers: "" });
    setTripErrors({}); setTripSrvErr(""); setTripModal(true);
  };

  const openEditTrip = (t) => {
    setEditingTrip(t);
    setTripForm({
      driver: t.driver?._id || t.driver, route: t.route, date: t.date,
      startTime: t.startTime, endTime: t.endTime, passengers: t.passengers || ""
    });
    setTripErrors({}); setTripSrvErr(""); setTripModal(true);
  };

  const handleTripFormChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...tripForm, [name]: value };
    
    // Auto-fill route from driver
    if (name === "driver" && value) {
      const driver = drivers.find(d => d._id === value);
      if (driver?.route) updated.route = driver.route;
    }
    
    setTripForm(updated);
    setTripErrors(validateTrip(updated));
    setTripSrvErr("");
  };

  const preFillTrip = () => {
    const today = new Date().toISOString().split("T")[0];
    const avail = drivers.find(d => d.status === "Available");
    const dRoute = avail?.route || "Malabe - Colombo";
    const t = { 
      driver: avail ? avail._id : "", 
      route: dRoute, 
      date: today, 
      startTime: "07:30", 
      endTime: "09:00", 
      passengers: "28" 
    };
    setTripForm(t);
    setTripErrors(validateTrip(t));
    setTripSrvErr("");
  };

  const submitTrip = async (e) => {
    e.preventDefault();
    const errs = validateTrip(tripForm);
    if (Object.keys(errs).length) { setTripErrors(errs); return; }
    setTripSaving(true);
    try {
      if (editingTrip) {
        await updateTrip(editingTrip._id, tripForm);
        flash("success", "Trip updated successfully.");
      } else {
        await addTrip(tripForm);
        flash("success", "Trip created successfully.");
      }
      setTripModal(false);
      setTripForm({ driver: "", route: "", date: "", startTime: "", endTime: "", passengers: "" });
      setTripErrors({});
      loadTrips();
    } catch (err) {
      setTripSrvErr(err.response?.data?.message || "Failed to save trip. Check for driver availability.");
    } finally {
      setTripSaving(false);
    }
  };

  const removeTrip = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try {
      await deleteTrip(id);
      setTrips(trips.filter((t) => t._id !== id));
      flash("success", "Trip deleted.");
    } catch (err) {
      flash("error", err.response?.data?.message || "Cannot delete this trip.");
    }
  };

  const changeStatus = async (tripId, status, reason = "") => {
    try {
      const res = await updateTripStatus(tripId, { status, delayReason: reason });
      const updatedTrip = res.data;
      setTrips(trips.map(t => t._id === tripId ? { ...t, status: updatedTrip.status, delayReason: updatedTrip.delayReason } : t));

      // sync driver status
      if (status === "Ongoing" || status === "Completed" || status === "Delayed") {
        const newDStatus = status === "Ongoing" ? "On Trip" : "Available";
        setDrivers(drivers.map(d => d._id === updatedTrip.driver._id ? { ...d, status: newDStatus } : d));
      }
      flash("success", `Trip status changed to "${status}".`);
    } catch (err) {
      flash("error", err.response?.data?.message || "Failed to update status.");
    }
  };

  const handleDelayConfirm = async () => {
    if (!delayReason.trim()) { setDelayError("Delay reason is required."); return; }
    setDelaySaving(true);
    try {
      await changeStatus(delayModal.tripId, "Delayed", delayReason);
      setDelayModal(null);
    } finally { setDelaySaving(false); }
  };

  // ── Analytics Data (computed from existing frontend state) ──────────────
  const driverShiftCounts = drivers.reduce(
    (acc, driver) => {
      const shift = driver?.shift;
      if (shift === "Morning Shift") acc.Morning += 1;
      else if (shift === "Day Shift") acc.Day += 1;
      else if (shift === "Evening Shift") acc.Evening += 1;
      return acc;
    },
    { Morning: 0, Day: 0, Evening: 0 }
  );

  const driverData = [
    { name: "Morning", value: driverShiftCounts.Morning },
    { name: "Day", value: driverShiftCounts.Day },
    { name: "Evening", value: driverShiftCounts.Evening },
  ];

  const tripStatusCounts = trips.reduce(
    (acc, trip) => {
      const status = trip?.status;
      if (status === "Completed") acc.Completed += 1;
      else if (status === "Ongoing") acc.Ongoing += 1;
      else if (status === "Delayed") acc.Delayed += 1;
      return acc;
    },
    { Completed: 0, Ongoing: 0, Delayed: 0 }
  );

  const tripData = [
    { status: "Completed", count: tripStatusCounts.Completed },
    { status: "Ongoing", count: tripStatusCounts.Ongoing },
    { status: "Delayed", count: tripStatusCounts.Delayed },
  ];

  const totalDrivers = drivers.length;
  const totalTrips = trips.length;

  // Driver state breakdown for the analytics cards
  const driverStatusCounts = drivers.reduce(
    (acc, driver) => {
      const status = driver?.status;
      if (status === "Available") acc.Available += 1;
      else if (status === "On Trip") acc.OnTrip += 1;
      return acc;
    },
    { Available: 0, OnTrip: 0 }
  );

  // Most frequent routes based on existing trips state
  const routeCounts = trips.reduce((acc, trip) => {
    const route = trip?.route;
    if (!route) return acc;
    acc[route] = (acc[route] || 0) + 1;
    return acc;
  }, {});

  const topRoutes = Object.entries(routeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);

  const ANALYTICS_PIE_COLORS = {
    Morning: "#f97316", // orange-500
    Day: "#fbbf24", // yellow-400
    Evening: "#10b981", // emerald-400
  };

  const ANALYTICS_BAR_COLORS = {
    Completed: "#10b981", // emerald-400
    Ongoing: "#f97316", // orange-500
    Delayed: "#ef4444", // red-500
  };

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] pb-20 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* ── Header & Tabs ── */}
        <div className="rounded-3xl bg-white/10 backdrop-blur-md p-6 shadow-2xl md:px-10 md:py-8 border border-white/20">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-orange-400 font-bold mb-2">Workspace</p>
              <h1 className="text-3xl font-extrabold text-white sm:text-4xl">Driver & Trip Dashboard</h1>
              <p className="mt-2 text-slate-300 max-w-2xl">Manage your personnel, arrange trip schedules, and track live statuses.</p>
            </div>
            
            <div className="flex gap-2 p-1.5 bg-black/20 rounded-xl shrink-0 border border-white/10 shadow-inner">
              <button onClick={() => setActiveTab("drivers")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "drivers" ? "bg-orange-500 text-white shadow-lg" : "text-slate-300 hover:text-white"}`}>
                <FaUser /> Drivers
              </button>
              <button onClick={() => setActiveTab("trips")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "trips" ? "bg-orange-500 text-white shadow-lg" : "text-slate-300 hover:text-white"}`}>
                <FaRoute /> Trips
              </button>
              <button onClick={() => setActiveTab("analytics")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "analytics" ? "bg-orange-500 text-white shadow-lg" : "text-slate-300 hover:text-white"}`}>
                <FaClipboardList /> Analytics
              </button>
            </div>
          </div>
        </div>

        {/* ── Controls Row ── */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            {activeTab === "drivers" ? (
              <button onClick={openAddDriver} className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-orange-600 transition ring-offset-2 ring-offset-[#123B57] active:scale-95">
                <FaPlus /> Add Driver
              </button>
            ) : (
              <button onClick={openCreateTrip} className="flex items-center gap-2 rounded-xl bg-orange-500 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-orange-600 transition ring-offset-2 ring-offset-[#123B57] active:scale-95">
                <FaPlus /> Create Trip
              </button>
            )}
            <button onClick={refreshAction} className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/5 px-5 py-2.5 text-sm font-semibold text-white hover:bg-white/10 transition shadow-sm backdrop-blur-sm">
              <FaSync className={(activeTab === "drivers" ? driversLoading : tripsLoading) ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {banner.msg && (
            <div className={`rounded-xl border px-4 py-2.5 text-sm font-semibold flex items-center gap-2 animate-in slide-in-from-top duration-300
              ${banner.type === "success" ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400" : "bg-red-500/10 border-red-500/30 text-red-400"}`}>
              {banner.type === "success" ? "✓" : "✗"} {banner.msg}
            </div>
          )}
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 1: DRIVER MANAGEMENT
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "drivers" && (
          <div className="mt-8 animate-in fade-in duration-300">
            {driversLoading ? (
              <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>
            ) : drivers.length === 0 ? (
              <p className="text-center text-slate-300 py-12 bg-white/5 rounded-3xl border border-white/10 shadow-sm backdrop-blur-md">No drivers found. Click <strong>Add Driver</strong> to begin.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {drivers.map(driver => (
                  <div key={driver._id} className="group rounded-3xl bg-white/10 p-6 shadow-2xl border border-white/10 backdrop-blur-md transition hover:scale-[1.02] hover:bg-white/15 flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-orange-500/20 text-xl font-bold text-orange-400 shadow-inner border border-orange-500/30">
                        {driver.name.split(" ").map(p => p[0]).join("")}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold border ${driverStatusCls[driver.status] || "bg-slate-800 text-slate-400 border-slate-700"}`}>
                        {driver.status}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-white group-hover:text-orange-400 transition-colors uppercase tracking-tight">{driver.name}</h2>
                    <p className="text-sm font-medium text-slate-400 mt-0.5">{driver.shift}</p>

                    <div className="mt-5 space-y-2.5 flex-1 p-4 bg-black/20 rounded-2xl border border-white/5">
                      <p className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                        <FaRoute className="text-orange-500" /> {driver.route}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                        <FaIdBadge className="text-orange-500" /> Bus: {driver.assignedBus}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-slate-300 font-medium">
                        <FaPhoneAlt className="text-orange-500" /> {driver.contactNumber}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button onClick={() => openEditDriver(driver)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-bold text-white hover:bg-white/15 hover:border-orange-500/50 transition active:scale-95">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => removeDriver(driver._id, driver.name)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border border-red-500/20 bg-red-500/5 py-2 text-xs font-bold text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition active:scale-95">
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════════
            TAB 2: TRIP MANAGEMENT
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "trips" && (
          <div className="mt-8 animate-in fade-in duration-300 space-y-4">
            {tripsLoading ? (
               <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" /></div>
            ) : trips.length === 0 ? (
               <p className="text-center text-slate-300 py-12 bg-white/5 rounded-3xl border border-white/10 shadow-sm backdrop-blur-md">No trips scheduled. Click <strong>Create Trip</strong> to arrange one.</p>
            ) : (
              trips.map(trip => (
                <div key={trip._id} className={`flex flex-col lg:flex-row items-center justify-between gap-5 rounded-3xl bg-white/10 p-5 pr-6 shadow-2xl border backdrop-blur-md transition hover:bg-white/15
                  ${trip.status === "Ongoing" ? "border-orange-500/50" : trip.status === "Delayed" ? "border-red-500/50" : "border-white/10"}`}>
                  
                  {/* Left block: driver & status */}
                  <div className="flex w-full lg:w-1/4 items-center gap-4 border-b lg:border-b-0 lg:border-r border-white/10 pb-4 lg:pb-0 pr-4">
                    <div className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-lg shadow-inner border border-white/10 ${trip.status === "Completed" ? "bg-emerald-500/20 text-emerald-400" : "bg-white/5 text-slate-400"}`}>
                      {trip.status === "Completed" ? "✓" : <FaClipboardList />}
                    </div>
                    <div>
                      <h3 className="font-bold text-white">{trip.driver?.name || "Unknown Driver"}</h3>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5 uppercase tracking-tighter"><FaBus /> {trip.driver?.assignedBus}</p>
                    </div>
                  </div>

                  {/* Middle block: Trip details */}
                  <div className="flex w-full lg:flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-3">
                       <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider border ${tripStatusCls[trip.status]}`}>{trip.status}</span>
                       <span className="font-bold text-white text-sm uppercase tracking-wide">{trip.route}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-300 pl-1 py-1">
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-orange-500"/> {trip.date}</span>
                      <span className="flex items-center gap-1.5"><FaClock className="text-orange-500"/> {trip.startTime} – {trip.endTime}</span>
                      {trip.passengers > 0 && <span className="flex items-center gap-1.5"><FaUser className="text-orange-500"/> {trip.passengers} pax</span>}
                    </div>
                    {trip.delayReason && <p className="text-xs text-red-400 bg-red-500/10 rounded pl-2.5 py-1 font-semibold border-l-4 border-red-500 w-max pr-3">Delay: {trip.delayReason}</p>}
                  </div>

                  {/* Right block: Actions */}
                  <div className="flex w-full lg:w-auto flex-wrap gap-2 shrink-0 pt-3 lg:pt-0 justify-end">
                     {trip.status === "Scheduled" && (
                       <button onClick={() => changeStatus(trip._id, "Ongoing")} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-orange-500 py-2 lg:py-1.5 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition active:scale-95">
                         <FaPlay /> Start
                       </button>
                     )}
                      {trip.status === "Ongoing" && (
                        <button onClick={() => changeStatus(trip._id, "Completed")} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-emerald-500 py-2 lg:py-1.5 px-4 text-xs font-bold text-white shadow-lg shadow-emerald-500/20 hover:bg-emerald-600 transition active:scale-95">
                          <FaStop /> End
                        </button>
                      )}
                      {trip.status === "Delayed" && (
                        <button onClick={() => changeStatus(trip._id, "Ongoing")} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-orange-500 py-2 lg:py-1.5 px-4 text-xs font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 transition active:scale-95">
                          <FaPlay /> Resume
                        </button>
                      )}
                      {(trip.status === "Scheduled" || trip.status === "Ongoing") && (
                        <button onClick={() => { setDelayModal({ tripId: trip._id }); setDelayReason(""); setDelayError(""); }} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-red-500/10 text-red-400 border border-red-500/30 py-2 lg:py-1.5 px-4 text-xs font-bold hover:bg-red-500/20 transition active:scale-95">
                          <FaExclamationTriangle /> Delay
                        </button>
                      )}
                      <button onClick={() => openEditTrip(trip)} className="flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-400 p-2.5 hover:text-orange-400 hover:border-orange-500/50 hover:bg-white/10 transition active:scale-90">
                        <FaEdit />
                      </button>
                      {trip.status !== "Ongoing" && (
                        <button onClick={() => removeTrip(trip._id)} className="flex items-center justify-center rounded-xl bg-white/5 border border-white/10 text-slate-500 p-2.5 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/50 transition active:scale-90">
                          <FaTrash />
                        </button>
                      )}
                   </div>
                 </div>
               ))
             )}
           </div>
         )}
 
        {/* ═══════════════════════════════════════════════════════════════════
            TAB 3: ANALYTICS
        ═══════════════════════════════════════════════════════════════════ */}
        {activeTab === "analytics" && (
          <div className="mt-8 animate-in fade-in duration-300 space-y-6">
            {(driversLoading || tripsLoading) ? (
              <div className="flex justify-center py-12">
                <div className="h-10 w-10 animate-spin rounded-full border-4 border-orange-500 border-t-transparent" />
              </div>
            ) : (
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Driver Analytics */}
                <div className="rounded-3xl bg-white/10 p-6 shadow-2xl border border-white/10 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-white mb-4">Driver Analytics</h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Total Drivers</p>
                      <p className="mt-2 text-3xl font-extrabold text-white">{totalDrivers}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Available</p>
                      <p className="mt-2 text-3xl font-extrabold text-emerald-400">{driverStatusCounts.Available}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">On Trip</p>
                      <p className="mt-2 text-3xl font-extrabold text-orange-400">{driverStatusCounts.OnTrip}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold mb-2">Shift Distribution</p>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-200 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ANALYTICS_PIE_COLORS.Morning }} />
                            Morning
                          </span>
                          <span className="font-bold text-slate-100">{driverShiftCounts.Morning}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-200 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ANALYTICS_PIE_COLORS.Day }} />
                            Day
                          </span>
                          <span className="font-bold text-slate-100">{driverShiftCounts.Day}</span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-slate-200 flex items-center gap-2">
                            <span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: ANALYTICS_PIE_COLORS.Evening }} />
                            Evening
                          </span>
                          <span className="font-bold text-slate-100">{driverShiftCounts.Evening}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-6 lg:grid-cols-2 items-center">
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={driverData}
                            dataKey="value"
                            nameKey="name"
                            cx="50%"
                            cy="50%"
                            outerRadius={95}
                            label
                          >
                            {driverData.map((entry) => (
                              <Cell key={entry.name} fill={ANALYTICS_PIE_COLORS[entry.name]} />
                            ))}
                          </Pie>
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 12,
                              color: "#fff",
                            }}
                          />
                          <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-3xl bg-black/20 border border-white/10 p-5">
                      <p className="text-sm font-bold text-slate-100">Shift Breakdown</p>
                      <div className="mt-4 space-y-3">
                        {driverData.map((entry) => (
                          <div key={entry.name} className="flex items-center justify-between gap-4">
                            <span className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold flex items-center gap-2">
                              <span
                                className="inline-block w-2 h-2 rounded-full"
                                style={{ backgroundColor: ANALYTICS_PIE_COLORS[entry.name] }}
                              />
                              {entry.name}
                            </span>
                            <span className="text-base font-extrabold text-white">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Trip Analytics */}
                <div className="rounded-3xl bg-white/10 p-6 shadow-2xl border border-white/10 backdrop-blur-md">
                  <h2 className="text-xl font-bold text-white mb-4">Trip Analytics</h2>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Total Trips</p>
                      <p className="mt-2 text-3xl font-extrabold text-white">{totalTrips}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Completed</p>
                      <p className="mt-2 text-3xl font-extrabold text-emerald-400">{tripStatusCounts.Completed}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Ongoing</p>
                      <p className="mt-2 text-3xl font-extrabold text-orange-400">{tripStatusCounts.Ongoing}</p>
                    </div>
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-4">
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300 font-bold">Delayed</p>
                      <p className="mt-2 text-3xl font-extrabold text-red-400">{tripStatusCounts.Delayed}</p>
                    </div>
                  </div>

                  <div className="grid gap-6">
                    <div className="h-[260px] w-full">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={tripData} margin={{ top: 20, right: 10, left: 10, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                          <XAxis
                            dataKey="status"
                            tick={{ fill: "#e5e7eb", fontSize: 12 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                            tickLine={false}
                          />
                          <YAxis
                            tick={{ fill: "#e5e7eb", fontSize: 12 }}
                            axisLine={{ stroke: "rgba(255,255,255,0.2)" }}
                            tickLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "rgba(15, 23, 42, 0.95)",
                              border: "1px solid rgba(255,255,255,0.12)",
                              borderRadius: 12,
                              color: "#fff",
                            }}
                          />
                          <Legend wrapperStyle={{ color: "#e5e7eb" }} />
                          <Bar dataKey="count">
                            {tripData.map((entry) => (
                              <Cell key={entry.status} fill={ANALYTICS_BAR_COLORS[entry.status]} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    <div className="rounded-3xl bg-black/20 border border-white/10 p-5">
                      <p className="text-sm font-bold text-slate-100">Most Frequent Routes</p>
                      <div className="mt-4 space-y-3 max-h-[170px] overflow-auto pr-1">
                        {topRoutes.length ? (
                          topRoutes.map(([route, count]) => (
                            <div key={route} className="flex items-center justify-between gap-4">
                              <p className="text-xs text-slate-300 truncate">{route}</p>
                              <p className="text-xs font-extrabold text-orange-400">{count}</p>
                            </div>
                          ))
                        ) : (
                          <p className="text-xs text-slate-500">—</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

       </div>
 
       {/* Add / Edit Driver Modal */}
      {driverModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2233]/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-[#123B57] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/10">
            <button onClick={() => setDriverModal(false)} className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"><FaTimes /></button>

            <div className="mb-6 flex items-center justify-between pr-10">
              <h2 className="text-2xl font-black text-white">{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              {!editingDriver && (
                <button type="button" onClick={preFillDriver} className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 transition">
                  <FaMagic /> Demo
                </button>
              )}
            </div>

            {driverSrvErr && <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm font-semibold text-red-400">⚠ {driverSrvErr}</div>}

            <form onSubmit={submitDriver} className="space-y-4">
              <Field label="Driver Name" required error={driverErrors.name}>
                <input name="name" value={driverForm.name} onChange={handleDriverFormChange} placeholder="Enter driver name" className={inputCls(driverErrors.name)} />
              </Field>
              <Field label="License Number" required error={driverErrors.licenseNumber}>
                <input name="licenseNumber" value={driverForm.licenseNumber} onChange={handleDriverFormChange} placeholder="Enter 8-digit license" maxLength={8} className={inputCls(driverErrors.licenseNumber)} />
              </Field>
              <Field label="Contact Number" required error={driverErrors.contactNumber}>
                <input name="contactNumber" value={driverForm.contactNumber} onChange={handleDriverFormChange} className={inputCls(driverErrors.contactNumber)} placeholder="e.g. 0771234567" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Assigned Bus" required error={driverErrors.assignedBus}>
                  <input name="assignedBus" value={driverForm.assignedBus} onChange={handleDriverFormChange} placeholder="e.g. UR-12" className={inputCls(driverErrors.assignedBus)} />
                </Field>
                <Field label="Shift" required error={driverErrors.shift}>
                  <select name="shift" value={driverForm.shift} onChange={handleDriverFormChange} className={inputCls(driverErrors.shift) + " bg-[#0A2233]"}>
                    <option value="">Select shift</option>
                    {SHIFTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Route" required error={driverErrors.route}>
                <select name="route" value={driverForm.route} onChange={handleDriverFormChange} className={inputCls(driverErrors.route) + " bg-[#0A2233]"}>
                  <option value="">Select route</option>
                  {ROUTES.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setDriverModal(false)} className="w-1/3 rounded-xl bg-white/5 font-bold text-slate-300 hover:bg-white/10 hover:text-white transition py-3">Cancel</button>
                <button type="submit" disabled={driverSaving || Object.keys(driverErrors).length > 0} className="w-2/3 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-95 disabled:opacity-50 transition">
                  {driverSaving ? "Saving..." : "Save Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Trip Modal */}
      {tripModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2233]/80 backdrop-blur-md p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[2.5rem] bg-[#123B57] p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200 border border-white/10">
            <button onClick={() => setTripModal(false)} className="absolute right-6 top-6 rounded-full bg-white/5 p-2 text-slate-400 hover:bg-white/10 hover:text-white transition"><FaTimes /></button>

            <div className="mb-6 flex items-center justify-between pr-10">
              <h2 className="text-2xl font-black text-white">{editingTrip ? "Edit Trip" : "Create Trip"}</h2>
              {!editingTrip && (
                <button type="button" onClick={preFillTrip} className="flex items-center gap-1.5 rounded-xl bg-orange-500/10 px-3 py-1.5 text-xs font-bold text-orange-400 hover:bg-orange-500/20 border border-orange-500/30 transition"><FaMagic /> Demo</button>
              )}
            </div>

            {tripSrvErr && <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 p-3 text-sm font-semibold text-red-400">⚠ {tripSrvErr}</div>}

            <form onSubmit={submitTrip} className="space-y-4">
              <Field label="Assign Driver" required error={tripErrors.driver}>
                <select name="driver" value={tripForm.driver} onChange={handleTripFormChange} className={inputCls(tripErrors.driver) + " bg-[#0A2233]"}>
                  <option value="">Select a driver...</option>
                  {drivers.map(d => <option key={d._id} value={d._id} className="bg-[#0A2233]">{d.name} ({d.assignedBus}) {d.status === "On Trip" && " - ON TRIP"}</option>)}
                </select>
              </Field>
              <Field label="Route" required error={tripErrors.route}>
                <select name="route" value={tripForm.route} onChange={handleTripFormChange} className={inputCls(tripErrors.route) + " bg-[#0A2233]"}>
                  <option value="">Select route</option>
                  {ROUTES.map(r => <option key={r} className="bg-[#0A2233]">{r}</option>)}
                </select>
              </Field>
              <Field label="Date" required error={tripErrors.date}>
                <input type="date" name="date" value={tripForm.date} onChange={handleTripFormChange} className={inputCls(tripErrors.date)} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Start Time" required error={tripErrors.startTime}>
                  <input type="time" name="startTime" value={tripForm.startTime} onChange={handleTripFormChange} className={inputCls(tripErrors.startTime)} />
                </Field>
                <Field label="End Time" required error={tripErrors.endTime}>
                  <input type="time" name="endTime" value={tripForm.endTime} onChange={handleTripFormChange} className={inputCls(tripErrors.endTime)} />
                </Field>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <Field label="Status" error={tripErrors.status}>
                  <select name="status" value={tripForm.status || "Scheduled"} onChange={handleTripFormChange} className={inputCls("") + " bg-[#0A2233]"}>
                    <option value="Scheduled" className="bg-[#0A2233]">Scheduled</option>
                    <option value="Ongoing" className="bg-[#0A2233]">Ongoing</option>
                    <option value="Completed" className="bg-[#0A2233]">Completed</option>
                    <option value="Delayed" className="bg-[#0A2233]">Delayed</option>
                  </select>
                </Field>
                <Field label="Passengers" error="">
                  <input type="number" name="passengers" value={tripForm.passengers} onChange={handleTripFormChange} className={inputCls("")} placeholder="e.g. 30" />
                </Field>
              </div>

              {tripForm.status === "Delayed" && (
                <Field label="Delay Reason" required error={tripErrors.delayReason}>
                  <textarea name="delayReason" value={tripForm.delayReason || ""} onChange={handleTripFormChange} rows={2} className={inputCls(tripErrors.delayReason) + " resize-none"} placeholder="State the reason for delay..." />
                </Field>
              )}

              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setTripModal(false)} className="w-1/3 rounded-xl bg-white/5 font-bold text-slate-300 hover:bg-white/10 hover:text-white transition py-3">Cancel</button>
                <button type="submit" disabled={tripSaving || Object.keys(tripErrors).length > 0} className="w-2/3 rounded-xl bg-orange-500 py-3.5 font-bold text-white shadow-lg shadow-orange-500/20 hover:bg-orange-600 active:scale-95 disabled:opacity-50 transition">
                  {tripSaving ? "Saving..." : "Save Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {delayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0A2233]/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-sm rounded-[2.5rem] bg-[#123B57] p-8 shadow-2xl border border-white/10">
            <h2 className="text-xl font-bold text-white mb-2">Report Delay</h2>
            <p className="text-sm text-slate-400 mb-5">Please state the reason for delay.</p>
            <textarea rows={3} value={delayReason} onChange={e => {setDelayReason(e.target.value); setDelayError("")}} className={`w-full rounded-xl border p-4 text-sm text-white resize-none bg-black/20 focus:ring-2 focus:ring-orange-500 outline-none transition ${delayError ? "border-red-500 bg-red-500/5 ring-2 ring-red-500/20" : "border-white/10"}`} placeholder="e.g. Heavy traffic..."/>
            {delayError && <p className="text-red-400 text-xs font-bold mt-1.5 ml-1">{delayError}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDelayModal(null)} className="w-1/2 rounded-xl bg-white/5 font-bold text-slate-300 hover:bg-white/10 hover:text-white py-3 transition">Cancel</button>
              <button onClick={handleDelayConfirm} disabled={delaySaving} className="w-1/2 rounded-xl bg-orange-500 font-bold text-white hover:bg-orange-600 py-3 shadow-lg shadow-orange-500/20 active:scale-95 disabled:opacity-50 transition">Confirm</button>
            </div>
          </div>
        </div>
            )}

    </section>
  );
}


// ─── Shared Components ───
function Field({ label, required, error, children }) {
  return (
    <div>
      <label className="block text-[13px] font-bold text-white mb-1.5 ml-1 uppercase tracking-wide opacity-80">
        {label} {required && <span className="text-orange-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-400 text-xs font-bold mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function inputCls(err) {
  return `w-full rounded-xl border px-4 py-3 text-[14px] font-medium text-white focus:ring-2 focus:ring-orange-500 outline-none transition ${err ? "border-red-500 bg-red-500/10 ring-2 ring-red-500/20" : "border-white/10 bg-black/20 hover:bg-black/30"}`;
}
