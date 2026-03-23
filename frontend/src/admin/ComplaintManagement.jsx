import React, { useEffect, useState } from "react";
import axios from "../axiosinstance";

function ComplaintManagement() {
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
    setReplyData((prev) => ({
      ...prev,
      [id]: {
        ...prev[id],
        [field]: value,
      },
    }));
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
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">Complaint Management</h1>

      {complaints.length === 0 ? (
        <div className="bg-white shadow-md rounded-lg p-6 border text-center">
          <p>No complaints available.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {complaints.map((complaint) => (
            <div key={complaint._id} className="bg-white shadow-md rounded-lg p-6 border">
              <p className="mb-2">
                <strong>User:</strong> {complaint.userId?.name || "Unknown"}
              </p>
              <p className="mb-2">
                <strong>Email:</strong> {complaint.userId?.email || "-"}
              </p>
              <p className="mb-2">
                <strong>Complaint Type:</strong> {complaint.complaintType}
              </p>
              <p className="mb-2">
                <strong>Message:</strong> {complaint.message}
              </p>
              <p className="mb-4">
                <strong>Current Status:</strong> {complaint.status}
              </p>

              <div className="mb-4">
                <label className="block font-medium mb-1">Update Status</label>
                <select
                  value={replyData[complaint._id]?.status || complaint.status}
                  onChange={(e) => handleChange(complaint._id, "status", e.target.value)}
                  className="w-full md:w-64 border p-2 rounded"
                >
                  <option value="Pending">Pending</option>
                  <option value="In Progress">In Progress</option>
                  <option value="Resolved">Resolved</option>
                </select>
              </div>

              <div className="mb-4">
                <label className="block font-medium mb-1">Admin Reply</label>
                <textarea
                  rows="3"
                  placeholder="Enter admin reply"
                  value={replyData[complaint._id]?.adminReply || complaint.adminReply || ""}
                  onChange={(e) => handleChange(complaint._id, "adminReply", e.target.value)}
                  className="w-full border p-2 rounded"
                />
              </div>

              <button
                onClick={() => handleUpdate(complaint._id)}
                className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800"
              >
                Update Complaint
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ComplaintManagement;