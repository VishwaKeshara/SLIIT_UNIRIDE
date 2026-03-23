import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosinstance";

export default function AdminDashboard() {
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

  return (
    <div style={{ padding: "30px" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: "20px", marginTop: "20px", flexWrap: "wrap" }}>
        <div style={cardStyle}>
          <h3>Total Users</h3>
          <p>{summary.totalUsers}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Complaints</h3>
          <p>{summary.totalComplaints}</p>
        </div>

        <div style={cardStyle}>
          <h3>Total Bookings</h3>
          <p>{summary.totalBookings}</p>
        </div>

        <div style={cardStyle}>
          <h3>Peak Hour</h3>
          <p>{summary.peakHour}</p>
        </div>
      </div>

      <div style={{ marginTop: "30px" }}>
        <Link to="/admin/users">
          <button style={buttonStyle}>Manage Users</button>
        </Link>

        <Link to="/admin/complaints" style={{ marginLeft: "10px" }}>
          <button style={buttonStyle}>Manage Complaints</button>
        </Link>
      </div>
    </div>
  );
}

const cardStyle = {
  border: "1px solid #ccc",
  borderRadius: "10px",
  padding: "20px",
  width: "200px",
  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
};

const buttonStyle = {
  padding: "10px 20px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#0b2c74",
  color: "white",
  cursor: "pointer",
};