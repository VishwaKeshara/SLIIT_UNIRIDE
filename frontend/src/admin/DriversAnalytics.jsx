import React, { useEffect, useState, useCallback } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import {
  FaSearch, FaPlus, FaEdit, FaTrash, FaPlay, FaStop,
  FaExclamationTriangle, FaTimes, FaMagic, FaSync,
  FaUser, FaRoute, FaIdBadge, FaPhoneAlt, FaBus,
  FaCalendarAlt, FaClock, FaChartPie, FaClipboardList,
} from "react-icons/fa";
import { getDrivers, addDriver, updateDriver, deleteDriver } from "../api/driverApi";
import { getTrips, addTrip, updateTrip, updateTripStatus, deleteTrip } from "../api/tripApi";
import { getRoutes } from "../api/routeApi";

// ─── Constants ───
const SHIFTS = ["Morning Shift", "Day Shift", "Evening Shift"];
const DEMO_DRIVERS = [
  { name: "Ruwan Dissanayake", licenseNumber: "B1234567", contactNumber: "0771234567", assignedBus: "UR-23", route: "Malabe - Colombo", shift: "Morning Shift" },
  { name: "Kasun Perera", licenseNumber: "C7654321", contactNumber: "0712345678", assignedBus: "UR-07", route: "Malabe - Kaduwela", shift: "Day Shift" },
];
let demoDriverIdx = 0;

const getRouteLabel = (route) =>
  route?.routeName?.trim() || `${route?.startLocation || ""} - ${route?.endLocation || ""}`.trim();

// ─── Validators ───
function validateDriver(f) {
  const e = {};
  if (!f.name.trim()) e.name = "Driver name is required.";
  else if (!/^[A-Za-z\s]+$/.test(f.name)) e.name = "Name can only contain letters.";
  if (!f.licenseNumber.trim()) e.licenseNumber = "License number is required.";
  else if (f.licenseNumber.length !== 8) e.licenseNumber = "License Number must be exactly 8 characters.";
  if (!f.contactNumber.trim()) e.contactNumber = "Contact number is required.";
  else if (!/^07[0-9]{8}$/.test(f.contactNumber)) e.contactNumber = "Must be a 10-digit number starting with 07";
  if (!f.assignedBus.trim()) e.assignedBus = "Assigned bus is required.";
  if (!f.route) e.route = "Route is required.";
  if (!f.shift) e.shift = "Shift is required.";
  return e;
}

function validateTrip(f) {
  const e = {};
  if (!f.driver) e.driver = "Driver is required.";
  if (!f.route) e.route = "Route is required.";
  if (!f.date) e.date = "Date is required.";
  else {
    const today = new Date().toISOString().split("T")[0];
    if (f.date < today) e.date = "Date cannot be in the past.";
  }
  if (!f.startTime) e.startTime = "Start time is required.";
  if (!f.endTime) e.endTime = "End time is required.";
  else if (f.startTime >= f.endTime) e.endTime = "End time must be after start time.";
  if (f.status === "Delayed" && !f.delayReason?.trim()) e.delayReason = "Delay reason is required.";
  return e;
}

// ─── Status badges (Admin Light Theme) ───
const driverBadge = {
  Available: "bg-[#dff7ec] text-[#049b63]",
  "On Trip": "bg-[#fff3dc] text-[#d08a00]",
};
const tripBadge = {
  Scheduled: "bg-[#fff3dc] text-[#d08a00]",
  Ongoing: "bg-[#e8eefb] text-[#0a3772]",
  Completed: "bg-[#dff7ec] text-[#049b63]",
  Delayed: "bg-[#ffe3e1] text-[#ef534f]",
};

