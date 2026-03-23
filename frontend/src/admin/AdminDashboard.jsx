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
    <div className="max-w-6xl mx-auto px-6 py-10">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8 gap-4">
        <h1 className="text-3xl font-bold text-center md:text-left">Admin Dashboard</h1>

        <button
          onClick={handleLogout}
          className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700"
        >
          Logout
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow-md rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Total Users</h3>
          <p className="text-2xl font-bold text-blue-700">{summary.totalUsers}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Total Complaints</h3>
          <p className="text-2xl font-bold text-blue-700">{summary.totalComplaints}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Total Bookings</h3>
          <p className="text-2xl font-bold text-blue-700">{summary.totalBookings}</p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-6 border">
          <h3 className="text-lg font-semibold mb-2">Peak Hour</h3>
          <p className="text-2xl font-bold text-blue-700">{summary.peakHour}</p>
        </div>
      </div>

      <div className="mt-10 flex flex-wrap gap-4 justify-center">
        <Link to="/admin/users">
          <button className="bg-blue-700 text-white px-6 py-3 rounded-lg hover:bg-blue-800">
            Manage Users
          </button>
        </Link>

        <Link to="/admin/complaints">
          <button className="bg-yellow-500 text-white px-6 py-3 rounded-lg hover:bg-yellow-600">
            Manage Complaints
          </button>
        </Link>
      </div>
    </div>
  );
}

export default AdminDashboard;