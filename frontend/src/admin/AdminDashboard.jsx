import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import {
  FaUsers,
  FaExclamationCircle,
  FaBus,
  FaClock,
  FaTachometerAlt,
  FaUserCog,
  FaClipboardList,
  FaSignOutAlt,
  FaArrowUp,
} from "react-icons/fa";

function AdminDashboard() {
  const navigate = useNavigate();

  const [summary, setSummary] = useState({
    totalUsers: 0,
    totalComplaints: 0,
    totalBookings: 0,
    peakHour: "",
  });

  useEffect(() => {
    fetchSummary();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/admin/summary");
      setSummary(res.data);
    } catch (error) {
      console.error("Failed to fetch summary", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/adminlogin");
  };

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#f8fbff] via-[#eef6ff] to-[#f5f9ff]">
      {/* Sidebar */}
      <aside className="w-72 bg-[#1e293b] text-white flex flex-col p-8 shadow-xl">
        <div className="mb-12">
          <h2 className="text-3xl font-bold">UniRide</h2>
          <p className="text-gray-400 text-sm mt-1">Admin Panel</p>
        </div>

        <nav className="flex flex-col gap-4 text-base">
          <Link
            to="/admin/dashboard"
            className="flex items-center gap-3 bg-blue-600 px-5 py-3 rounded-xl font-semibold text-lg"
          >
            <FaTachometerAlt /> Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="flex items-center gap-3 hover:bg-gray-700 px-5 py-3 rounded-xl transition text-lg"
          >
            <FaUserCog /> Manage Users
          </Link>

          <Link
            to="/admin/complaints"
            className="flex items-center gap-3 hover:bg-gray-700 px-5 py-3 rounded-xl transition text-lg"
          >
            <FaClipboardList /> Complaints
          </Link>
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 bg-red-500 hover:bg-red-600 px-5 py-3 rounded-xl font-semibold text-lg"
          >
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 p-10">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <div>
            <p className="text-blue-600 font-semibold text-lg mb-2">
              Dashboard Overview
            </p>
            <h1 className="text-5xl font-bold text-slate-800">
              Welcome back
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Here’s what’s happening in your system today.
            </p>
          </div>

          <div className="bg-white px-6 py-4 rounded-2xl shadow-md border border-blue-100 text-base">
            <p className="text-slate-500 text-sm">Logged in as</p>
            <span className="font-bold text-blue-600 text-xl">Admin</span>
          </div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-8 mb-12">
          {/* Users */}
          <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-lg">Users</p>
                <h2 className="text-5xl font-bold mt-3 text-slate-800">
                  {summary.totalUsers}
                </h2>
                <div className="flex items-center gap-2 mt-4 text-emerald-500 text-sm font-medium">
                  <FaArrowUp />
                  Active records
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          {/* Complaints */}
          <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-lg">Complaints</p>
                <h2 className="text-5xl font-bold mt-3 text-slate-800">
                  {summary.totalComplaints}
                </h2>
                <div className="flex items-center gap-2 mt-4 text-red-500 text-sm font-medium">
                  <FaArrowUp />
                  Need attention
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <FaExclamationCircle className="text-red-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Bookings */}
          <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-lg">Bookings</p>
                <h2 className="text-5xl font-bold mt-3 text-slate-800">
                  {summary.totalBookings}
                </h2>
                <div className="flex items-center gap-2 mt-4 text-emerald-500 text-sm font-medium">
                  <FaArrowUp />
                  Daily system usage
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <FaBus className="text-green-500 text-2xl" />
              </div>
            </div>
          </div>

          {/* Peak Hour */}
          <div className="bg-white/90 backdrop-blur-sm p-7 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-slate-500 text-lg">Peak Hour</p>
                <h2 className="text-2xl font-bold mt-3 text-slate-800 leading-snug">
                  {summary.peakHour || "N/A"}
                </h2>
                <div className="flex items-center gap-2 mt-4 text-amber-500 text-sm font-medium">
                  <FaArrowUp />
                  Highest traffic time
                </div>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <FaClock className="text-yellow-500 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Quick Actions */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 min-h-[260px]">
            <h3 className="text-3xl font-bold mb-3 text-slate-800">
              Quick Actions
            </h3>
            <p className="text-slate-500 text-base mb-8">
              Easily manage users and complaints from here.
            </p>

            <div className="flex flex-wrap gap-5">
              <Link to="/admin/users">
                <button className="bg-gradient-to-r from-blue-500 to-sky-400 text-white px-8 py-4 rounded-2xl text-lg font-semibold hover:scale-105 transition shadow-md">
                  Manage Users
                </button>
              </Link>

              <Link to="/admin/complaints">
                <button className="bg-white border border-blue-200 text-blue-600 px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-blue-50 transition shadow-sm">
                  Manage Complaints
                </button>
              </Link>
            </div>
          </div>

          {/* Insights */}
          <div className="bg-white/90 backdrop-blur-sm p-8 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <h3 className="text-3xl font-bold mb-6 text-slate-800">
              System Insights
            </h3>

            <div className="space-y-5">
              <div className="p-4 rounded-2xl bg-blue-50 border border-blue-100">
                <p className="text-slate-500 text-sm">Peak booking time</p>
                <h4 className="text-blue-600 font-bold text-xl mt-1">
                  {summary.peakHour || "N/A"}
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                <p className="text-slate-500 text-sm">Total users</p>
                <h4 className="text-slate-800 font-bold text-2xl mt-1">
                  {summary.totalUsers}
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-red-50 border border-red-100">
                <p className="text-slate-500 text-sm">Complaints</p>
                <h4 className="text-slate-800 font-bold text-2xl mt-1">
                  {summary.totalComplaints}
                </h4>
              </div>

              <div className="p-4 rounded-2xl bg-green-50 border border-green-100">
                <p className="text-slate-500 text-sm">Bookings</p>
                <h4 className="text-slate-800 font-bold text-2xl mt-1">
                  {summary.totalBookings}
                </h4>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;