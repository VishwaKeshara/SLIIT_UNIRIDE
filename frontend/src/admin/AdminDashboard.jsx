import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";

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
    <div className="min-h-screen flex bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <nav className="flex flex-col gap-4">
          <Link
            to="/admin/dashboard"
            className="bg-blue-700 px-4 py-3 rounded-lg font-medium"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="hover:bg-blue-700 px-4 py-3 rounded-lg transition"
          >
            Manage Users
          </Link>

          <Link
            to="/admin/complaints"
            className="hover:bg-blue-700 px-4 py-3 rounded-lg transition"
          >
            Manage Complaints
          </Link>
        </nav>

        <div className="mt-auto">
          <button
            onClick={handleLogout}
            className="w-full bg-red-500 hover:bg-red-600 px-4 py-3 rounded-lg font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8">
        {/* Top Header */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Admin Dashboard</h1>
            <p className="text-gray-500 mt-1">
              Welcome back. Here is the latest system overview.
            </p>
          </div>

          <div className="mt-4 md:mt-0 bg-white px-4 py-2 rounded-lg shadow text-sm text-gray-600">
            Logged in as <span className="font-semibold text-blue-700">Admin</span>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 mb-10">
          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-blue-600">
            <p className="text-gray-500 text-sm">Total Users</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{summary.totalUsers}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-yellow-500">
            <p className="text-gray-500 text-sm">Total Complaints</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{summary.totalComplaints}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-green-600">
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <h2 className="text-3xl font-bold text-gray-800 mt-2">{summary.totalBookings}</h2>
          </div>

          <div className="bg-white p-6 rounded-xl shadow border-l-4 border-purple-600">
            <p className="text-gray-500 text-sm">Peak Hour</p>
            <h2 className="text-2xl font-bold text-gray-800 mt-2">{summary.peakHour || "N/A"}</h2>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Actions */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">Quick Actions</h3>

            <div className="flex flex-wrap gap-4">
              <Link to="/admin/users">
                <button className="bg-blue-700 text-white px-5 py-3 rounded-lg hover:bg-blue-800">
                  Go to User Management
                </button>
              </Link>

              <Link to="/admin/complaints">
                <button className="bg-yellow-500 text-white px-5 py-3 rounded-lg hover:bg-yellow-600">
                  Go to Complaint Management
                </button>
              </Link>
            </div>
          </div>

          {/* Activity / Insights */}
          <div className="bg-white p-6 rounded-xl shadow">
            <h3 className="text-xl font-semibold mb-4 text-gray-800">System Insights</h3>

            <ul className="space-y-3 text-gray-700">
              <li className="border-b pb-2">
                Current busiest booking period:{" "}
                <span className="font-semibold text-blue-700">{summary.peakHour}</span>
              </li>
              <li className="border-b pb-2">
                Registered users in the system:{" "}
                <span className="font-semibold text-blue-700">{summary.totalUsers}</span>
              </li>
              <li className="border-b pb-2">
                Complaints currently recorded:{" "}
                <span className="font-semibold text-blue-700">{summary.totalComplaints}</span>
              </li>
              <li>
                Total bookings available in records:{" "}
                <span className="font-semibold text-blue-700">{summary.totalBookings}</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;