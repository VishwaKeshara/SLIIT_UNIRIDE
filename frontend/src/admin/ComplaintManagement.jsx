import React, { useEffect, useState } from "react";
import axios from "../axiosinstance";

export default function ComplaintManagement() {
  const [complaints, setComplaints] = useState([]);
  const [replyData, setReplyData] = useState({});

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    try {
      const res = await axios.get("/complaints");
      setComplaints(res.data);
    } catch (error) {
      console.error("Failed to fetch complaints", error);
    }
  };

  const handleChange = (id, field, value) => {
    setReplyData({
      ...replyData,
      [id]: {
        ...replyData[id],
        [field]: value,
      },
    });
  };

  const handleUpdate = async (id) => {
    try {
      await axios.put(`/complaints/${id}`, {
        status: replyData[id]?.status || "Pending",
        adminReply: replyData[id]?.adminReply || "",
      });
      fetchComplaints();
    } catch (error) {
      console.error("Failed to update complaint", error);
    }
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>Complaint Management</h2>

      {complaints.length === 0 ? (
        <p>No complaints available.</p>
      ) : (
        complaints.map((c) => (
          <div
            key={c._id}
            style={{
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              marginBottom: "15px",
            }}
          >
            <p><strong>User:</strong> {c.userId?.name || "Unknown"}</p>
            <p><strong>Email:</strong> {c.userId?.email || "-"}</p>
            <p><strong>Complaint Type:</strong> {c.complaintType}</p>
            <p><strong>Message:</strong> {c.message}</p>
            <p><strong>Current Status:</strong> {c.status}</p>

            <select
              value={replyData[c._id]?.status || c.status}
              onChange={(e) => handleChange(c._id, "status", e.target.value)}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>

            <br /><br />

            <textarea
              rows="3"
              cols="50"
              placeholder="Admin Reply"
              value={replyData[c._id]?.adminReply || c.adminReply}
              onChange={(e) => handleChange(c._id, "adminReply", e.target.value)}
            />

            <br /><br />

            <button onClick={() => handleUpdate(c._id)} style={buttonStyle}>
              Update Complaint
            </button>
          </div>
        ))
      )}
    </div>
  );
}

const buttonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#0b2c74",
  color: "white",
  cursor: "pointer",
};