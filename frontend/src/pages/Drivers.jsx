import React, { useEffect, useState, useCallback } from "react";
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
  { name: "Ruwan Dissanayake", licenseNumber: "B-7834521", contactNumber: "+94771234567", assignedBus: "UR-23", route: "Malabe - Colombo", shift: "Morning Shift" },
  { name: "Kasun Perera",       licenseNumber: "C-1293847", contactNumber: "+94712345678", assignedBus: "UR-07", route: "Malabe - Kaduwela", shift: "Day Shift" },
];
let demoDriverIdx = 0;

// ─── Validators ────────────────────────────────────────────────────────────
function validateDriver(f) {
  const e = {};
  if (!f.name.trim())            e.name           = "Driver name is required.";
  else if (!/^[A-Za-z\s]+$/.test(f.name)) e.name  = "Name can only contain letters.";

  if (!f.licenseNumber.trim())   e.licenseNumber  = "License number is required.";

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

// ─── Status badge colours ───────────────────────────────────────────────────
const driverStatusCls = { Available: "bg-green-100 text-green-700", "On Trip": "bg-orange-100 text-orange-700" };
const tripStatusCls   = { Scheduled: "bg-blue-100 text-blue-700", Ongoing: "bg-yellow-100 text-yellow-800", Completed: "bg-green-100 text-green-700", Delayed: "bg-red-100 text-red-700" };

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
    if (activeTab === "trips") loadTrips();
  }, [activeTab, loadDrivers, loadTrips]);

  const refreshAction = () => {
    if (activeTab === "drivers") loadDrivers();
    if (activeTab === "trips") { loadDrivers(); loadTrips(); }
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

  // ══════════════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════════════
  return (
    <section className="min-h-screen bg-slate-50 pb-20">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">

        {/* ── Header & Tabs ── */}
        <div className="rounded-3xl bg-white p-6 shadow-md md:px-10 md:py-8 border-b-4 border-yellow-500">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-yellow-600 font-bold mb-2">Workspace</p>
              <h1 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">Driver & Trip Dashboard</h1>
              <p className="mt-2 text-slate-500 max-w-2xl">Manage your personnel, arrange trip schedules, and track live statuses.</p>
            </div>
            
            <div className="flex gap-2 p-1.5 bg-slate-100 rounded-xl shrink-0 border border-slate-200 shadow-inner">
              <button onClick={() => setActiveTab("drivers")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "drivers" ? "bg-white text-yellow-600 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}>
                <FaUser /> Drivers
              </button>
              <button onClick={() => setActiveTab("trips")}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition ${activeTab === "trips" ? "bg-white text-yellow-600 shadow-sm border border-slate-200" : "text-slate-600 hover:text-slate-900"}`}>
                <FaRoute /> Trips
              </button>
            </div>
          </div>
        </div>

        {/* ── Controls Row ── */}
        <div className="mt-6 flex flex-wrap gap-3 items-center justify-between">
          <div className="flex gap-3">
            {activeTab === "drivers" ? (
              <button onClick={openAddDriver} className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-yellow-600 transition">
                <FaPlus /> Add Driver
              </button>
            ) : (
              <button onClick={openCreateTrip} className="flex items-center gap-2 rounded-xl bg-yellow-500 px-5 py-2.5 text-sm font-semibold text-white shadow hover:bg-yellow-600 transition">
                <FaPlus /> Create Trip
              </button>
            )}
            <button onClick={refreshAction} className="flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 transition shadow-sm">
              <FaSync className={(activeTab === "drivers" ? driversLoading : tripsLoading) ? "animate-spin" : ""} /> Refresh
            </button>
          </div>

          {banner.msg && (
            <div className={`rounded-xl border px-4 py-2.5 text-sm font-semibold flex items-center gap-2
              ${banner.type === "success" ? "bg-green-50 border-green-200 text-green-700" : "bg-red-50 border-red-200 text-red-700"}`}>
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
              <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" /></div>
            ) : drivers.length === 0 ? (
              <p className="text-center text-slate-500 py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">No drivers found. Click <strong>Add Driver</strong> to begin.</p>
            ) : (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {drivers.map(driver => (
                  <div key={driver._id} className="group rounded-3xl bg-white p-6 shadow border border-slate-100 transition hover:shadow-lg flex flex-col">
                    <div className="flex items-start justify-between">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-100 text-xl font-bold text-yellow-800 shadow-sm">
                        {driver.name.split(" ").map(p => p[0]).join("")}
                      </div>
                      <span className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold ${driverStatusCls[driver.status] || "bg-slate-100 text-slate-600"}`}>
                        {driver.status}
                      </span>
                    </div>

                    <h2 className="mt-4 text-xl font-bold text-slate-900 group-hover:text-yellow-600 transition-colors">{driver.name}</h2>
                    <p className="text-sm font-medium text-slate-400 mt-0.5">{driver.shift}</p>

                    <div className="mt-5 space-y-2.5 flex-1 p-4 bg-slate-50 rounded-2xl border border-slate-100">
                      <p className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                        <FaRoute className="text-yellow-500" /> {driver.route}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                        <FaIdBadge className="text-yellow-500" /> Bus: {driver.assignedBus}
                      </p>
                      <p className="flex items-center gap-2.5 text-sm text-slate-600 font-medium">
                        <FaPhoneAlt className="text-yellow-500" /> {driver.contactNumber}
                      </p>
                    </div>

                    <div className="mt-5 flex gap-2">
                      <button onClick={() => openEditDriver(driver)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white py-2 text-xs font-bold text-slate-600 hover:border-yellow-400 hover:text-yellow-600 transition">
                        <FaEdit /> Edit
                      </button>
                      <button onClick={() => removeDriver(driver._id, driver.name)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl border-2 border-slate-100 bg-white py-2 text-xs font-bold text-slate-600 hover:border-red-300 hover:text-red-500 hover:bg-red-50 transition">
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
               <div className="flex justify-center py-12"><div className="h-10 w-10 animate-spin rounded-full border-4 border-yellow-500 border-t-transparent" /></div>
            ) : trips.length === 0 ? (
               <p className="text-center text-slate-500 py-12 bg-white rounded-3xl border border-slate-200 shadow-sm">No trips scheduled. Click <strong>Create Trip</strong> to arrange one.</p>
            ) : (
              trips.map(trip => (
                <div key={trip._id} className={`flex flex-col lg:flex-row items-center justify-between gap-5 rounded-3xl bg-white p-5 pr-6 shadow-sm border transition hover:shadow-md
                  ${trip.status === "Ongoing" ? "border-yellow-300" : trip.status === "Delayed" ? "border-red-300" : "border-slate-200"}`}>
                  
                  {/* Left block: driver & status */}
                  <div className="flex w-full lg:w-1/4 items-center gap-4 border-b lg:border-b-0 lg:border-r border-slate-100 pb-4 lg:pb-0 pr-4">
                    <div className={`h-12 w-12 shrink-0 rounded-full flex items-center justify-center text-lg shadow-sm ${trip.status === "Completed" ? "bg-green-100 text-green-600" : "bg-slate-100 text-slate-500"}`}>
                      {trip.status === "Completed" ? "✓" : <FaClipboardList />}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900">{trip.driver?.name || "Unknown Driver"}</h3>
                      <p className="text-xs font-bold text-slate-400 flex items-center gap-1 mt-0.5"><FaBus /> {trip.driver?.assignedBus}</p>
                    </div>
                  </div>

                  {/* Middle block: Trip details */}
                  <div className="flex w-full lg:flex-1 flex-col gap-1.5">
                    <div className="flex items-center gap-2">
                       <span className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${tripStatusCls[trip.status]}`}>{trip.status}</span>
                       <span className="font-semibold text-slate-800 text-sm">{trip.route}</span>
                    </div>
                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs font-medium text-slate-500 pl-1 py-1">
                      <span className="flex items-center gap-1.5"><FaCalendarAlt className="text-yellow-500"/> {trip.date}</span>
                      <span className="flex items-center gap-1.5"><FaClock className="text-yellow-500"/> {trip.startTime} – {trip.endTime}</span>
                      {trip.passengers > 0 && <span className="flex items-center gap-1.5"><FaUser className="text-yellow-500"/> {trip.passengers} Pax</span>}
                    </div>
                    {trip.delayReason && <p className="text-xs text-red-600 bg-red-50 rounded pl-2.5 py-1 font-semibold border-l-2 border-red-500 w-max">Delay: {trip.delayReason}</p>}
                  </div>

                  {/* Right block: Actions */}
                  <div className="flex w-full lg:w-auto flex-wrap gap-2 shrink-0 pt-3 lg:pt-0 justify-end">
                     {trip.status === "Scheduled" && (
                       <button onClick={() => changeStatus(trip._id, "Ongoing")} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-yellow-500 py-2 lg:py-1.5 px-4 text-xs font-bold text-white shadow hover:bg-yellow-600 transition">
                         <FaPlay /> Start
                       </button>
                     )}
                     {trip.status === "Ongoing" && (
                       <button onClick={() => changeStatus(trip._id, "Completed")} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-green-500 py-2 lg:py-1.5 px-4 text-xs font-bold text-white shadow hover:bg-green-600 transition">
                         <FaStop /> End
                       </button>
                     )}
                     {trip.status === "Delayed" && (
                       <button onClick={() => changeStatus(trip._id, "Ongoing")} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-yellow-500 py-2 lg:py-1.5 px-4 text-xs font-bold text-white shadow hover:bg-yellow-600 transition">
                         <FaPlay /> Resume
                       </button>
                     )}
                     {(trip.status === "Scheduled" || trip.status === "Ongoing") && (
                       <button onClick={() => { setDelayModal({ tripId: trip._id }); setDelayReason(""); setDelayError(""); }} className="flex-1 lg:flex-none flex justify-center items-center gap-1.5 rounded-xl bg-red-50 text-red-600 border border-red-200 py-2 lg:py-1.5 px-4 text-xs font-bold hover:bg-red-100 transition">
                         <FaExclamationTriangle /> Delay
                       </button>
                     )}
                     <button onClick={() => openEditTrip(trip)} className="flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-500 p-2.5 hover:text-yellow-600 hover:border-yellow-300 transition">
                       <FaEdit />
                     </button>
                     {trip.status !== "Ongoing" && (
                       <button onClick={() => removeTrip(trip._id)} className="flex items-center justify-center rounded-xl bg-slate-50 border border-slate-200 text-slate-400 p-2.5 hover:text-red-500 hover:bg-red-50 hover:border-red-200 transition">
                         <FaTrash />
                       </button>
                     )}
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      {/* ═══════════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════════ */}

      {/* Add / Edit Driver Modal */}
      {driverModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setDriverModal(false)} className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"><FaTimes /></button>

            <div className="mb-6 flex items-center justify-between pr-10">
              <h2 className="text-2xl font-black text-slate-900">{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              {!editingDriver && (
                <button type="button" onClick={preFillDriver} className="flex items-center gap-1.5 rounded-xl bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 transition">
                  <FaMagic /> Demo
                </button>
              )}
            </div>

            {driverSrvErr && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-600">⚠ {driverSrvErr}</div>}

            <form onSubmit={submitDriver} className="space-y-4">
              <Field label="Driver Name" required error={driverErrors.name}>
                <input name="name" value={driverForm.name} onChange={handleDriverFormChange} placeholder="Enter driver name" className={inputCls(driverErrors.name)} />
              </Field>
              <Field label="License Number" required error={driverErrors.licenseNumber}>
                <input name="licenseNumber" value={driverForm.licenseNumber} onChange={handleDriverFormChange} placeholder="Enter license number" className={inputCls(driverErrors.licenseNumber)} />
              </Field>
              <Field label="Contact Number" required error={driverErrors.contactNumber}>
                <input name="contactNumber" value={driverForm.contactNumber} onChange={handleDriverFormChange} className={inputCls(driverErrors.contactNumber)} placeholder="e.g. 0771234567" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Assigned Bus" required error={driverErrors.assignedBus}>
                  <input name="assignedBus" value={driverForm.assignedBus} onChange={handleDriverFormChange} placeholder="e.g. UR-12" className={inputCls(driverErrors.assignedBus)} />
                </Field>
                <Field label="Shift" required error={driverErrors.shift}>
                  <select name="shift" value={driverForm.shift} onChange={handleDriverFormChange} className={inputCls(driverErrors.shift) + " bg-white"}>
                    <option value="">Select shift</option>
                    {SHIFTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </Field>
              </div>
              <Field label="Route" required error={driverErrors.route}>
                <select name="route" value={driverForm.route} onChange={handleDriverFormChange} className={inputCls(driverErrors.route) + " bg-white"}>
                  <option value="">Select route</option>
                  {ROUTES.map(r => <option key={r}>{r}</option>)}
                </select>
              </Field>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setDriverModal(false)} className="w-1/3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={driverSaving || Object.keys(driverErrors).length > 0} className="w-2/3 rounded-xl bg-yellow-500 py-3.5 font-bold text-white shadow-md hover:bg-yellow-600 shadow-yellow-500/30 disabled:opacity-50 transition">
                  {driverSaving ? "Saving..." : "Save Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Trip Modal */}
      {tripModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <button onClick={() => setTripModal(false)} className="absolute right-6 top-6 rounded-full bg-slate-100 p-2 text-slate-500 hover:bg-slate-200 hover:text-slate-800 transition"><FaTimes /></button>

            <div className="mb-6 flex items-center justify-between pr-10">
              <h2 className="text-2xl font-black text-slate-900">{editingTrip ? "Edit Trip" : "Create Trip"}</h2>
              {!editingTrip && (
                <button type="button" onClick={preFillTrip} className="flex items-center gap-1.5 rounded-xl bg-yellow-50 px-3 py-1.5 text-xs font-bold text-yellow-700 hover:bg-yellow-100 transition"><FaMagic /> Demo</button>
              )}
            </div>

            {tripSrvErr && <div className="mb-5 rounded-xl bg-red-50 border border-red-200 p-3 text-sm font-semibold text-red-600">⚠ {tripSrvErr}</div>}

            <form onSubmit={submitTrip} className="space-y-4">
              <Field label="Assign Driver" required error={tripErrors.driver}>
                <select name="driver" value={tripForm.driver} onChange={handleTripFormChange} className={inputCls(tripErrors.driver) + " bg-white"}>
                  <option value="">Select a driver...</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.assignedBus}) {d.status === "On Trip" && " - ON TRIP"}</option>)}
                </select>
              </Field>
              <Field label="Route" required error={tripErrors.route}>
                <select name="route" value={tripForm.route} onChange={handleTripFormChange} className={inputCls(tripErrors.route) + " bg-white"}>
                  <option value="">Select route</option>
                  {ROUTES.map(r => <option key={r}>{r}</option>)}
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
                  <select name="status" value={tripForm.status || "Scheduled"} onChange={handleTripFormChange} className={inputCls("") + " bg-white"}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
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
                <button type="button" onClick={() => setTripModal(false)} className="w-1/3 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 transition">Cancel</button>
                <button type="submit" disabled={tripSaving || Object.keys(tripErrors).length > 0} className="w-2/3 rounded-xl bg-yellow-500 py-3.5 font-bold text-white shadow-md hover:bg-yellow-600 shadow-yellow-500/30 disabled:opacity-50 transition">
                  {tripSaving ? "Saving..." : "Save Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {delayModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-sm rounded-[2rem] bg-white p-8 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900 mb-2">Report Delay</h2>
            <p className="text-sm text-slate-500 mb-5">Please state the reason for delay.</p>
            <textarea rows={3} value={delayReason} onChange={e => {setDelayReason(e.target.value); setDelayError("")}} className={`w-full rounded-xl border p-4 text-sm resize-none focus:ring-2 focus:ring-red-400 outline-none transition ${delayError ? "border-red-400 bg-red-50" : "border-slate-300"}`} placeholder="e.g. Heavy traffic..."/>
            {delayError && <p className="text-red-500 text-xs font-bold mt-1">{delayError}</p>}
            <div className="mt-6 flex gap-3">
              <button onClick={() => setDelayModal(null)} className="w-1/2 rounded-xl bg-slate-100 font-bold text-slate-600 hover:bg-slate-200 py-3">Cancel</button>
              <button onClick={handleDelayConfirm} disabled={delaySaving} className="w-1/2 rounded-xl bg-red-500 font-bold text-white hover:bg-red-600 py-3 shadow-md shadow-red-500/30 disabled:opacity-50">Confirm</button>
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
      <label className="block text-[13px] font-bold text-slate-700 mb-1.5 ml-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="text-red-500 text-xs font-bold mt-1.5 ml-1">{error}</p>}
    </div>
  );
}

function inputCls(err) {
  return `w-full rounded-xl border px-4 py-3 text-[14px] font-medium text-slate-800 focus:ring-2 focus:ring-yellow-400 outline-none transition ${err ? "border-red-400 bg-red-50 ring-2 ring-red-400/20" : "border-slate-300 bg-slate-50/50 hover:bg-slate-50"}`;
}