export default function DriversAnalytics() {
  // ── UI State ───
  const [activeTab, setActiveTab] = useState("drivers");
  const [banner, setBanner] = useState({ type: "", msg: "" });
  const flash = (type, msg, ms = 3500) => {
    setBanner({ type, msg });
    setTimeout(() => setBanner({ type: "", msg: "" }), ms);
  };

  // ── Drivers State ───
  const [drivers, setDrivers] = useState([]);
  const [driversLoading, setDriversLoading] = useState(true);
  const [routeOptions, setRouteOptions] = useState([]);
  const [driverModal, setDriverModal] = useState(false);
  const [editingDriver, setEditingDriver] = useState(null);
  const [driverForm, setDriverForm] = useState({ name: "", licenseNumber: "", contactNumber: "", assignedBus: "", route: "", shift: "" });
  const [driverErrors, setDriverErrors] = useState({});
  const [driverSrvErr, setDriverSrvErr] = useState("");
  const [driverSaving, setDriverSaving] = useState(false);

  // ── Trips State ───
  const [trips, setTrips] = useState([]);
  const [tripsLoading, setTripsLoading] = useState(false);
  const [tripModal, setTripModal] = useState(false);
  const [editingTrip, setEditingTrip] = useState(null);
  const [tripForm, setTripForm] = useState({ driver: "", route: "", date: "", startTime: "", endTime: "", passengers: "" });
  const [tripErrors, setTripErrors] = useState({});
  const [tripSrvErr, setTripSrvErr] = useState("");
  const [tripSaving, setTripSaving] = useState(false);

  // Delay modal
  const [delayModal, setDelayModal] = useState(null);
  const [delayReason, setDelayReason] = useState("");
  const [delayError, setDelayError] = useState("");
  const [delaySaving, setDelaySaving] = useState(false);

  // Search
  const [searchTerm, setSearchTerm] = useState("");

  // ── Load Data ───
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

  const loadRoutes = useCallback(async () => {
    try {
      const res = await getRoutes();
      setRouteOptions(res.data.map((route) => getRouteLabel(route)).filter(Boolean));
    } catch {
      flash("error", "Failed to load routes.");
    }
  }, []);

  useEffect(() => {
    loadDrivers();
    loadRoutes();
    if (activeTab === "trips" || activeTab === "analysis") loadTrips();
  }, [activeTab, loadDrivers, loadRoutes, loadTrips]);

  const refreshAction = () => {
    if (activeTab === "drivers") { loadDrivers(); loadRoutes(); }
    if (activeTab === "trips" || activeTab === "analysis") { loadDrivers(); loadRoutes(); loadTrips(); }
  };

  // ── DRIVER CRUD ───
  const openAddDriver = () => {
    setEditingDriver(null);
    setDriverForm({ name: "", licenseNumber: "", contactNumber: "", assignedBus: "", route: "", shift: "" });
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
    setDriverForm(d); setDriverErrors(validateDriver(d));
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
      setDriverForm({ name: "", licenseNumber: "", contactNumber: "", assignedBus: "", route: "", shift: "" });
      setDriverErrors({});
    } catch (err) {
      setDriverSrvErr(err.response?.data?.message || "An error occurred while saving driver.");
    } finally { setDriverSaving(false); }
  };
  const removeDriver = async (id, name) => {
    if (!window.confirm(`Delete driver "${name}"?`)) return;
    try {
      await deleteDriver(id);
      setDrivers(drivers.filter((d) => d._id !== id));
      flash("success", "Driver deleted.");
    } catch (err) { flash("error", err.response?.data?.message || "Failed to delete driver."); }
  };

  // ── TRIP CRUD ───
  const openCreateTrip = () => {
    setEditingTrip(null);
    const today = new Date().toISOString().split("T")[0];
    setTripForm({ driver: "", route: "", date: today, startTime: "", endTime: "", passengers: "" });
    setTripErrors({}); setTripSrvErr(""); setTripModal(true);
  };
  const openEditTrip = (t) => {
    setEditingTrip(t);
    setTripForm({ driver: t.driver?._id || t.driver, route: t.route, date: t.date, startTime: t.startTime, endTime: t.endTime, passengers: t.passengers || "" });
    setTripErrors({}); setTripSrvErr(""); setTripModal(true);
  };
  const handleTripFormChange = (e) => {
    const { name, value } = e.target;
    let updated = { ...tripForm, [name]: value };
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
    const t = { driver: avail ? avail._id : "", route: avail?.route || routeOptions[0] || "", date: today, startTime: "07:30", endTime: "09:00", passengers: "28" };
    setTripForm(t); setTripErrors(validateTrip(t)); setTripSrvErr("");
  };
  const submitTrip = async (e) => {
    e.preventDefault();
    const errs = validateTrip(tripForm);
    if (Object.keys(errs).length) { setTripErrors(errs); return; }
    setTripSaving(true);
    try {
      if (editingTrip) { await updateTrip(editingTrip._id, tripForm); flash("success", "Trip updated successfully."); }
      else { await addTrip(tripForm); flash("success", "Trip created successfully."); }
      setTripModal(false);
      setTripForm({ driver: "", route: "", date: "", startTime: "", endTime: "", passengers: "" });
      setTripErrors({}); loadTrips();
    } catch (err) { setTripSrvErr(err.response?.data?.message || "Failed to save trip."); }
    finally { setTripSaving(false); }
  };
  const removeTrip = async (id) => {
    if (!window.confirm("Delete this trip?")) return;
    try { await deleteTrip(id); setTrips(trips.filter((t) => t._id !== id)); flash("success", "Trip deleted."); }
    catch (err) { flash("error", err.response?.data?.message || "Cannot delete this trip."); }
  };
  const changeStatus = async (tripId, status, reason = "") => {
    try {
      const res = await updateTripStatus(tripId, { status, delayReason: reason });
      const updatedTrip = res.data;
      setTrips(trips.map(t => t._id === tripId ? { ...t, status: updatedTrip.status, delayReason: updatedTrip.delayReason } : t));
      if (status === "Ongoing" || status === "Completed" || status === "Delayed") {
        const newDStatus = status === "Ongoing" ? "On Trip" : "Available";
        setDrivers(drivers.map(d => d._id === updatedTrip.driver._id ? { ...d, status: newDStatus } : d));
      }
      flash("success", `Trip status changed to "${status}".`);
    } catch (err) { flash("error", err.response?.data?.message || "Failed to update status."); }
  };
  const handleDelayConfirm = async () => {
    if (!delayReason.trim()) { setDelayError("Delay reason is required."); return; }
    setDelaySaving(true);
    try { await changeStatus(delayModal.tripId, "Delayed", delayReason); setDelayModal(null); }
    finally { setDelaySaving(false); }
  };

  // ── Analytics Calculations ───
  const totalDrivers = drivers.length;
  const availableDrivers = drivers.filter(d => d.status === "Available").length;
  const onTripDrivers = drivers.filter(d => d.status === "On Trip").length;
  const totalTrips = trips.length;
  const tripStatusCounts = trips.reduce((acc, t) => { acc[t.status] = (acc[t.status] ?? 0) + 1; return acc; }, { Scheduled: 0, Ongoing: 0, Completed: 0, Delayed: 0 });

  const tripStatusItems = [
    { label: "Scheduled", value: tripStatusCounts.Scheduled, color: "#d08a00", bg: "#fff3dc" },
    { label: "Ongoing", value: tripStatusCounts.Ongoing, color: "#0a3772", bg: "#e8eefb" },
    { label: "Completed", value: tripStatusCounts.Completed, color: "#049b63", bg: "#dff7ec" },
    { label: "Delayed", value: tripStatusCounts.Delayed, color: "#ef534f", bg: "#ffe3e1" },
  ];
  const maxTripCount = Math.max(...Object.values(tripStatusCounts), 1);

  const shiftCounts = drivers.reduce((acc, d) => {
    if (d.shift === "Morning Shift") acc.Morning++;
    else if (d.shift === "Day Shift") acc.Day++;
    else if (d.shift === "Evening Shift") acc.Evening++;
    return acc;
  }, { Morning: 0, Day: 0, Evening: 0 });
  const shiftTotal = Math.max(drivers.length, 1);
  const donutRadius = 48;
  const donutCircumference = 2 * Math.PI * donutRadius;
  let shiftOffset = 0;
  const shiftSeries = [
    { label: "Morning", value: shiftCounts.Morning, color: "#F97316" },
    { label: "Day", value: shiftCounts.Day, color: "#3464d4" },
    { label: "Evening", value: shiftCounts.Evening, color: "#8B5CF6" },
  ].map((segment) => {
    const segmentLength = (segment.value / shiftTotal) * donutCircumference;
    const data = { ...segment, segmentLength, offset: shiftOffset };
    shiftOffset -= segmentLength;
    return data;
  });

  // Search filtering
  const filteredDrivers = drivers.filter(d => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return [d.name, d.licenseNumber, d.contactNumber, d.assignedBus, d.route, d.shift, d.status].join(" ").toLowerCase().includes(s);
  });
  const filteredTrips = trips.filter(t => {
    if (!searchTerm.trim()) return true;
    const s = searchTerm.toLowerCase();
    return [t.route, t.driver?.name, t.driver?.assignedBus, t.date, t.status, t.delayReason].filter(Boolean).join(" ").toLowerCase().includes(s);
  });

  // ── Stat cards per tab ───
  const statCards = activeTab === "drivers"
    ? [
        { label: "Total Drivers", value: totalDrivers },
        { label: "Available", value: availableDrivers },
        { label: "On Trip", value: onTripDrivers },
      ]
    : activeTab === "trips"
    ? [
        { label: "Total Trips", value: totalTrips },
        { label: "Scheduled", value: tripStatusCounts.Scheduled },
        { label: "Ongoing", value: tripStatusCounts.Ongoing },
        { label: "Delayed", value: tripStatusCounts.Delayed },
      ]
    : [
        { label: "Total Drivers", value: totalDrivers },
        { label: "Active Trips", value: trips.filter(t => t.status !== "Completed").length },
        { label: "Available Fleet", value: availableDrivers },
      ];

  // ══════════════════════════════════════════════════════════════════
  // RENDER
  // ══════════════════════════════════════════════════════════════════
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        {/* ── Header ── */}
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              Drivers & Trips
            </h1>
            <p className="mt-3 max-w-3xl text-base text-[#5c79a8] sm:text-lg">
              Manage drivers, schedule trips, track live statuses, and view analytics from one workspace.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/dashboard" className="rounded-3xl bg-[#e8eefb] px-7 py-4 text-lg font-extrabold text-[#0a3772] shadow-sm transition hover:opacity-90">
              Dashboard
            </Link>
            <Link to="/admin/trips" className="rounded-3xl bg-[#ffbf00] px-7 py-4 text-lg font-extrabold text-[#111827] shadow-sm transition hover:opacity-90">
              Trip Monitoring
            </Link>
          </div>
        </div>

        {/* ── Tabs ── */}
        <div className="mb-8 flex flex-wrap gap-3">
          {[
            { key: "drivers", label: "Driver Management", icon: <FaUser /> },
            { key: "trips", label: "Trip Management", icon: <FaRoute /> },
            { key: "analysis", label: "Analytics", icon: <FaChartPie /> },
          ].map(tab => (
            <button key={tab.key} onClick={() => { setActiveTab(tab.key); setSearchTerm(""); }}
              className={`flex items-center gap-2.5 rounded-[20px] px-6 py-3.5 text-base font-extrabold transition ${
                activeTab === tab.key
                  ? "bg-[#143d7a] text-white shadow-lg"
                  : "bg-white border border-blue-100 text-[#5c79a8] hover:bg-[#e8eefb] hover:text-[#0a3772]"
              }`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        {/* ── Stat Cards ── */}
        <div className={`mb-8 grid grid-cols-1 gap-6 ${statCards.length === 4 ? "xl:grid-cols-4" : "xl:grid-cols-3"}`}>
          {statCards.map(card => (
            <div key={card.label} className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <p className="text-[1.05rem] font-bold text-[#5c79a8]">{card.label}</p>
              <h2 className="mt-5 text-5xl font-extrabold text-[#0b2f67]">{card.value}</h2>
            </div>
          ))}
        </div>

        {/* ── Controls Row ── */}
        {activeTab !== "analysis" && (
          <section className="mb-8 rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div className="relative flex-1 max-w-xl">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c79a8]" />
                <input type="text" placeholder={activeTab === "drivers" ? "Search drivers by name, license, bus, route..." : "Search trips by route, driver, date..."}
                  value={searchTerm} onChange={e => setSearchTerm(e.target.value)}
                  className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] py-3 pl-11 pr-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
                />
              </div>
              <div className="flex gap-3">
                <button onClick={activeTab === "drivers" ? openAddDriver : openCreateTrip}
                  className="flex items-center gap-2 rounded-[18px] bg-[#143d7a] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-90">
                  <FaPlus /> {activeTab === "drivers" ? "Add Driver" : "Create Trip"}
                </button>
                <button onClick={refreshAction}
                  className="flex items-center gap-2 rounded-[18px] bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-[#0a3772] transition hover:opacity-90">
                  <FaSync className={(driversLoading || tripsLoading) ? "animate-spin" : ""} /> Refresh
                </button>
              </div>
            </div>
          </section>
        )}

        {/* Banner */}
        {banner.msg && (
          <div className={`mb-6 rounded-[20px] border px-5 py-4 text-sm font-bold ${
            banner.type === "success" ? "border-green-200 bg-green-50 text-green-700" : "border-red-200 bg-red-50 text-red-700"
          }`}>
            {banner.type === "success" ? "✓" : "✗"} {banner.msg}
          </div>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 1: DRIVER MANAGEMENT
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "drivers" && (
          <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                Driver Records
              </h3>
              <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
                {filteredDrivers.length} Results
              </span>
            </div>

            {driversLoading ? (
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">Loading drivers...</div>
            ) : filteredDrivers.length === 0 ? (
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">No drivers found. Click <strong>Add Driver</strong> to begin.</div>
            ) : (
              <div className="overflow-x-auto rounded-[24px] border border-blue-100 bg-[#f7faff]">
                <table className="w-full min-w-[900px] text-left">
                  <thead>
                    <tr className="text-[#5c79a8]">
                      <th className="px-6 py-5 text-base font-extrabold">#</th>
                      <th className="px-6 py-5 text-base font-extrabold">Driver</th>
                      <th className="px-6 py-5 text-base font-extrabold">License</th>
                      <th className="px-6 py-5 text-base font-extrabold">Contact</th>
                      <th className="px-6 py-5 text-base font-extrabold">Bus</th>
                      <th className="px-6 py-5 text-base font-extrabold">Route</th>
                      <th className="px-6 py-5 text-base font-extrabold">Shift</th>
                      <th className="px-6 py-5 text-base font-extrabold">Status</th>
                      <th className="px-6 py-5 text-base font-extrabold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredDrivers.map((driver, index) => (
                      <tr key={driver._id} className="border-t border-blue-100 bg-white/60 text-[#0b1f45]">
                        <td className="px-6 py-5 text-base font-bold">{index + 1}</td>
                        <td className="px-6 py-5">
                          <div className="text-base font-extrabold">{driver.name}</div>
                        </td>
                        <td className="px-6 py-5 text-base font-medium">{driver.licenseNumber}</td>
                        <td className="px-6 py-5 text-base font-medium">{driver.contactNumber}</td>
                        <td className="px-6 py-5 text-base font-extrabold">{driver.assignedBus}</td>
                        <td className="px-6 py-5 text-base">{driver.route}</td>
                        <td className="px-6 py-5 text-base">{driver.shift}</td>
                        <td className="px-6 py-5">
                          <span className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${driverBadge[driver.status] || "bg-slate-200 text-slate-600"}`}>
                            {driver.status}
                          </span>
                        </td>
                        <td className="px-6 py-5">
                          <div className="flex gap-2">
                            <button onClick={() => openEditDriver(driver)} className="rounded-[14px] bg-[#e8eefb] px-4 py-2.5 text-sm font-extrabold text-[#0a3772] transition hover:opacity-90">
                              <FaEdit />
                            </button>
                            <button onClick={() => removeDriver(driver._id, driver.name)} className="rounded-[14px] bg-[#ffe3e1] px-4 py-2.5 text-sm font-extrabold text-[#ef534f] transition hover:opacity-90">
                              <FaTrash />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 2: TRIP MANAGEMENT
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "trips" && (
          <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Trip Records</h3>
              <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">{filteredTrips.length} Results</span>
            </div>

            {tripsLoading ? (
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">Loading trips...</div>
            ) : filteredTrips.length === 0 ? (
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">No trips found. Click <strong>Create Trip</strong> to schedule one.</div>
            ) : (
              <div className="space-y-5">
                {filteredTrips.map(trip => (
                  <div key={trip._id} className={`rounded-[24px] border p-5 ${trip.status === "Delayed" ? "border-[#ffd2cf] bg-[#fffbfa]" : "border-blue-100 bg-[#f7faff]"}`}>
                    <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
                      <div className="flex-1">
                        <div className="mb-4 flex flex-wrap items-center gap-3">
                          <h4 className="text-2xl font-extrabold text-[#0b1f45]">{trip.route}</h4>
                          <span className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${tripBadge[trip.status] || "bg-slate-200 text-slate-600"}`}>{trip.status}</span>
                        </div>
                        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                          <div className="rounded-[18px] bg-white px-4 py-4">
                            <p className="text-sm font-bold text-[#5c79a8]">Driver</p>
                            <p className="mt-2 text-base font-extrabold text-[#0b1f45]">{trip.driver?.name || "Unassigned"}</p>
                          </div>
                          <div className="rounded-[18px] bg-white px-4 py-4">
                            <p className="text-sm font-bold text-[#5c79a8]">Bus</p>
                            <p className="mt-2 text-base font-extrabold text-[#0b1f45]">{trip.driver?.assignedBus || "-"}</p>
                          </div>
                          <div className="rounded-[18px] bg-white px-4 py-4">
                            <p className="text-sm font-bold text-[#5c79a8]">Schedule</p>
                            <p className="mt-2 text-base font-extrabold text-[#0b1f45]">{trip.date}</p>
                            <p className="mt-1 text-sm text-[#617ba4]">{trip.startTime} - {trip.endTime}</p>
                          </div>
                          <div className="rounded-[18px] bg-white px-4 py-4">
                            <p className="text-sm font-bold text-[#5c79a8]">Passengers</p>
                            <p className="mt-2 text-base font-extrabold text-[#0b1f45]">{trip.passengers ?? 0}</p>
                          </div>
                        </div>
                        {trip.delayReason && (
                          <div className="mt-4 rounded-[18px] bg-[#fff4f3] px-4 py-4 text-sm font-bold text-[#ef534f]">
                            Delay Reason: {trip.delayReason}
                          </div>
                        )}
                      </div>

                      {/* Trip Actions */}
                      <div className="flex min-w-[200px] flex-col gap-3">
                        {trip.status === "Scheduled" && (
                          <button onClick={() => changeStatus(trip._id, "Ongoing")} className="rounded-[18px] bg-[#143d7a] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90">
                            <FaPlay className="inline mr-2" />Start Trip
                          </button>
                        )}
                        {trip.status === "Ongoing" && (
                          <button onClick={() => changeStatus(trip._id, "Completed")} className="rounded-[18px] bg-[#dff7ec] px-5 py-3 text-sm font-extrabold text-[#049b63] transition hover:opacity-90">
                            <FaStop className="inline mr-2" />Complete
                          </button>
                        )}
                        {trip.status === "Delayed" && (
                          <button onClick={() => changeStatus(trip._id, "Ongoing")} className="rounded-[18px] bg-[#143d7a] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90">
                            <FaPlay className="inline mr-2" />Resume
                          </button>
                        )}
                        {(trip.status === "Scheduled" || trip.status === "Ongoing") && (
                          <button onClick={() => { setDelayModal({ tripId: trip._id }); setDelayReason(""); setDelayError(""); }}
                            className="rounded-[18px] bg-[#ffe3e1] px-5 py-3 text-sm font-extrabold text-[#ef534f] transition hover:opacity-90">
                            <FaExclamationTriangle className="inline mr-2" />Delay
                          </button>
                        )}
                        <button onClick={() => openEditTrip(trip)} className="rounded-[18px] bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-[#0a3772] transition hover:opacity-90">
                          <FaEdit className="inline mr-2" />Edit
                        </button>
                        {trip.status !== "Ongoing" && (
                          <button onClick={() => removeTrip(trip._id)} className="rounded-[18px] bg-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:opacity-90">
                            <FaTrash className="inline mr-2" />Delete
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}

        {/* ═══════════════════════════════════════════════════════════════
            TAB 3: ANALYTICS
        ═══════════════════════════════════════════════════════════════ */}
        {activeTab === "analysis" && (
          <div className="space-y-8">
            {/* Trip Status Breakdown */}
            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Trip Status Breakdown</h3>
                  <p className="mt-2 text-base text-[#5c79a8]">Performance overview of all scheduled trips</p>
                </div>
                <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">Total {trips.length}</span>
              </div>
              <div className="grid grid-cols-1 gap-5 xl:grid-cols-4">
                {tripStatusItems.map(item => (
                  <div key={item.label} className="rounded-[24px] border border-blue-100 bg-[#f7faff] p-5">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-bold text-[#5c79a8]">{item.label}</p>
                      <span className={`inline-flex rounded-full px-3 py-1.5 text-sm font-extrabold`} style={{ backgroundColor: item.bg, color: item.color }}>
                        {item.value}
                      </span>
                    </div>
                    <div className="mt-4 h-3 rounded-full bg-blue-50 overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-500" style={{ width: `${(item.value / maxTripCount) * 100}%`, backgroundColor: item.color }} />
                    </div>
                    <p className="mt-2 text-sm text-[#617ba4]">{trips.length > 0 ? Math.round((item.value / trips.length) * 100) : 0}% of total</p>
                  </div>
                ))}
              </div>
            </section>

            {/* Driver Shift Distribution */}
            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Driver Shift Distribution</h3>
                  <p className="mt-2 text-base text-[#5c79a8]">Shift coverage across all active drivers</p>
                </div>
                <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">{drivers.length} Drivers</span>
              </div>

              <div className="flex flex-col items-center justify-center gap-8 lg:flex-row lg:items-start">
                {/* Donut Chart */}
                <div className="relative h-56 w-56">
                  <svg viewBox="0 0 120 120" className="h-full w-full">
                    <circle cx="60" cy="60" r="48" fill="none" stroke="#e8eefb" strokeWidth="18" />
                    {shiftSeries.map(segment => (
                      <circle key={segment.label} cx="60" cy="60" r={donutRadius} fill="none" stroke={segment.color} strokeWidth="18"
                        strokeDasharray={`${segment.segmentLength} ${donutCircumference}`} strokeDashoffset={segment.offset}
                        strokeLinecap="round" transform="rotate(-90 60 60)" />
                    ))}
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-sm font-bold uppercase tracking-[0.22em] text-[#5c79a8]">Shift</span>
                    <span className="mt-2 text-3xl font-extrabold text-[#0b2f67]">{drivers.length}</span>
                  </div>
                </div>

                {/* Shift Legend */}
                <div className="space-y-4">
                  {shiftSeries.map(segment => (
                    <div key={segment.label} className="flex items-center gap-4 rounded-[18px] bg-[#f7faff] border border-blue-100 px-5 py-4">
                      <span className="h-4 w-4 rounded-full" style={{ backgroundColor: segment.color }} />
                      <div>
                        <p className="text-base font-extrabold text-[#0b1f45]">{segment.label}</p>
                        <p className="text-sm text-[#617ba4]">{segment.value} drivers ({Math.round((segment.value / shiftTotal) * 100)}%)</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Route Distribution */}
            <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <div className="mb-6">
                <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Route Coverage</h3>
                <p className="mt-2 text-base text-[#5c79a8]">Number of drivers assigned per route</p>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {routeOptions.map(route => {
                  const count = drivers.filter(d => d.route === route).length;
                  return (
                    <div key={route} className="flex items-center justify-between rounded-[18px] border border-blue-100 bg-[#f7faff] px-5 py-4">
                      <div className="flex items-center gap-3">
                        <FaRoute className="text-[#3464d4]" />
                        <span className="text-base font-bold text-[#0b1f45]">{route}</span>
                      </div>
                      <span className="rounded-full bg-[#e8eefb] px-4 py-1.5 text-sm font-extrabold text-[#3464d4]">{count}</span>
                    </div>
                  );
                })}
              </div>
            </section>
          </div>
        )}
      </main>

      {/* ═══════════════════════════════════════════════════════════════
          MODALS
      ═══════════════════════════════════════════════════════════════ */}

      {/* Add / Edit Driver Modal */}
      {driverModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f45]/40 px-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[30px] bg-white p-8 shadow-2xl">
            <button onClick={() => setDriverModal(false)} className="absolute right-6 top-6 rounded-full bg-[#f7faff] p-2 text-[#5c79a8] hover:bg-[#e8eefb] transition"><FaTimes /></button>

            <div className="mb-6 flex items-center justify-between pr-10">
              <h2 className="text-3xl font-extrabold text-[#0b2f67]">{editingDriver ? "Edit Driver" : "Add Driver"}</h2>
              {!editingDriver && (
                <button type="button" onClick={preFillDriver} className="flex items-center gap-1.5 rounded-[14px] bg-[#fff3dc] px-3 py-1.5 text-xs font-extrabold text-[#d08a00] hover:opacity-80 transition">
                  <FaMagic /> Demo
                </button>
              )}
            </div>

            {driverSrvErr && <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">⚠ {driverSrvErr}</div>}

            <form onSubmit={submitDriver} className="space-y-4">
              <AdminField label="Driver Name" required error={driverErrors.name}>
                <input name="name" value={driverForm.name} onChange={handleDriverFormChange} placeholder="Enter driver name" className={adminInputCls(driverErrors.name)} />
              </AdminField>
              <AdminField label="License Number" required error={driverErrors.licenseNumber}>
                <input name="licenseNumber" value={driverForm.licenseNumber} onChange={handleDriverFormChange} placeholder="Enter 8-digit license" maxLength={8} className={adminInputCls(driverErrors.licenseNumber)} />
              </AdminField>
              <AdminField label="Contact Number" required error={driverErrors.contactNumber}>
                <input name="contactNumber" value={driverForm.contactNumber} onChange={handleDriverFormChange} placeholder="e.g. 0771234567" className={adminInputCls(driverErrors.contactNumber)} />
              </AdminField>
              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Assigned Bus" required error={driverErrors.assignedBus}>
                  <input name="assignedBus" value={driverForm.assignedBus} onChange={handleDriverFormChange} placeholder="e.g. UR-12" className={adminInputCls(driverErrors.assignedBus)} />
                </AdminField>
                <AdminField label="Shift" required error={driverErrors.shift}>
                  <select name="shift" value={driverForm.shift} onChange={handleDriverFormChange} className={adminInputCls(driverErrors.shift)}>
                    <option value="">Select shift</option>
                    {SHIFTS.map(s => <option key={s}>{s}</option>)}
                  </select>
                </AdminField>
              </div>
              <AdminField label="Route" required error={driverErrors.route}>
                <select name="route" value={driverForm.route} onChange={handleDriverFormChange} className={adminInputCls(driverErrors.route)}>
                  <option value="">Select route</option>
                  {routeOptions.map((route) => <option key={route}>{route}</option>)}
                </select>
              </AdminField>
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setDriverModal(false)} className="w-1/3 rounded-[18px] bg-slate-200 font-extrabold text-slate-700 hover:opacity-80 transition py-3">Cancel</button>
                <button type="submit" disabled={driverSaving || Object.keys(driverErrors).length > 0} className="w-2/3 rounded-[18px] bg-[#143d7a] py-3.5 font-extrabold text-white hover:opacity-90 disabled:opacity-50 transition">
                  {driverSaving ? "Saving..." : "Save Driver"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add / Edit Trip Modal */}
      {tripModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f45]/40 px-4 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-lg rounded-[30px] bg-white p-8 shadow-2xl">
            <button onClick={() => setTripModal(false)} className="absolute right-6 top-6 rounded-full bg-[#f7faff] p-2 text-[#5c79a8] hover:bg-[#e8eefb] transition"><FaTimes /></button>

            <div className="mb-6 flex items-center justify-between pr-10">
              <h2 className="text-3xl font-extrabold text-[#0b2f67]">{editingTrip ? "Edit Trip" : "Create Trip"}</h2>
              {!editingTrip && (
                <button type="button" onClick={preFillTrip} className="flex items-center gap-1.5 rounded-[14px] bg-[#fff3dc] px-3 py-1.5 text-xs font-extrabold text-[#d08a00] hover:opacity-80 transition">
                  <FaMagic /> Demo
                </button>
              )}
            </div>

            {tripSrvErr && <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 p-3 text-sm font-bold text-red-700">⚠ {tripSrvErr}</div>}

            <form onSubmit={submitTrip} className="space-y-4">
              <AdminField label="Assign Driver" required error={tripErrors.driver}>
                <select name="driver" value={tripForm.driver} onChange={handleTripFormChange} className={adminInputCls(tripErrors.driver)}>
                  <option value="">Select a driver...</option>
                  {drivers.map(d => <option key={d._id} value={d._id}>{d.name} ({d.assignedBus}) {d.status === "On Trip" && " - ON TRIP"}</option>)}
                </select>
              </AdminField>
              <AdminField label="Route" required error={tripErrors.route}>
                <select name="route" value={tripForm.route} onChange={handleTripFormChange} className={adminInputCls(tripErrors.route)}>
                  <option value="">Select route</option>
                  {routeOptions.map((route) => <option key={route}>{route}</option>)}
                </select>
              </AdminField>
              <AdminField label="Date" required error={tripErrors.date}>
                <input type="date" name="date" value={tripForm.date} onChange={handleTripFormChange} className={adminInputCls(tripErrors.date)} />
              </AdminField>
              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Start Time" required error={tripErrors.startTime}>
                  <input type="time" name="startTime" value={tripForm.startTime} onChange={handleTripFormChange} className={adminInputCls(tripErrors.startTime)} />
                </AdminField>
                <AdminField label="End Time" required error={tripErrors.endTime}>
                  <input type="time" name="endTime" value={tripForm.endTime} onChange={handleTripFormChange} className={adminInputCls(tripErrors.endTime)} />
                </AdminField>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <AdminField label="Status" error={tripErrors.status}>
                  <select name="status" value={tripForm.status || "Scheduled"} onChange={handleTripFormChange} className={adminInputCls("")}>
                    <option value="Scheduled">Scheduled</option>
                    <option value="Ongoing">Ongoing</option>
                    <option value="Completed">Completed</option>
                    <option value="Delayed">Delayed</option>
                  </select>
                </AdminField>
                <AdminField label="Passengers" error="">
                  <input type="number" name="passengers" value={tripForm.passengers} onChange={handleTripFormChange} className={adminInputCls("")} placeholder="e.g. 30" />
                </AdminField>
              </div>
              {tripForm.status === "Delayed" && (
                <AdminField label="Delay Reason" required error={tripErrors.delayReason}>
                  <textarea name="delayReason" value={tripForm.delayReason || ""} onChange={handleTripFormChange} rows={2} className={adminInputCls(tripErrors.delayReason) + " resize-none"} placeholder="State the reason for delay..." />
                </AdminField>
              )}
              <div className="mt-8 flex gap-3">
                <button type="button" onClick={() => setTripModal(false)} className="w-1/3 rounded-[18px] bg-slate-200 font-extrabold text-slate-700 hover:opacity-80 transition py-3">Cancel</button>
                <button type="submit" disabled={tripSaving || Object.keys(tripErrors).length > 0} className="w-2/3 rounded-[18px] bg-[#143d7a] py-3.5 font-extrabold text-white hover:opacity-90 disabled:opacity-50 transition">
                  {tripSaving ? "Saving..." : "Save Trip"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delay Modal */}
      {delayModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0b1f45]/40 px-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-[30px] bg-white p-8 shadow-2xl">
            <h2 className="text-3xl font-extrabold text-[#0b2f67]">Report Delay</h2>
            <p className="mt-3 text-base text-[#5c79a8]">Please state the reason for delay.</p>
            <textarea rows={3} value={delayReason} onChange={e => { setDelayReason(e.target.value); setDelayError(""); }}
              className={`mt-6 w-full rounded-[20px] border p-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff] ${delayError ? "border-red-300 bg-red-50" : "border-blue-100 bg-[#f7faff]"}`}
              placeholder="e.g. Heavy traffic..." />
            {delayError && <p className="mt-2 text-sm font-bold text-[#ef534f]">{delayError}</p>}
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button onClick={handleDelayConfirm} disabled={delaySaving} className="flex-1 rounded-[18px] bg-[#ef534f] px-5 py-3 text-sm font-extrabold text-white transition hover:opacity-90 disabled:opacity-60">
                Confirm Delay
              </button>
              <button onClick={() => setDelayModal(null)} className="rounded-[18px] bg-slate-200 px-5 py-3 text-sm font-extrabold text-slate-700 transition hover:opacity-90">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Shared admin-styled form helpers ───
function AdminField({ label, required, error, children }) {
  return (
    <div>
      <label className="mb-2 block text-base font-bold text-[#5c79a8]">
        {label} {required && <span className="text-[#ef534f]">*</span>}
      </label>
      {children}
      {error && <p className="mt-1.5 text-sm font-bold text-[#ef534f]">{error}</p>}
    </div>
  );
}

function adminInputCls(err) {
  return `w-full rounded-[20px] border p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff] ${
    err ? "border-red-300 bg-red-50" : "border-blue-100 bg-[#f7faff]"
  }`;
}
