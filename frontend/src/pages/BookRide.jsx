import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";

const API = "http://localhost:5000/api";

function getLoggedInUserId() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData).id : null;
  } catch {
    return null;
  }
}

function BookRide() {
  const location = useLocation();
  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const LOGGED_IN_USER_ID = getLoggedInUserId();
  const [routesLoading, setRoutesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    selectedRoute: "",
    boardingStop: "",
    travelStartDate: "",
    travelEndDate: "",
    passengerName: "",
    mobileNumber: "",
    studentId: "",
    email: "",
  });

  const [payment, setPayment] = useState({
    method: "", // "card" | "cash"
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    cardProcessed: false,
  });

  // Fetch logged-in user profile and pre-fill form
  useEffect(() => {
    if (!LOGGED_IN_USER_ID) return;
    axios
      .get(`${API}/users/${LOGGED_IN_USER_ID}`)
      .then((res) => {
        const u = res.data;
        setLoggedInUser(u);
        setForm((prev) => ({
          ...prev,
          passengerName: u.name || "",
          mobileNumber: u.phoneNumber || "",
          email: u.email || "",
          studentId: u.studentId || "",
        }));
      })
      .catch(() => {
        setLoggedInUser(null);
      });
  }, []);

  // Fetch active routes on mount; pre-select route passed from Schedules page
  useEffect(() => {
    axios
      .get(`${API}/routes/active`)
      .then((res) => {
        setRoutes(res.data);
        const passedRoute = location.state?.selectedRoute;
        if (passedRoute?._id) {
          setForm((prev) => ({ ...prev, selectedRoute: passedRoute._id }));
        }
      })
      .catch(() =>
        setError(
          "Failed to load routes. Please make sure the server is running.",
        ),
      )
      .finally(() => setRoutesLoading(false));
  }, []);

  // Fetch stops when selected route changes
  useEffect(() => {
    if (!form.selectedRoute) {
      setStops([]);
      return;
    }
    axios
      .get(`${API}/stops/route/${form.selectedRoute}`)
      .then((res) => setStops(res.data))
      .catch(() => setStops([]));
  }, [form.selectedRoute]);

  const selectedRouteObj = routes.find((r) => r._id === form.selectedRoute);

  const handlePaymentMethodChange = (method) => {
    setPayment({
      method,
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
      cardProcessed: false,
    });
  };

  const handleCardNumber = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setPayment((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleCardExpiry = (e) => {
    const digits = e.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted =
      digits.length > 2 ? digits.slice(0, 2) + "/" + digits.slice(2) : digits;
    setPayment((prev) => ({ ...prev, cardExpiry: formatted }));
  };

  // Compute date range stats (derived from form)
  const totalDays =
    form.travelStartDate && form.travelEndDate
      ? Math.round(
          (new Date(form.travelEndDate) - new Date(form.travelStartDate)) /
            86400000,
        ) + 1
      : 0;
  const pricePerDay = selectedRouteObj?.pricePerDay ?? 0;
  const totalAmount = totalDays * pricePerDay;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
        ...(name === "selectedRoute" ? { boardingStop: "" } : {}),
      };
      // Reset end date if it's before the new start date
      if (
        name === "travelStartDate" &&
        next.travelEndDate &&
        next.travelEndDate < value
      ) {
        next.travelEndDate = "";
      }
      return next;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      const payload = {
        passengerName: form.passengerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        isRegistered: !!loggedInUser,
        route: form.selectedRoute,
        travelStartDate: form.travelStartDate,
        travelEndDate: form.travelEndDate,
        ...(form.boardingStop ? { boardingStop: form.boardingStop } : {}),
        ...(form.email ? { email: form.email.trim() } : {}),
        ...(form.studentId ? { studentId: form.studentId.trim() } : {}),
        paymentMethod: payment.method,
        paymentStatus: payment.method === "cash" ? "pending" : "paid",
        ...(payment.method !== "cash"
          ? {
              paymentReference: `MOCK-${Date.now().toString(36).toUpperCase()}`,
            }
          : {}),
      };
      const res = await axios.post(`${API}/bookings`, payload);
      setSuccess({ booking: res.data, routeObj: selectedRouteObj });
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setSuccess(null);
    setError(null);
    setPayment({
      method: "",
      cardNumber: "",
      cardName: "",
      cardExpiry: "",
      cardCvv: "",
      cardProcessed: false,
    });
    setForm({
      selectedRoute: "",
      boardingStop: "",
      travelStartDate: "",
      travelEndDate: "",
      passengerName: loggedInUser?.name || "",
      mobileNumber: loggedInUser?.phoneNumber || "",
      email: loggedInUser?.email || "",
      studentId: loggedInUser?.studentId || "",
    });
  };

  // ── PDF download ─────────────────────────────────────────────────────────────
  const downloadPDF = () => {
    const { booking, routeObj } = success;
    const refId = booking._id?.slice(-8).toUpperCase();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const W = doc.internal.pageSize.getWidth();

    // ── Header band ──
    doc.setFillColor(14, 62, 99); // #0E3E63
    doc.rect(0, 0, W, 80, "F");
    doc.setFillColor(249, 115, 22); // orange-500
    doc.rect(0, 80, W, 6, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(255, 255, 255);
    doc.text("SLIIT-UniRide", 40, 38);
    doc.setFontSize(11);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(203, 213, 225); // slate-300
    doc.text("Booking Confirmation", 40, 58);

    // Ref badge (top-right)
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(249, 115, 22);
    doc.text(`REF: ${refId}`, W - 40, 45, { align: "right" });
    const issuedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(203, 213, 225);
    doc.text(`Issued: ${issuedDate}`, W - 40, 62, { align: "right" });

    // ── Section helper ──
    let y = 115;
    const COL1 = 40;
    const COL2 = 220;
    const LINE_H = 24;

    const sectionTitle = (title) => {
      doc.setFillColor(243, 244, 246); // gray-100
      doc.rect(COL1, y - 14, W - 80, 22, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(14, 62, 99);
      doc.text(title, COL1 + 8, y + 2);
      y += 28;
    };

    const row = (label, value, highlight = false) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(100, 116, 139); // slate-500
      doc.text(label, COL1, y);
      doc.setFont("helvetica", highlight ? "bold" : "normal");
      if (highlight) {
        doc.setTextColor(249, 115, 22); // orange-500
      } else {
        doc.setTextColor(30, 41, 59); // slate-800
      }
      doc.text(String(value ?? "—"), COL2, y);
      // light separator
      doc.setDrawColor(226, 232, 240);
      doc.line(COL1, y + 6, W - 40, y + 6);
      y += LINE_H;
    };

    // ── Route Details ──
    sectionTitle("Route Details");
    row("Route Name", routeObj?.routeName);
    row("From", routeObj?.startLocation);
    row("To", routeObj?.endLocation);
    if (routeObj?.startTime) row("Departure Time", routeObj.startTime);

    y += 8;
    // ── Travel Dates ──
    sectionTitle("Travel Dates");
    row(
      "Start Date",
      new Date(booking.travelStartDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    row(
      "End Date",
      new Date(booking.travelEndDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      }),
    );
    row(
      "Duration",
      `${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""}`,
    );

    y += 8;
    // ── Passenger Details ──
    sectionTitle("Passenger Details");
    row("Full Name", booking.passengerName);
    row("Mobile", booking.mobileNumber);
    if (booking.email) row("Email", booking.email);
    if (booking.studentId) row("Student ID", booking.studentId);
    row("Booking Type", booking.isRegistered ? "Registered User" : "Guest");

    y += 8;
    // ── Payment ──
    sectionTitle("Payment");
    const methodLabel =
      booking.paymentMethod === "card"
        ? "Card Payment (Mock)"
        : "Cash on Board";
    row("Method", methodLabel);
    row("Status", booking.paymentStatus === "paid" ? "Paid" : "Pay on Board");
    if (booking.paymentReference) row("Reference", booking.paymentReference);
    if (booking.pricePerDay > 0) {
      row("Price per Day", `LKR ${booking.pricePerDay.toFixed(2)}`);
      row("Total Amount", `LKR ${booking.totalAmount.toFixed(2)}`, true);
    }

    y += 8;
    // ── Booking Status ──
    sectionTitle("Booking Status");
    row("Status", booking.status?.toUpperCase() ?? "CONFIRMED");

    // ── Footer ──
    const pageH = doc.internal.pageSize.getHeight();
    doc.setFillColor(14, 62, 99);
    doc.rect(0, pageH - 46, W, 46, "F");
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      "SLIIT-UniRide · Faculty of Computing, SLIIT Malabe",
      W / 2,
      pageH - 26,
      { align: "center" },
    );
    doc.text(
      "This is a computer-generated document. No signature required.",
      W / 2,
      pageH - 12,
      { align: "center" },
    );

    doc.save(`UniRide_Booking_${refId}.pdf`);
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (success) {
    const { booking, routeObj } = success;
    const refId = booking._id?.slice(-8).toUpperCase();
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] flex items-center justify-center px-4 py-16 text-white">
        <div className="w-full max-w-lg rounded-3xl bg-white/10 backdrop-blur-md border border-white/20 p-10 shadow-2xl text-center">
          <div className="text-5xl mb-4">🎉</div>
          <h2 className="text-2xl font-extrabold text-white mb-1">
            Booking Confirmed!
          </h2>
          <p className="text-sm text-slate-300 mb-6">
            Your seat has been reserved.
          </p>

          <div className="rounded-2xl bg-black/20 border border-white/10 p-5 text-left text-sm space-y-3">
            <p>
              <span className="font-semibold text-orange-400">
                Reference&nbsp;ID:
              </span>{" "}
              <span className="font-mono font-bold text-white">{refId}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Route:</span>{" "}
              <span className="text-slate-300">{routeObj?.routeName}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">From → To:</span>{" "}
              <span className="text-slate-300">
                {routeObj?.startLocation} → {routeObj?.endLocation}
              </span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">
                Travel Period:
              </span>{" "}
              <span className="text-slate-300">
                {new Date(booking.travelStartDate).toLocaleDateString()} →{" "}
                {new Date(booking.travelEndDate).toLocaleDateString()}
              </span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Days:</span>{" "}
              <span className="text-slate-300">
                {booking.totalDays} day{booking.totalDays > 1 ? "s" : ""}
              </span>
            </p>
            {booking.pricePerDay > 0 && (
              <p>
                <span className="font-semibold text-orange-400">
                  Total Fare:
                </span>{" "}
                <span className="text-white font-bold">
                  LKR {booking.totalAmount?.toFixed(2)}
                </span>
                <span className="text-slate-400 text-xs ml-1">
                  (LKR {booking.pricePerDay?.toFixed(2)} × {booking.totalDays}{" "}
                  day{booking.totalDays > 1 ? "s" : ""})
                </span>
              </p>
            )}
            <p>
              <span className="font-semibold text-orange-400">Passenger:</span>{" "}
              <span className="text-slate-300">{booking.passengerName}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Mobile:</span>{" "}
              <span className="text-slate-300">{booking.mobileNumber}</span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Status:</span>{" "}
              <span className="inline-block px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-semibold capitalize border border-emerald-400/30">
                {booking.status}
              </span>
            </p>
            <p>
              <span className="font-semibold text-orange-400">Payment:</span>{" "}
              <span className="text-slate-300 capitalize">
                {booking.paymentMethod === "card"
                  ? "Card (Mock)"
                  : booking.paymentMethod === "wallet"
                    ? "Digital Wallet (Mock)"
                    : "Cash on Board"}
              </span>
              {booking.paymentStatus && (
                <span
                  className={`ml-2 inline-block px-2 py-0.5 rounded-full text-xs font-semibold border ${
                    booking.paymentStatus === "paid"
                      ? "bg-emerald-400/10 text-emerald-400 border-emerald-400/30"
                      : "bg-yellow-400/10 text-yellow-400 border-yellow-400/30"
                  }`}
                >
                  {booking.paymentStatus === "paid" ? "Paid" : "Pay on Board"}
                </span>
              )}
            </p>
            {booking.paymentReference && (
              <p>
                <span className="font-semibold text-orange-400">
                  Payment Ref:
                </span>{" "}
                <span className="font-mono text-xs text-slate-400">
                  {booking.paymentReference}
                </span>
              </p>
            )}
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={downloadPDF}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-white/10 border border-white/20 text-white font-bold rounded-xl hover:bg-white/20 transition-colors active:scale-95"
            >
              <span>📄</span> Download PDF
            </button>
            <button
              onClick={resetForm}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-orange-500 text-white font-bold rounded-xl hover:bg-orange-600 transition-colors shadow-lg shadow-orange-500/20 active:scale-95"
            >
              <span>🚌</span> Book Another Ride
            </button>
          </div>
        </div>
      </div>
    );
  }

  const today = new Date().toISOString().split("T")[0];
  const showTripDetails = !!form.selectedRoute;
  const showPassengerForm = !!(
    form.selectedRoute &&
    form.travelStartDate &&
    form.travelEndDate
  );
  const showPriceSummary =
    showPassengerForm &&
    !!(form.passengerName.trim() && form.mobileNumber.trim());

  const passengerDetailsFilled = showPriceSummary;
  const showPaymentSection = showPriceSummary;

  const cardValid =
    payment.method === "card" &&
    payment.cardNumber.replace(/\s/g, "").length === 16 &&
    payment.cardName.trim().length >= 2 &&
    /^\d{2}\/\d{2}$/.test(payment.cardExpiry) &&
    payment.cardCvv.length >= 3;

  const paymentComplete =
    payment.method === "cash" ||
    (payment.method === "card" && payment.cardProcessed);

  // ── Booking form ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A2233] via-[#123B57] to-[#16476A] text-white">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 py-10 lg:py-14">
        <div
          className={`flex gap-8 items-start ${loggedInUser ? "flex-col lg:flex-row" : ""}`}
        >
          <div
            className={
              loggedInUser ? "flex-1 min-w-0" : "w-full max-w-2xl mx-auto"
            }
          >
            <p className="text-sm uppercase tracking-[0.2em] text-orange-400 font-bold mb-2">
              SLIIT-UniRide
            </p>
            <h1 className="text-3xl font-extrabold text-white mb-1">
              Book a Shuttle Ride
            </h1>
            <p className="text-slate-300 mb-8">
              Reserve your seat on an upcoming SLIIT-UniRide shuttle.
            </p>

            {error && (
              <div className="mb-5 rounded-xl bg-red-500/10 border border-red-500/30 px-4 py-3 text-red-400 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* ── Section 1: Route ─────────────────────────────────────────────── */}
              <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                  <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                    1
                  </span>
                  Select Route
                </h2>

                <label className="block text-sm font-medium text-slate-300 mb-1">
                  Active Route <span className="text-red-400">*</span>
                </label>
                {routesLoading ? (
                  <p className="text-sm text-slate-400">Loading routes…</p>
                ) : (
                  <select
                    name="selectedRoute"
                    value={form.selectedRoute}
                    onChange={handleChange}
                    required
                    className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm bg-[#0A2233] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                  >
                    <option value="">-- Select a route --</option>
                    {routes.map((r) => (
                      <option key={r._id} value={r._id}>
                        {r.routeName} &nbsp;({r.startLocation} → {r.endLocation}
                        )
                      </option>
                    ))}
                  </select>
                )}

                {selectedRouteObj && (
                  <div className="mt-4 rounded-2xl bg-black/20 border border-white/10 p-4 text-sm text-slate-300 space-y-1">
                    <p>
                      <span className="font-medium text-orange-400">
                        Departure:
                      </span>{" "}
                      {selectedRouteObj.startTime}
                    </p>
                    <p>
                      <span className="font-medium text-orange-400">
                        Available Seats:
                      </span>{" "}
                      {selectedRouteObj.seatCapacity}
                    </p>
                    <p>
                      <span className="font-medium text-orange-400">
                        Schedule:
                      </span>{" "}
                      {selectedRouteObj.recurrence === "none"
                        ? "One-time"
                        : selectedRouteObj.recurrence === "daily"
                          ? "Daily"
                          : `Weekly (${selectedRouteObj.days?.join(", ")})`}
                    </p>
                  </div>
                )}
              </div>

              {/* ── Section 2: Trip Details ──────────────────────────────────────── */}
              {showTripDetails && (
                <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                      2
                    </span>
                    Trip Details
                  </h2>

                  {stops.length > 0 && (
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Boarding Stop{" "}
                        <span className="text-slate-400">(optional)</span>
                      </label>
                      <select
                        name="boardingStop"
                        value={form.boardingStop}
                        onChange={handleChange}
                        className="w-full rounded-xl border border-white/20 px-3 py-2 text-sm bg-[#0A2233] text-white focus:outline-none focus:ring-2 focus:ring-orange-500"
                      >
                        <option value="">
                          -- Select your boarding stop --
                        </option>
                        {stops.map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.order}. {s.stopName}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Start Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="travelStartDate"
                        value={form.travelStartDate}
                        onChange={handleChange}
                        required
                        min={today}
                        className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        End Date <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="date"
                        name="travelEndDate"
                        value={form.travelEndDate}
                        onChange={handleChange}
                        required
                        min={form.travelStartDate || today}
                        disabled={!form.travelStartDate}
                        className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-40 disabled:cursor-not-allowed"
                      />
                    </div>
                  </div>

                  {totalDays > 0 && (
                    <p className="mt-2 text-xs text-orange-300 font-medium">
                      📅 {totalDays} day{totalDays > 1 ? "s" : ""} selected
                    </p>
                  )}
                </div>
              )}

              {/* ── Section 3: Passenger Info ────────────────────────────────────── */}
              {showPassengerForm && (
                <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                      3
                    </span>
                    Passenger Details
                  </h2>

                  {/* ── Logged-in user banner ─────────────────────────────────── */}
                  {loggedInUser ? (
                    <div className="flex items-center gap-3 p-3 mb-5 rounded-xl bg-orange-500/10 border border-orange-500/30">
                      <div className="flex-shrink-0 w-9 h-9 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-400 flex items-center justify-center text-sm font-bold">
                        {loggedInUser.name.slice(0, 1).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-white">
                          {loggedInUser.name}
                        </p>
                        <p className="text-xs text-orange-400">
                          Logged in · {loggedInUser.role}
                        </p>
                      </div>
                      <span className="ml-auto inline-block px-2 py-0.5 rounded-full bg-emerald-400/10 text-emerald-400 text-xs font-semibold border border-emerald-400/30">
                        ✓ Registered
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 p-3 mb-5 rounded-xl bg-white/5 border border-white/10 text-slate-300 text-sm">
                      <span className="text-base">👤</span>
                      <span>
                        Booking as{" "}
                        <span className="font-semibold text-orange-400">
                          guest
                        </span>{" "}
                        — enter your details below. Your mobile number will be
                        used to track your rides.
                      </span>
                    </div>
                  )}

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Full Name <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="text"
                        name="passengerName"
                        value={form.passengerName}
                        onChange={handleChange}
                        required
                        readOnly={!!loggedInUser}
                        placeholder="Enter your full name"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          loggedInUser
                            ? "border-white/10 bg-black/20 text-slate-400 cursor-not-allowed"
                            : "border-white/20 bg-[#0A2233] text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Mobile Number <span className="text-red-400">*</span>
                      </label>
                      <input
                        type="tel"
                        name="mobileNumber"
                        value={form.mobileNumber}
                        onChange={handleChange}
                        required
                        readOnly={!!loggedInUser}
                        placeholder="e.g. 0771234567"
                        pattern="[0-9+\-\s]{7,15}"
                        title="Enter a valid mobile number (7–15 digits)"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          loggedInUser
                            ? "border-white/10 bg-black/20 text-slate-400 cursor-not-allowed"
                            : "border-white/20 bg-[#0A2233] text-white"
                        }`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-1">
                        Email <span className="text-slate-400">(optional)</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={form.email}
                        onChange={handleChange}
                        readOnly={!!loggedInUser}
                        placeholder="student@sliit.lk"
                        className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500 ${
                          loggedInUser
                            ? "border-white/10 bg-black/20 text-slate-400 cursor-not-allowed"
                            : "border-white/20 bg-[#0A2233] text-white"
                        }`}
                      />
                    </div>

                    {/* Student ID — only shown for registered users */}
                    {loggedInUser && (
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1">
                          Student ID{" "}
                          <span className="text-slate-400">(optional)</span>
                        </label>
                        <input
                          type="text"
                          name="studentId"
                          value={form.studentId}
                          onChange={handleChange}
                          placeholder="e.g. IT22000000"
                          className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* ── Section 4: Price Summary ───────────────────────────────────── */}
              {showPriceSummary && (
                <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                      4
                    </span>
                    Price Summary
                  </h2>

                  <div className="rounded-2xl bg-black/20 border border-white/10 p-5 space-y-3 text-sm">
                    <div className="flex justify-between text-slate-300">
                      <span>Route</span>
                      <span className="font-medium text-white">
                        {selectedRouteObj?.routeName}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Travel Period</span>
                      <span className="font-medium text-white">
                        {new Date(form.travelStartDate).toLocaleDateString()} →{" "}
                        {new Date(form.travelEndDate).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Number of Days</span>
                      <span className="font-medium text-white">
                        {totalDays} day{totalDays > 1 ? "s" : ""}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Price per Day</span>
                      <span className="font-medium text-white">
                        {pricePerDay > 0 ? (
                          `LKR ${pricePerDay.toFixed(2)}`
                        ) : (
                          <span className="text-slate-400 italic">Not set</span>
                        )}
                      </span>
                    </div>

                    <div className="border-t border-white/10 pt-3 flex justify-between items-center">
                      <span className="font-semibold text-white text-base">
                        Total Amount
                      </span>
                      <span className="text-xl font-extrabold text-orange-400">
                        {pricePerDay > 0 ? (
                          `LKR ${totalAmount.toFixed(2)}`
                        ) : (
                          <span className="text-slate-400 text-sm italic">
                            — pricing N/A
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {pricePerDay === 0 && (
                    <p className="mt-3 text-xs text-yellow-400 flex items-center gap-1.5">
                      <span>⚠</span> Price not configured for this route.
                      Confirm fare with the driver.
                    </p>
                  )}
                </div>
              )}

              {/* ── Section 5: Payment Method ──────────────────────────────────── */}
              {showPaymentSection && (
                <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6">
                  <h2 className="text-base font-semibold text-white mb-4 flex items-center gap-2">
                    <span className="flex items-center justify-center w-6 h-6 rounded-full bg-orange-500 text-white text-xs font-bold">
                      5
                    </span>
                    Payment Method
                  </h2>

                  {/* Method selector */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
                    {[
                      {
                        key: "card",
                        icon: "💳",
                        label: "Card Payment",
                        desc: "Visa / Mastercard",
                      },
                      {
                        key: "cash",
                        icon: "💵",
                        label: "Cash on Board",
                        desc: "Pay the driver",
                      },
                    ].map(({ key, icon, label, desc }) => (
                      <button
                        key={key}
                        type="button"
                        onClick={() => handlePaymentMethodChange(key)}
                        className={`flex flex-col items-center gap-1.5 rounded-2xl border p-4 text-center transition-all ${
                          payment.method === key
                            ? "border-orange-500 bg-orange-500/10 text-white ring-2 ring-orange-500/40"
                            : "border-white/20 bg-white/5 text-slate-300 hover:border-orange-400/50 hover:bg-white/10"
                        }`}
                      >
                        <span className="text-2xl">{icon}</span>
                        <span className="text-sm font-semibold">{label}</span>
                        <span className="text-xs text-slate-400">{desc}</span>
                      </button>
                    ))}
                  </div>

                  {/* ── Card Payment Form (mock) ── */}
                  {payment.method === "card" && (
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-5 space-y-4">
                      <div className="flex items-center gap-2">
                        <span className="inline-block px-2 py-0.5 rounded-full bg-yellow-400/10 text-yellow-400 text-xs font-semibold border border-yellow-400/30">
                          Demo Mode
                        </span>
                        <span className="text-xs text-slate-400">
                          No real payment is processed — this is a simulation.
                        </span>
                      </div>

                      {/* Mock card preview */}
                      <div className="rounded-2xl bg-gradient-to-br from-orange-600 to-orange-900 p-4 text-white shadow-lg select-none">
                        <p className="text-xs text-orange-200 mb-3 font-semibold tracking-widest">
                          UNIRIDE CARD
                        </p>
                        <p className="font-mono text-base tracking-widest mb-3">
                          {payment.cardNumber || "•••• •••• •••• ••••"}
                        </p>
                        <div className="flex justify-between text-xs text-orange-200">
                          <span>{payment.cardName || "CARDHOLDER NAME"}</span>
                          <span>{payment.cardExpiry || "MM/YY"}</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Card Number
                        </label>
                        <input
                          type="text"
                          value={payment.cardNumber}
                          onChange={handleCardNumber}
                          placeholder="1234 5678 9012 3456"
                          maxLength={19}
                          className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-300 mb-1">
                          Cardholder Name
                        </label>
                        <input
                          type="text"
                          value={payment.cardName}
                          onChange={(e) =>
                            setPayment((prev) => ({
                              ...prev,
                              cardName: e.target.value.toUpperCase(),
                            }))
                          }
                          placeholder="JOHN DOE"
                          className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm uppercase focus:outline-none focus:ring-2 focus:ring-orange-500"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            Expiry (MM/YY)
                          </label>
                          <input
                            type="text"
                            value={payment.cardExpiry}
                            onChange={handleCardExpiry}
                            placeholder="MM/YY"
                            maxLength={5}
                            disabled={payment.cardProcessed}
                            className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-300 mb-1">
                            CVV
                          </label>
                          <input
                            type="password"
                            value={payment.cardCvv}
                            onChange={(e) =>
                              setPayment((prev) => ({
                                ...prev,
                                cardCvv: e.target.value
                                  .replace(/\D/g, "")
                                  .slice(0, 4),
                              }))
                            }
                            placeholder="•••"
                            maxLength={4}
                            disabled={payment.cardProcessed}
                            className="w-full rounded-xl border border-white/20 bg-[#0A2233] text-white px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-50"
                          />
                        </div>
                      </div>

                      {/* Confirm Card button */}
                      {!payment.cardProcessed ? (
                        <button
                          type="button"
                          disabled={!cardValid}
                          onClick={() =>
                            setPayment((prev) => ({
                              ...prev,
                              cardProcessed: true,
                            }))
                          }
                          className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors"
                        >
                          💳 Confirm Card Details
                        </button>
                      ) : (
                        <div className="flex items-center justify-between text-sm text-emerald-400 bg-emerald-400/10 border border-emerald-400/30 rounded-xl px-4 py-3">
                          <span className="flex items-center gap-2">
                            <span className="text-lg">✓</span>
                            <div>
                              <p className="font-semibold">
                                Card Confirmed (Mock)
                              </p>
                              <p className="text-xs text-slate-400">
                                Ready to complete booking.
                              </p>
                            </div>
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setPayment((prev) => ({
                                ...prev,
                                cardProcessed: false,
                              }))
                            }
                            className="text-xs text-slate-400 hover:text-white underline"
                          >
                            Edit
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* ── Cash on Board Info ── */}
                  {payment.method === "cash" && (
                    <div className="rounded-2xl bg-black/20 border border-white/10 p-5 text-sm text-slate-300 space-y-2">
                      <p className="flex items-center gap-2">
                        <span className="text-green-400">✓</span>
                        Your seat will be reserved. Please pay the driver cash
                        when you board.
                      </p>
                      {pricePerDay > 0 ? (
                        <p className="flex items-center gap-2">
                          <span className="text-orange-400">💰</span>
                          Amount due:{" "}
                          <span className="text-white font-bold ml-1">
                            LKR {totalAmount.toFixed(2)}
                          </span>
                          <span className="text-slate-400 text-xs">
                            (LKR {pricePerDay.toFixed(2)} × {totalDays} day
                            {totalDays > 1 ? "s" : ""})
                          </span>
                        </p>
                      ) : (
                        <p className="flex items-center gap-2">
                          <span className="text-orange-400">ℹ</span>
                          Have the exact fare ready. Confirm amount with the
                          driver.
                        </p>
                      )}
                    </div>
                  )}
                </div>
              )}

              {/* ── Submit ───────────────────────────────────────────────────────── */}
              {showPaymentSection && paymentComplete && (
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-white font-bold rounded-xl transition-colors text-sm shadow-lg shadow-orange-500/20 active:scale-95"
                >
                  {submitting
                    ? payment.method === "card"
                      ? "Processing Payment…"
                      : "Confirming Booking…"
                    : payment.method === "cash"
                      ? "Confirm & Reserve Seat"
                      : "Confirm & Pay"}
                </button>
              )}
            </form>
          </div>

          {/* ── Profile Side Panel ──────────────────────────────────────────────── */}
          {loggedInUser && (
            <div className="w-full lg:w-72 flex-shrink-0">
              <div className="rounded-3xl bg-white/10 backdrop-blur-md shadow-2xl border border-white/20 p-6 sticky top-24">
                <h3 className="text-sm font-bold text-orange-400 uppercase tracking-[0.2em] mb-4">
                  Your Profile
                </h3>

                {/* Avatar + Name */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-400 flex items-center justify-center text-xl font-bold flex-shrink-0">
                    {loggedInUser.name?.slice(0, 1).toUpperCase()}
                  </div>
                  <div>
                    <p className="font-bold text-white text-base leading-tight">
                      {loggedInUser.name}
                    </p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-orange-500/20 text-orange-400 text-xs font-semibold capitalize border border-orange-500/30">
                      {loggedInUser.role}
                    </span>
                  </div>
                </div>

                {/* Details */}
                <div className="space-y-3 text-sm text-slate-300 border-t border-white/10 pt-4">
                  <div>
                    <p className="text-xs text-slate-400 font-medium mb-0.5">
                      Email
                    </p>
                    <p className="truncate">{loggedInUser.email}</p>
                  </div>
                  {loggedInUser.phoneNumber && (
                    <div>
                      <p className="text-xs text-slate-400 font-medium mb-0.5">
                        Mobile
                      </p>
                      <p>{loggedInUser.phoneNumber}</p>
                    </div>
                  )}
                </div>

                {/* View Profile Link */}
                <Link
                  to="/profile"
                  className="mt-5 block w-full text-center py-2.5 rounded-xl border border-orange-500/50 text-orange-400 text-sm font-semibold hover:bg-orange-500/10 transition-colors"
                >
                  View Full Profile →
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default BookRide;
