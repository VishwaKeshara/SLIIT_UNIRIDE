import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaSearch } from "react-icons/fa";
import AdminSidebar from "./AdminSidebar";
import axios from "../axiosinstance";

const paymentBadgeClasses = {
  paid: "bg-[#dff7ec] text-[#049b63]",
  pending: "bg-[#fff3dc] text-[#d08a00]",
  failed: "bg-[#ffe3e1] text-[#ef534f]",
  refunded: "bg-slate-200 text-slate-600",
};

const verificationBadgeClasses = {
  verified: "bg-[#dff7ec] text-[#049b63]",
  unverified: "bg-[#e8eefb] text-[#0a3772]",
  rejected: "bg-[#ffe3e1] text-[#ef534f]",
};

function AnalyticsReports() {
  const [bookings, setBookings] = useState([]);
  const [summary, setSummary] = useState({ totalBookings: 0, peakHour: "N/A" });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentFilter, setPaymentFilter] = useState("all");
  const [verificationFilter, setVerificationFilter] = useState("all");
  const [updatingBookingId, setUpdatingBookingId] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [summaryRes, bookingsRes] = await Promise.all([
          axios.get("/admin/summary"),
          axios.get("/bookings"),
        ]);
        setSummary(summaryRes.data);
        setBookings(bookingsRes.data);
      } catch (fetchError) {
        setError(
          fetchError.response?.data?.message ||
            "Failed to load analytics and booking data."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const updateBookingInState = (updatedBooking) => {
    setBookings((current) =>
      current.map((booking) =>
        booking._id === updatedBooking._id ? updatedBooking : booking
      )
    );
  };

  const runBookingAction = async (bookingId, url, payload, successText) => {
    try {
      setUpdatingBookingId(bookingId);
      setError("");
      setSuccessMessage("");
      const res = await axios.patch(url, payload);
      updateBookingInState(res.data);
      setSuccessMessage(successText);
    } catch (updateError) {
      setError(updateError.response?.data?.message || "Booking update failed.");
    } finally {
      setUpdatingBookingId("");
    }
  };

  const filteredBookings = useMemo(() => {
    return bookings.filter((booking) => {
      const search = searchTerm.trim().toLowerCase();
      const routeLabel = booking.route
        ? `${booking.route.routeName || ""} ${booking.route.startLocation || ""} ${booking.route.endLocation || ""}`
        : "";
      const searchableText = [
        booking._id,
        booking.passengerName,
        booking.email,
        booking.mobileNumber,
        booking.paymentReference,
        routeLabel,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();

      const matchesSearch = search ? searchableText.includes(search) : true;
      const matchesPayment =
        paymentFilter === "all" ? true : booking.paymentStatus === paymentFilter;
      const matchesVerification =
        verificationFilter === "all"
          ? true
          : (booking.verificationStatus || "unverified") === verificationFilter;

      return matchesSearch && matchesPayment && matchesVerification;
    });
  }, [bookings, searchTerm, paymentFilter, verificationFilter]);

  const paidBookings = bookings.filter((booking) => booking.paymentStatus === "paid");
  const pendingBookings = bookings.filter((booking) => booking.paymentStatus === "pending");
  const failedBookings = bookings.filter((booking) => booking.paymentStatus === "failed");
  const refundedBookings = bookings.filter((booking) => booking.paymentStatus === "refunded");
  const totalRevenue = paidBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);
  const refundedAmount = refundedBookings.reduce((sum, booking) => sum + (booking.totalAmount || 0), 0);

  const duplicateRefs = useMemo(() => {
    const counts = {};
    bookings.forEach((booking) => {
      if (!booking.paymentReference) return;
      counts[booking.paymentReference] = (counts[booking.paymentReference] || 0) + 1;
    });
    return Object.keys(counts).filter((key) => counts[key] > 1);
  }, [bookings]);

  const statCards = [
    { label: "Total Revenue", value: `Rs. ${totalRevenue.toFixed(2)}` },
    { label: "Today's Bookings", value: summary.totalBookings || 0 },
    { label: "Pending Payments", value: pendingBookings.length },
    { label: "Failed Payments", value: failedBookings.length },
    { label: "Refunded Amount", value: `Rs. ${refundedAmount.toFixed(2)}` },
    { label: "Peak Booking Hour", value: summary.peakHour || "N/A" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />
      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">Analytics & Reports</h1>
            <p className="mt-3 max-w-3xl text-base text-[#5c79a8] sm:text-lg">
              Monitor bookings, payments, verification flow, revenue, refunds, and suspicious transaction patterns.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link to="/admin/dashboard" className="rounded-3xl bg-[#e8eefb] px-7 py-4 text-lg font-extrabold text-[#0a3772] shadow-sm transition hover:opacity-90">Dashboard</Link>
            <Link to="/admin/trips" className="rounded-3xl bg-[#ffbf00] px-7 py-4 text-lg font-extrabold text-[#111827] shadow-sm transition hover:opacity-90">Trip Monitoring</Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
              <p className="text-[1.05rem] font-bold text-[#5c79a8]">{card.label}</p>
              <h2 className="mt-5 text-4xl font-extrabold text-[#0b2f67]">{card.value}</h2>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Filter Payments</h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">Finance Control</span>
          </div>
          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">Search</label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c79a8]" />
                <input type="text" placeholder="Search booking, user, route, or transaction" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] py-3 pl-11 pr-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]" />
              </div>
            </div>
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">Payment Status</label>
              <select value={paymentFilter} onChange={(e) => setPaymentFilter(e.target.value)} className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]">
                <option value="all">All Payments</option>
                <option value="paid">PAID</option>
                <option value="pending">PENDING</option>
                <option value="failed">FAILED</option>
                <option value="refunded">REFUNDED</option>
              </select>
            </div>
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">Verification</label>
              <select value={verificationFilter} onChange={(e) => setVerificationFilter(e.target.value)} className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]">
                <option value="all">All Verification</option>
                <option value="verified">VERIFIED</option>
                <option value="unverified">UNVERIFIED</option>
                <option value="rejected">REJECTED</option>
              </select>
            </div>
          </div>
        </section>

        <div className="mb-8 grid grid-cols-1 gap-8 2xl:grid-cols-[1.2fr_0.8fr]">
          <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Payment Statistics</h3>
              <span className="rounded-full bg-[#dff7ec] px-5 py-2 text-lg font-bold text-[#049b63]">Revenue</span>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] p-5"><p className="text-base font-bold text-[#5c79a8]">PAID</p><h4 className="mt-3 text-4xl font-extrabold text-[#049b63]">{paidBookings.length}</h4></div>
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] p-5"><p className="text-base font-bold text-[#5c79a8]">PENDING</p><h4 className="mt-3 text-4xl font-extrabold text-[#d08a00]">{pendingBookings.length}</h4></div>
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] p-5"><p className="text-base font-bold text-[#5c79a8]">FAILED</p><h4 className="mt-3 text-4xl font-extrabold text-[#ef534f]">{failedBookings.length}</h4></div>
              <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] p-5"><p className="text-base font-bold text-[#5c79a8]">REFUNDED</p><h4 className="mt-3 text-4xl font-extrabold text-slate-600">{refundedBookings.length}</h4></div>
            </div>
          </section>

          <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Integrity Alerts</h3>
              <span className="rounded-full bg-[#ffe3e1] px-5 py-2 text-lg font-bold text-[#ef534f]">{duplicateRefs.length} Duplicate Refs</span>
            </div>
            <div className="space-y-4">
              {duplicateRefs.length === 0 ? (
                <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-5 py-8 text-center text-base font-bold text-[#5c79a8]">No duplicate payments detected.</div>
              ) : (
                duplicateRefs.map((reference) => (
                  <div key={reference} className="rounded-[24px] border border-[#ffd2cf] bg-[#fff7f6] px-5 py-5">
                    <h4 className="text-lg font-extrabold text-[#0b1f45]">{reference}</h4>
                    <p className="mt-2 text-sm text-[#ef534f]">Same transaction reference appears in multiple bookings. Review for fraud or duplicate payment.</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">Payment Monitoring</h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">{filteredBookings.length} Results</span>
          </div>
          {successMessage && <div className="mb-5 rounded-[20px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">{successMessage}</div>}
          {error && <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">{error}</div>}
          {loading ? (
            <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">Loading bookings...</div>
          ) : filteredBookings.length === 0 ? (
            <div className="rounded-[24px] border border-blue-100 bg-[#f7faff] px-6 py-12 text-center text-lg font-bold text-[#5c79a8]">No bookings found</div>
          ) : (
            <div className="overflow-x-auto rounded-[24px] border border-blue-100 bg-[#f7faff]">
              <table className="w-full min-w-[1200px] text-left">
                <thead><tr className="text-[#5c79a8]"><th className="px-6 py-5 text-base font-extrabold">Booking</th><th className="px-6 py-5 text-base font-extrabold">User</th><th className="px-6 py-5 text-base font-extrabold">Route</th><th className="px-6 py-5 text-base font-extrabold">Amount</th><th className="px-6 py-5 text-base font-extrabold">Payment</th><th className="px-6 py-5 text-base font-extrabold">Verification</th><th className="px-6 py-5 text-base font-extrabold">Transaction</th><th className="px-6 py-5 text-base font-extrabold">Actions</th></tr></thead>
                <tbody>
                  {filteredBookings.map((booking) => {
                    const paymentStatus = booking.paymentStatus || "pending";
                    const verificationStatus = booking.verificationStatus || "unverified";
                    const routeLabel = booking.route ? `${booking.route.startLocation} -> ${booking.route.endLocation}` : "Route unavailable";
                    return (
                      <tr key={booking._id} className="border-t border-blue-100 bg-white/60 text-[#0b1f45]">
                        <td className="px-6 py-5"><div className="text-base font-extrabold">B{booking._id.slice(-4).toUpperCase()}</div><div className="mt-1 text-sm text-[#617ba4] capitalize">{booking.status}</div></td>
                        <td className="px-6 py-5"><div className="text-base font-extrabold">{booking.passengerName}</div><div className="mt-1 text-sm text-[#617ba4]">{booking.email || booking.mobileNumber}</div></td>
                        <td className="px-6 py-5 text-base font-extrabold">{routeLabel}</td>
                        <td className="px-6 py-5 text-base font-extrabold">Rs. {(booking.totalAmount || 0).toFixed(2)}</td>
                        <td className="px-6 py-5"><span className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${paymentBadgeClasses[paymentStatus] || "bg-slate-200 text-slate-600"}`}>{paymentStatus.toUpperCase()}</span></td>
                        <td className="px-6 py-5"><span className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${verificationBadgeClasses[verificationStatus] || "bg-slate-200 text-slate-600"}`}>{verificationStatus.toUpperCase()}</span></td>
                        <td className="px-6 py-5 text-base">{booking.paymentReference || "No reference"}</td>
                        <td className="px-6 py-5">
                          <div className="flex flex-wrap gap-3">
                            {paymentStatus !== "paid" && <button type="button" onClick={() => runBookingAction(booking._id, `/bookings/${booking._id}/verify-payment`, { paymentReference: booking.paymentReference || `VER-${Date.now().toString(36).toUpperCase()}` }, "Payment verified successfully.")} disabled={updatingBookingId === booking._id} className="rounded-[18px] bg-[#143d7a] px-4 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90 disabled:opacity-60">Verify Payment</button>}
                            {paymentStatus !== "failed" && <button type="button" onClick={() => runBookingAction(booking._id, `/bookings/${booking._id}/payment`, { paymentStatus: "failed", verificationStatus: "rejected" }, "Payment marked as failed.")} disabled={updatingBookingId === booking._id} className="rounded-[18px] bg-[#ffe3e1] px-4 py-2.5 text-sm font-extrabold text-[#ef534f] transition hover:opacity-90 disabled:opacity-60">Mark Failed</button>}
                            {paymentStatus === "failed" && <button type="button" onClick={() => runBookingAction(booking._id, `/bookings/${booking._id}/payment`, { paymentStatus: "pending", verificationStatus: "unverified" }, "Re-payment enabled.")} disabled={updatingBookingId === booking._id} className="rounded-[18px] bg-[#fff3dc] px-4 py-2.5 text-sm font-extrabold text-[#d08a00] transition hover:opacity-90 disabled:opacity-60">Allow Re-Payment</button>}
                            {paymentStatus === "paid" && <button type="button" onClick={() => runBookingAction(booking._id, `/bookings/${booking._id}/refund`, { refundReason: "Admin approved refund" }, "Refund approved successfully.")} disabled={updatingBookingId === booking._id} className="rounded-[18px] bg-slate-200 px-4 py-2.5 text-sm font-extrabold text-slate-700 transition hover:opacity-90 disabled:opacity-60">Approve Refund</button>}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}

export default AnalyticsReports;
