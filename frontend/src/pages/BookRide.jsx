import React, { useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import axios from "axios";
import { jsPDF } from "jspdf";
import heroBusImage from "../assets/hero-bus.jpg";

const API = "http://localhost:5000/api";

function getLoggedInUser() {
  try {
    const userData = localStorage.getItem("userData");
    return userData ? JSON.parse(userData) : null;
  } catch {
    return null;
  }
}

function formatDate(dateValue, options = {}) {
  if (!dateValue) return "Not selected";

  return new Date(dateValue).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    ...options,
  });
}

const glassSection =
  "rounded-[30px] border border-white/65 bg-white/70 p-6 shadow-[0_25px_70px_rgba(14,116,144,0.12)] backdrop-blur-2xl";
const glassInput =
  "w-full rounded-2xl border border-sky-100/90 bg-white/90 px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:bg-slate-100";

function BookRide() {
  const location = useLocation();
  const storedUser = getLoggedInUser();
  const loggedInUserId = storedUser?.id;

  const [routes, setRoutes] = useState([]);
  const [stops, setStops] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [routesLoading, setRoutesLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [bookingBasis, setBookingBasis] = useState("daily");
  const [selectedMonth, setSelectedMonth] = useState("");

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
    method: "card",
    cardNumber: "",
    cardName: "",
    cardExpiry: "",
    cardCvv: "",
    cardProcessed: false,
  });

  useEffect(() => {
    if (!loggedInUserId) return;

    axios
      .get(`${API}/users/${loggedInUserId}`)
      .then((res) => {
        const user = res.data;
        setLoggedInUser(user);
        setForm((prev) => ({
          ...prev,
          passengerName: user.name || "",
          mobileNumber: user.phoneNumber || "",
          email: user.email || "",
          studentId: user.studentId || "",
        }));
      })
      .catch(() => {
        setLoggedInUser(null);
      });
  }, [loggedInUserId]);

  useEffect(() => {
    axios
      .get(`${API}/routes/active`)
      .then((res) => {
        setRoutes(res.data);
        const passedRoute = location.state?.selectedRoute;

        if (passedRoute?._id) {
          setForm((prev) => ({
            ...prev,
            selectedRoute: passedRoute._id,
          }));
        }
      })
      .catch(() => {
        setError("Failed to load routes. Please make sure the server is running.");
      })
      .finally(() => setRoutesLoading(false));
  }, [location.state]);

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

  const selectedRouteObj = useMemo(
    () => routes.find((route) => route._id === form.selectedRoute),
    [routes, form.selectedRoute],
  );

  const monthOptions = useMemo(() => {
    const options = [];
    const now = new Date();

    for (let i = 1; i <= 12; i += 1) {
      const monthDate = new Date(now.getFullYear(), now.getMonth() + i, 1);
      const value = `${monthDate.getFullYear()}-${String(
        monthDate.getMonth() + 1,
      ).padStart(2, "0")}`;

      options.push({
        value,
        label: monthDate.toLocaleDateString("en-US", {
          month: "long",
          year: "numeric",
        }),
      });
    }

    return options;
  }, []);

  const totalDays =
    form.travelStartDate && form.travelEndDate
      ? Math.round(
          (new Date(form.travelEndDate) - new Date(form.travelStartDate)) /
            86400000,
        ) + 1
      : 0;

  const pricePerDay = selectedRouteObj?.pricePerDay ?? 0;
  const totalAmount = totalDays * pricePerDay;

  const cardValid =
    payment.cardNumber.replace(/\s/g, "").length === 16 &&
    payment.cardName.trim().length >= 3 &&
    /^\d{2}\/\d{2}$/.test(payment.cardExpiry) &&
    payment.cardCvv.length >= 3;

  const paymentComplete = payment.method === "card" && payment.cardProcessed;

  const canSubmit =
    form.selectedRoute &&
    form.travelStartDate &&
    form.travelEndDate &&
    form.passengerName.trim() &&
    form.mobileNumber.trim() &&
    paymentComplete;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((prev) => {
      const next = {
        ...prev,
        [name]: value,
        ...(name === "selectedRoute" ? { boardingStop: "" } : {}),
      };

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

  const handleBookingBasisChange = (basis) => {
    setBookingBasis(basis);
    setSelectedMonth("");
    setForm((prev) => ({
      ...prev,
      travelStartDate: "",
      travelEndDate: "",
    }));
  };

  const handleMonthChange = (event) => {
    const value = event.target.value;
    setSelectedMonth(value);

    if (!value) {
      setForm((prev) => ({
        ...prev,
        travelStartDate: "",
        travelEndDate: "",
      }));
      return;
    }

    const [year, month] = value.split("-").map(Number);
    const firstDate = new Date(year, month - 1, 1);
    const lastDate = new Date(year, month, 0);
    const toInputFormat = (date) => date.toISOString().split("T")[0];

    setForm((prev) => ({
      ...prev,
      travelStartDate: toInputFormat(firstDate),
      travelEndDate: toInputFormat(lastDate),
    }));
  };

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

  const handleCardNumber = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 16);
    const formatted = digits.replace(/(.{4})/g, "$1 ").trim();
    setPayment((prev) => ({ ...prev, cardNumber: formatted }));
  };

  const handleCardExpiry = (event) => {
    const digits = event.target.value.replace(/\D/g, "").slice(0, 4);
    const formatted =
      digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;

    setPayment((prev) => ({ ...prev, cardExpiry: formatted }));
  };

  const resetForm = () => {
    setSuccess(null);
    setError(null);
    setBookingBasis("daily");
    setSelectedMonth("");
    setStops([]);
    setPayment({
      method: "card",
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

  const downloadPDF = () => {
    if (!success) return;

    const { booking, routeObj } = success;
    const refId = booking._id?.slice(-8).toUpperCase();
    const doc = new jsPDF({ unit: "pt", format: "a4" });
    const width = doc.internal.pageSize.getWidth();
    const height = doc.internal.pageSize.getHeight();

    doc.setFillColor(17, 24, 39);
    doc.rect(0, 0, width, 92, "F");

    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    doc.setTextColor(255, 255, 255);
    doc.text("SLIIT UniRide", 40, 40);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(11);
    doc.setTextColor(209, 213, 219);
    doc.text("Booking confirmation receipt", 40, 62);

    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.setTextColor(251, 146, 60);
    doc.text(`Reference: ${refId}`, width - 40, 42, { align: "right" });

    doc.setFont("helvetica", "normal");
    doc.setTextColor(229, 231, 235);
    doc.text(`Issued: ${formatDate(new Date())}`, width - 40, 60, {
      align: "right",
    });

    let y = 128;
    const left = 40;
    const right = 230;

    const section = (title) => {
      doc.setFillColor(243, 244, 246);
      doc.rect(left, y - 16, width - 80, 24, "F");
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.setTextColor(31, 41, 55);
      doc.text(title, left + 10, y);
      y += 30;
    };

    const row = (label, value, emphasis = false) => {
      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128);
      doc.text(label, left, y);

      doc.setFont("helvetica", emphasis ? "bold" : "normal");
      doc.setTextColor(emphasis ? 249 : 31, emphasis ? 115 : 41, emphasis ? 22 : 55);
      doc.text(String(value || "-"), right, y);

      doc.setDrawColor(229, 231, 235);
      doc.line(left, y + 6, width - 40, y + 6);
      y += 24;
    };

    section("Trip");
    row("Route", routeObj?.routeName);
    row("From", routeObj?.startLocation);
    row("To", routeObj?.endLocation);
    row("Boarding stop", booking.boardingStop?.stopName || "Main route boarding");
    row("Travel period", `${formatDate(booking.travelStartDate)} to ${formatDate(booking.travelEndDate)}`);

    y += 10;
    section("Passenger");
    row("Name", booking.passengerName);
    row("Mobile", booking.mobileNumber);
    row("Email", booking.email || "Not provided");
    row("Student ID", booking.studentId || "Not provided");

    y += 10;
    section("Payment");
    row("Method", "Card payment");
    row("Status", booking.paymentStatus);
    row("Days", `${booking.totalDays} day${booking.totalDays > 1 ? "s" : ""}`);
    row("Price per day", `LKR ${booking.pricePerDay?.toFixed(2) || "0.00"}`);
    row("Total", `LKR ${booking.totalAmount?.toFixed(2) || "0.00"}`, true);

    doc.setFillColor(17, 24, 39);
    doc.rect(0, height - 48, width, 48, "F");
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(209, 213, 219);
    doc.text("This is a system generated booking receipt.", width / 2, height - 20, {
      align: "center",
    });

    doc.save(`UniRide_Booking_${refId}.pdf`);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setSubmitting(true);
    setError(null);

    try {
      const payload = {
        passengerName: form.passengerName.trim(),
        mobileNumber: form.mobileNumber.trim(),
        isRegistered: Boolean(loggedInUser),
        route: form.selectedRoute,
        travelStartDate: form.travelStartDate,
        travelEndDate: form.travelEndDate,
        bookingBasis,
        ...(form.boardingStop ? { boardingStop: form.boardingStop } : {}),
        ...(form.email.trim() ? { email: form.email.trim() } : {}),
        ...(form.studentId.trim() ? { studentId: form.studentId.trim() } : {}),
        paymentMethod: payment.method,
        paymentStatus: "paid",
        paymentReference: `CARD-${Date.now()
          .toString(36)
          .toUpperCase()}`,
      };

      const response = await axios.post(`${API}/bookings`, payload);

      setSuccess({
        booking: response.data,
        routeObj: selectedRouteObj,
      });
    } catch (err) {
      setError(
        err.response?.data?.message || "Booking failed. Please try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    const { booking, routeObj } = success;
    const refId = booking._id?.slice(-8).toUpperCase();

    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] px-4 py-10 text-slate-900">
        <div className="mx-auto max-w-4xl">
          <div className="overflow-hidden rounded-[32px] border border-white/45 bg-white/18 shadow-[0_30px_90px_rgba(2,8,23,0.38)] backdrop-blur-2xl">
            <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="relative min-h-[320px]">
                <img
                  src={heroBusImage}
                  alt="Bus ready for booking"
                  className="h-full w-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-900/35 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
                  <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                    Booking Confirmed
                  </p>
                  <h1 className="mt-3 text-3xl font-semibold leading-tight">
                    Your ride is reserved and ready.
                  </h1>
                  <p className="mt-3 max-w-md text-sm text-slate-200">
                    Keep this reference for boarding and download the receipt if
                    you need a copy.
                  </p>
                </div>
              </div>

              <div className="p-8">
                <div className="rounded-3xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
                  Confirmation ID: <span className="font-semibold">{refId}</span>
                </div>

                <div className="mt-6 space-y-4 text-sm">
                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-slate-500">Route</p>
                    <p className="mt-1 text-base font-semibold text-slate-900">
                      {routeObj?.routeName || "Selected route"}
                    </p>
                    <p className="mt-1 text-slate-600">
                      {routeObj?.startLocation} to {routeObj?.endLocation}
                    </p>
                  </div>

                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Travel dates</p>
                      <p className="mt-1 font-semibold text-slate-900">
                        {formatDate(booking.travelStartDate)}
                      </p>
                      <p className="text-slate-600">
                        to {formatDate(booking.travelEndDate)}
                      </p>
                    </div>

                    <div className="rounded-2xl bg-slate-50 p-4">
                      <p className="text-slate-500">Payment</p>
                      <p className="mt-1 font-semibold capitalize text-slate-900">
                        {booking.paymentMethod}
                      </p>
                      <p className="text-slate-600 capitalize">
                        {booking.paymentStatus}
                      </p>
                    </div>
                  </div>

                  <div className="rounded-2xl bg-slate-50 p-4">
                    <p className="text-slate-500">Passenger</p>
                    <p className="mt-1 font-semibold text-slate-900">
                      {booking.passengerName}
                    </p>
                    <p className="text-slate-600">{booking.mobileNumber}</p>
                  </div>

                  <div className="rounded-2xl border border-cyan-200/70 bg-cyan-50/85 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-slate-500">Total fare</p>
                        <p className="mt-1 text-2xl font-semibold text-slate-900">
                          LKR {booking.totalAmount?.toFixed(2)}
                        </p>
                      </div>
                      <span className="rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-600">
                        {booking.totalDays} day{booking.totalDays > 1 ? "s" : ""}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={downloadPDF}
                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-600 px-5 py-3 text-sm font-medium text-white transition hover:bg-cyan-700"
                  >
                    Download receipt
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-300 px-5 py-3 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
                  >
                    Book another ride
                  </button>
                  <Link
                    to="/myrides"
                    className="inline-flex items-center justify-center rounded-2xl border border-cyan-300 bg-cyan-50 px-5 py-3 text-sm font-medium text-cyan-700 transition hover:bg-cyan-100"
                  >
                    View my rides
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!loggedInUserId) {
    return (
      <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.18),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)]">
        <section className="relative overflow-hidden text-white">
          <div className="absolute inset-0">
            <img
              src={heroBusImage}
              alt="Bus booking cover"
              className="h-full w-full object-cover opacity-35"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/90 to-slate-900/70" />
          </div>

          <div className="relative mx-auto flex min-h-[calc(100vh-80px)] max-w-5xl items-center px-4 py-12 sm:px-6 lg:px-8">
            <div className="grid w-full gap-8 rounded-[32px] border border-white/40 bg-white/18 p-6 shadow-[0_30px_90px_rgba(2,8,23,0.42)] backdrop-blur-2xl lg:grid-cols-[1.15fr_0.85fr] lg:p-8">
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-cyan-300">
                  Login Required
                </p>
                <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
                  Sign in before booking your ride.
                </h1>
                <p className="mt-4 max-w-2xl text-base leading-8 text-slate-200 sm:text-lg">
                  Guest users can still view schedules, drivers, and notifications,
                  but booking a shuttle is available only for logged-in UniRide users.
                </p>

                <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                  <Link
                    to="/login"
                    state={{
                      from: "/book",
                      selectedRoute: location.state?.selectedRoute || null,
                    }}
                    className="inline-flex items-center justify-center rounded-2xl bg-cyan-500 px-6 py-3 text-sm font-semibold text-white transition hover:bg-cyan-600"
                  >
                    Login to Book Ride
                  </Link>
                  <Link
                    to="/schedules"
                    className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/10"
                  >
                    View Schedules
                  </Link>
                </div>
              </div>

              <div className="rounded-[28px] border border-white/45 bg-white/20 p-6 backdrop-blur-xl">
                <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                  Guest Access
                </p>
                <div className="mt-6 space-y-4">
                  <div className="rounded-2xl border border-white/50 bg-white/72 p-4">
                    <p className="text-base font-semibold text-slate-900">You can view</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Schedules, drivers, and public trip notifications without signing in.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/50 bg-white/72 p-4">
                    <p className="text-base font-semibold text-slate-900">You need login for</p>
                    <p className="mt-2 text-sm leading-7 text-slate-600">
                      Booking rides, saving payment history, and connecting rides to your
                      personal profile.
                    </p>
                  </div>
                  {location.state?.selectedRoute && (
                    <div className="rounded-2xl border border-cyan-300/60 bg-cyan-50/85 p-4">
                      <p className="text-sm font-semibold text-cyan-700">
                        Selected route
                      </p>
                      <p className="mt-2 text-base font-semibold text-slate-900">
                        {location.state.selectedRoute.routeName ||
                          `${location.state.selectedRoute.startLocation} to ${location.state.selectedRoute.endLocation}`}
                      </p>
                      <p className="mt-1 text-sm text-slate-600">
                        After login, you can continue booking this route.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(125,211,252,0.32),_transparent_22%),radial-gradient(circle_at_bottom_right,_rgba(59,130,246,0.2),_transparent_26%),linear-gradient(180deg,#f7fbff_0%,#e0f2fe_44%,#f8fcff_100%)]">
      <section className="relative overflow-hidden text-white">
        <div className="absolute inset-0">
          <img
            src={heroBusImage}
            alt="Bus booking cover"
            className="h-full w-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(3,37,65,0.9)_0%,rgba(10,78,118,0.76)_45%,rgba(125,211,252,0.48)_100%)]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.18),_transparent_25%)]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl gap-8 px-4 py-12 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-200">
              UniRide Booking
            </p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight sm:text-5xl">
              Book your campus shuttle with a calm blue glass experience.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-200 sm:text-lg">
              Select your route, choose dates, confirm passenger details, and
              complete the booking in one place.
            </p>

            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              <div className="rounded-3xl border border-white/30 bg-white/14 p-4 shadow-[0_18px_35px_rgba(8,47,73,0.18)] backdrop-blur-md">
                <p className="text-sm text-sky-100/80">Active routes</p>
                <p className="mt-2 text-3xl font-semibold">{routes.length}</p>
              </div>
              <div className="rounded-3xl border border-white/30 bg-white/14 p-4 shadow-[0_18px_35px_rgba(8,47,73,0.18)] backdrop-blur-md">
                <p className="text-sm text-sky-100/80">Booking basis</p>
                <p className="mt-2 text-3xl font-semibold capitalize">
                  {bookingBasis}
                </p>
              </div>
              <div className="rounded-3xl border border-white/30 bg-white/14 p-4 shadow-[0_18px_35px_rgba(8,47,73,0.18)] backdrop-blur-md">
                <p className="text-sm text-sky-100/80">Current total</p>
                <p className="mt-2 text-3xl font-semibold">
                  LKR {totalAmount.toFixed(0)}
                </p>
              </div>
            </div>
          </div>

          <div className="self-end rounded-[30px] border border-white/30 bg-white/16 p-6 shadow-[0_22px_55px_rgba(8,47,73,0.22)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.35em] text-sky-200">
              Quick Summary
            </p>
            <div className="mt-5 space-y-4 text-sm text-slate-100">
              <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                <span className="text-sky-100/70">Route</span>
                <span className="text-right font-medium text-white">
                  {selectedRouteObj?.routeName || "Choose a route"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                <span className="text-sky-100/70">Travel period</span>
                <span className="text-right font-medium text-white">
                  {form.travelStartDate
                    ? `${formatDate(form.travelStartDate)} to ${formatDate(
                        form.travelEndDate,
                      )}`
                    : "Select dates"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4 border-b border-white/15 pb-4">
                <span className="text-sky-100/70">Boarding stop</span>
                <span className="text-right font-medium text-white">
                  {stops.find((stop) => stop._id === form.boardingStop)?.stopName ||
                    "Optional"}
                </span>
              </div>
              <div className="flex items-start justify-between gap-4">
                <span className="text-sky-100/70">Payment status</span>
                <span className="rounded-full border border-white/20 bg-white/14 px-3 py-1 text-xs font-medium text-white">
                  {payment.method
                    ? paymentComplete
                      ? "Ready to confirm"
                      : "Complete payment details"
                    : "Choose payment method"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 lg:py-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="rounded-2xl border border-red-200/80 bg-white/90 px-4 py-3 text-sm text-red-700 shadow-sm backdrop-blur-sm">
                {error}
              </div>
            )}

            <section className={glassSection}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                    Step 1
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    Trip details
                  </h2>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50/90 px-3 py-1 text-xs font-medium text-sky-700">
                  Route, stop, and date selection
                </span>
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div className="md:col-span-2">
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Select route
                  </label>
                  <select
                    name="selectedRoute"
                    value={form.selectedRoute}
                    onChange={handleChange}
                    required
                    disabled={routesLoading}
                    className={glassInput}
                  >
                    <option value="">
                      {routesLoading ? "Loading routes..." : "Choose a route"}
                    </option>
                    {routes.map((route) => (
                      <option key={route._id} value={route._id}>
                        {route.routeName} - {route.startLocation} to{" "}
                        {route.endLocation}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Boarding stop
                  </label>
                  <select
                    name="boardingStop"
                    value={form.boardingStop}
                    onChange={handleChange}
                    disabled={!stops.length}
                    className={glassInput}
                  >
                    <option value="">Choose a stop</option>
                    {stops.map((stop) => (
                      <option key={stop._id} value={stop._id}>
                        {stop.stopName}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Booking type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {["daily", "monthly"].map((basis) => (
                      <button
                        key={basis}
                        type="button"
                        onClick={() => handleBookingBasisChange(basis)}
                        className={`rounded-2xl border px-4 py-3 text-sm font-medium shadow-sm transition ${
                          bookingBasis === basis
                            ? "border-sky-300 bg-[linear-gradient(135deg,rgba(224,242,254,0.95),rgba(255,255,255,0.96))] text-sky-700 shadow-[0_14px_32px_rgba(14,165,233,0.12)]"
                            : "border-sky-100 bg-white/85 text-slate-600 hover:border-sky-200 hover:bg-sky-50/60"
                        }`}
                      >
                        {basis === "daily" ? "Daily pass" : "Monthly pass"}
                      </button>
                    ))}
                  </div>
                </div>

                {bookingBasis === "daily" ? (
                  <>
                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Start date
                      </label>
                      <input
                        type="date"
                        name="travelStartDate"
                        value={form.travelStartDate}
                        onChange={handleChange}
                        min={new Date().toISOString().split("T")[0]}
                        required
                        className={glassInput}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        End date
                      </label>
                      <input
                        type="date"
                        name="travelEndDate"
                        value={form.travelEndDate}
                        onChange={handleChange}
                        min={form.travelStartDate || new Date().toISOString().split("T")[0]}
                        required
                        className={glassInput}
                      />
                    </div>
                  </>
                ) : (
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-sm font-medium text-slate-700">
                      Select month
                    </label>
                    <select
                      value={selectedMonth}
                      onChange={handleMonthChange}
                      required
                      className={glassInput}
                    >
                      <option value="">Choose the travel month</option>
                      {monthOptions.map((month) => (
                        <option key={month.value} value={month.value}>
                          {month.label}
                        </option>
                      ))}
                    </select>
                    {form.travelStartDate && (
                      <p className="mt-2 text-xs text-slate-500">
                        Travel window: {formatDate(form.travelStartDate)} to{" "}
                        {formatDate(form.travelEndDate)}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </section>

            <section className={glassSection}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                    Step 2
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    Passenger details
                  </h2>
                </div>
                {loggedInUser && (
                  <span className="rounded-full border border-emerald-200 bg-emerald-50/90 px-3 py-1 text-xs font-medium text-emerald-700">
                    Auto-filled from your profile
                  </span>
                )}
              </div>

              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Full name
                  </label>
                  <input
                    type="text"
                    name="passengerName"
                    value={form.passengerName}
                    onChange={handleChange}
                    required
                    className={glassInput}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Mobile number
                  </label>
                  <input
                    type="tel"
                    name="mobileNumber"
                    value={form.mobileNumber}
                    onChange={handleChange}
                    required
                    className={glassInput}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Email address
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={form.email}
                    onChange={handleChange}
                    disabled={Boolean(loggedInUser)}
                    className={glassInput}
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-700">
                    Student ID
                  </label>
                  <input
                    type="text"
                    name="studentId"
                    value={form.studentId}
                    onChange={handleChange}
                    placeholder="Optional"
                    className={glassInput}
                  />
                </div>
              </div>
            </section>

            <section className={glassSection}>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                    Step 3
                  </p>
                  <h2 className="mt-1 text-2xl font-semibold text-slate-900">
                    Payment method
                  </h2>
                </div>
                <span className="rounded-full border border-sky-100 bg-sky-50/90 px-3 py-1 text-xs font-medium text-sky-700">
                  Demo payment flow
                </span>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  onClick={() => handlePaymentMethodChange("card")}
                  className={`rounded-[24px] border p-5 text-left shadow-sm transition ${
                    payment.method === "card"
                      ? "border-sky-300 bg-[linear-gradient(135deg,rgba(224,242,254,0.92),rgba(255,255,255,0.95))]"
                      : "border-sky-100 bg-white/85 hover:border-sky-200 hover:bg-sky-50/60"
                  }`}
                >
                  <p className="text-sm font-semibold text-slate-900">
                    Card payment
                  </p>
                  <p className="mt-1 text-sm text-slate-500">
                    Confirm card details now and complete instantly.
                  </p>
                </button>
              </div>

              {payment.method === "card" && (
                <div className="mt-6 rounded-[24px] border border-sky-100/90 bg-[linear-gradient(180deg,rgba(248,250,252,0.86),rgba(240,249,255,0.94))] p-5 shadow-inner">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="md:col-span-2">
                      <div className="rounded-[24px] bg-[linear-gradient(135deg,#0f172a_0%,#0c4a6e_55%,#38bdf8_130%)] p-5 text-white shadow-[0_18px_45px_rgba(14,116,144,0.28)]">
                        <p className="text-xs uppercase tracking-[0.35em] text-sky-200">
                          UniRide Card
                        </p>
                        <p className="mt-6 font-mono text-xl tracking-[0.35em]">
                          {payment.cardNumber || "0000 0000 0000 0000"}
                        </p>
                        <div className="mt-6 flex items-end justify-between">
                          <div>
                            <p className="text-xs text-slate-400">Cardholder</p>
                            <p className="mt-1 text-sm font-medium">
                              {payment.cardName || "YOUR NAME"}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-slate-400">Expiry</p>
                            <p className="mt-1 text-sm font-medium">
                              {payment.cardExpiry || "MM/YY"}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Card number
                      </label>
                      <input
                        type="text"
                        value={payment.cardNumber}
                        onChange={handleCardNumber}
                        maxLength={19}
                        placeholder="1234 5678 9012 3456"
                        className={glassInput}
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Cardholder name
                      </label>
                      <input
                        type="text"
                        value={payment.cardName}
                        onChange={(event) =>
                          setPayment((prev) => ({
                            ...prev,
                            cardName: event.target.value.toUpperCase(),
                          }))
                        }
                        placeholder="NAME SURNAME"
                        className={glassInput}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        Expiry
                      </label>
                      <input
                        type="text"
                        value={payment.cardExpiry}
                        onChange={handleCardExpiry}
                        maxLength={5}
                        placeholder="MM/YY"
                        className={glassInput}
                      />
                    </div>

                    <div>
                      <label className="mb-2 block text-sm font-medium text-slate-700">
                        CVV
                      </label>
                      <input
                        type="password"
                        value={payment.cardCvv}
                        onChange={(event) =>
                          setPayment((prev) => ({
                            ...prev,
                            cardCvv: event.target.value.replace(/\D/g, "").slice(0, 4),
                          }))
                        }
                        maxLength={4}
                        placeholder="123"
                        className={glassInput}
                      />
                    </div>
                  </div>

                  {!payment.cardProcessed ? (
                    <button
                      type="button"
                      disabled={!cardValid}
                      onClick={() =>
                        setPayment((prev) => ({ ...prev, cardProcessed: true }))
                      }
                      className="mt-5 inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0284c7,#2563eb)] px-5 py-3 text-sm font-medium text-white shadow-[0_14px_30px_rgba(37,99,235,0.26)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-slate-300 disabled:shadow-none"
                    >
                      Confirm card details
                    </button>
                  ) : (
                    <div className="mt-5 flex flex-col gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 sm:flex-row sm:items-center sm:justify-between">
                      <span>Card details confirmed. The booking is ready to submit.</span>
                      <button
                        type="button"
                        onClick={() =>
                          setPayment((prev) => ({ ...prev, cardProcessed: false }))
                        }
                        className="font-medium text-emerald-800 underline"
                      >
                        Edit card
                      </button>
                    </div>
                  )}
                </div>
              )}

            </section>

            <div className={`${glassSection} flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between`}>
              <div>
                <p className="text-sm font-medium text-slate-500">
                  Final check
                </p>
                <p className="mt-1 text-lg font-semibold text-slate-900">
                  {canSubmit
                    ? "Everything looks ready for confirmation."
                    : "Complete the required details to continue."}
                </p>
              </div>

              <button
                type="submit"
                disabled={!canSubmit || submitting}
                className="inline-flex items-center justify-center rounded-2xl bg-[linear-gradient(135deg,#0284c7,#2563eb)] px-6 py-3 text-sm font-medium text-white shadow-[0_16px_35px_rgba(37,99,235,0.25)] transition hover:brightness-110 disabled:cursor-not-allowed disabled:bg-sky-200 disabled:shadow-none"
              >
                {submitting ? "Processing booking..." : "Confirm booking"}
              </button>
            </div>
          </form>

          <aside className="space-y-6">
            <div className="sticky top-24 space-y-6">
              <section className={glassSection}>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                  Fare summary
                </p>

                <div className="mt-5 space-y-4 text-sm">
                  <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
                    <span className="text-slate-500">Route</span>
                    <span className="text-right font-medium text-slate-900">
                      {selectedRouteObj?.routeName || "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
                    <span className="text-slate-500">Schedule</span>
                    <span className="text-right font-medium text-slate-900">
                      {selectedRouteObj?.startTime || "Check route details"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
                    <span className="text-slate-500">Travel period</span>
                    <span className="text-right font-medium text-slate-900">
                      {form.travelStartDate
                        ? `${formatDate(form.travelStartDate)} to ${formatDate(
                            form.travelEndDate,
                          )}`
                        : "Not selected"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
                    <span className="text-slate-500">Duration</span>
                    <span className="text-right font-medium text-slate-900">
                      {totalDays ? `${totalDays} day${totalDays > 1 ? "s" : ""}` : "-"}
                    </span>
                  </div>
                  <div className="flex items-start justify-between gap-4 border-b border-sky-100 pb-4">
                    <span className="text-slate-500">Price per day</span>
                    <span className="text-right font-medium text-slate-900">
                      LKR {pricePerDay.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className="mt-5 rounded-3xl bg-[linear-gradient(135deg,#0f172a_0%,#0c4a6e_60%,#38bdf8_120%)] p-5 text-white shadow-[0_22px_50px_rgba(14,116,144,0.28)]">
                  <p className="text-sm text-sky-100/80">Estimated total</p>
                  <p className="mt-2 text-3xl font-semibold">
                    LKR {totalAmount.toFixed(2)}
                  </p>
                  <p className="mt-2 text-xs text-slate-400">
                    Fare is calculated from route pricing and selected travel
                    dates.
                  </p>
                </div>
              </section>

              <section className={glassSection}>
                <p className="text-sm uppercase tracking-[0.3em] text-sky-600">
                  Need help?
                </p>
                <div className="mt-4 space-y-3 text-sm text-slate-600">
                  <p>Choose a route first to unlock stops and pricing.</p>
                  <p>Monthly bookings automatically cover the full selected month.</p>
                  <p>Card details must be confirmed before the booking can be submitted.</p>
                </div>
                {loggedInUser && (
                  <Link
                    to="/profile"
                    className="mt-5 inline-flex items-center justify-center rounded-2xl border border-sky-200 bg-white/85 px-4 py-3 text-sm font-medium text-sky-700 transition hover:bg-sky-50"
                  >
                    Review profile details
                  </Link>
                )}
              </section>
            </div>
          </aside>
        </div>
      </section>
    </div>
  );
}

export default BookRide;
