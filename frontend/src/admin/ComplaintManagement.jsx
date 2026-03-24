import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";

function ComplaintManagement() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [replyData, setReplyData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expandedId, setExpandedId] = useState(null);

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

      await fetchComplaints();
      alert("Complaint updated successfully");
      setExpandedId(null);
    } catch (error) {
      console.error("Failed to update complaint", error);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/adminlogin");
  };

  const filteredComplaints = useMemo(() => {
    return complaints.filter((complaint) => {
      const matchesSearch =
        complaint.userId?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.userId?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.complaintType?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        complaint.message?.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesStatus =
        statusFilter === "All" ? true : complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const pendingCount = complaints.filter((c) => c.status === "Pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "In Progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "Resolved").length;

  const getStatusBadge = (status) => {
    if (status === "Pending") {
      return "bg-red-100 text-red-700";
    }
    if (status === "In Progress") {
      return "bg-yellow-100 text-yellow-700";
    }
    return "bg-green-100 text-green-700";
  };

  return (
    <div className="min-h-screen flex bg-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col p-6">
        <div className="mb-10">
          <h2 className="text-2xl font-bold">Admin Panel</h2>
          <p className="text-slate-400 text-sm mt-2">Complaint System</p>
        </div>

        <nav className="flex flex-col gap-3">
          <Link
            to="/admin/dashboard"
            className="px-4 py-3 rounded-lg hover:bg-slate-800 transition"
          >
            Dashboard
          </Link>

          <Link
            to="/admin/users"
            className="px-4 py-3 rounded-lg hover:bg-slate-800 transition"
          >
            Manage Users
          </Link>

          <Link
            to="/admin/complaints"
            className="px-4 py-3 rounded-lg bg-blue-600 font-medium"
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

      {/* Main */}
      <main className="flex-1 p-8">
        {/* Header */}
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-800">Complaint Management</h1>
            <p className="text-slate-500 mt-2">
              Review, filter, and resolve complaints in one place.
            </p>
          </div>

          <div className="bg-white border rounded-xl shadow-sm px-5 py-4">
            <p className="text-sm text-slate-500">Total Complaints</p>
            <p className="text-2xl font-bold text-blue-700">{complaints.length}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl border shadow-sm p-5">
            <p className="text-sm text-slate-500">Pending</p>
            <p className="text-3xl font-bold text-red-600 mt-2">{pendingCount}</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <p className="text-sm text-slate-500">In Progress</p>
            <p className="text-3xl font-bold text-yellow-600 mt-2">{inProgressCount}</p>
          </div>

          <div className="bg-white rounded-xl border shadow-sm p-5">
            <p className="text-sm text-slate-500">Resolved</p>
            <p className="text-3xl font-bold text-green-600 mt-2">{resolvedCount}</p>
          </div>
        </div>

        {/* Filter bar */}
        <div className="bg-white rounded-xl border shadow-sm p-5 mb-6">
          <div className="flex flex-col lg:flex-row gap-4 lg:items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Search
              </label>
              <input
                type="text"
                placeholder="Search by user, email, type, or message"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              />
            </div>

            <div className="w-full lg:w-64">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="All">All</option>
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr className="text-left text-slate-700">
                  <th className="px-5 py-4">S.No</th>
                  <th className="px-5 py-4">User</th>
                  <th className="px-5 py-4">Complaint Type</th>
                  <th className="px-5 py-4">Message</th>
                  <th className="px-5 py-4">Status</th>
                  <th className="px-5 py-4">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="px-5 py-8 text-center text-slate-500">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint, index) => {
                    const isResolved = complaint.status === "Resolved";
                    const isExpanded = expandedId === complaint._id;

                    return (
                      <React.Fragment key={complaint._id}>
                        <tr className="border-t hover:bg-slate-50">
                          <td className="px-5 py-4">{index + 1}</td>
                          <td className="px-5 py-4">
                            <div className="font-medium text-slate-800">
                              {complaint.userId?.name || "Unknown"}
                            </div>
                            <div className="text-xs text-slate-500">
                              {complaint.userId?.email || "-"}
                            </div>
                          </td>
                          <td className="px-5 py-4">{complaint.complaintType}</td>
                          <td className="px-5 py-4 max-w-xs truncate">
                            {complaint.message}
                          </td>
                          <td className="px-5 py-4">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusBadge(
                                complaint.status
                              )}`}
                            >
                              {complaint.status}
                            </span>
                          </td>
                          <td className="px-5 py-4">
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : complaint._id)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                            >
                              {isExpanded ? "Close" : "View"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-slate-50 border-t">
                            <td colSpan="6" className="px-5 py-6">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white border rounded-xl p-5">
                                  <h3 className="font-semibold text-slate-800 mb-4">
                                    Complaint Details
                                  </h3>

                                  <div className="space-y-3 text-sm">
                                    <p>
                                      <span className="font-medium text-slate-700">
                                        User Name:
                                      </span>{" "}
                                      {complaint.userId?.name || "Unknown"}
                                    </p>
                                    <p>
                                      <span className="font-medium text-slate-700">
                                        Email Address:
                                      </span>{" "}
                                      {complaint.userId?.email || "-"}
                                    </p>
                                    <p>
                                      <span className="font-medium text-slate-700">
                                        Complaint Type:
                                      </span>{" "}
                                      {complaint.complaintType}
                                    </p>
                                    <p>
                                      <span className="font-medium text-slate-700">
                                        Message:
                                      </span>{" "}
                                      {complaint.message}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white border rounded-xl p-5">
                                  <h3 className="font-semibold text-slate-800 mb-4">
                                    Update Complaint
                                  </h3>

                                  <div className="space-y-4">
                                    <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Status
                                      </label>
                                      <select
                                        value={
                                          replyData[complaint._id]?.status ||
                                          complaint.status
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            complaint._id,
                                            "status",
                                            e.target.value
                                          )
                                        }
                                        disabled={isResolved}
                                        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                          isResolved
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-white"
                                        }`}
                                      >
                                        <option value="Pending">Pending</option>
                                        <option value="In Progress">In Progress</option>
                                        <option value="Resolved">Resolved</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-sm font-medium text-slate-700 mb-2">
                                        Admin Response
                                      </label>
                                      <textarea
                                        rows="4"
                                        placeholder="Enter admin response"
                                        value={
                                          replyData[complaint._id]?.adminReply ||
                                          complaint.adminReply ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            complaint._id,
                                            "adminReply",
                                            e.target.value
                                          )
                                        }
                                        disabled={isResolved}
                                        className={`w-full border rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-400 resize-none ${
                                          isResolved
                                            ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                            : "bg-white"
                                        }`}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between gap-3">
                                      <p className="text-sm text-slate-500">
                                        {isResolved
                                          ? "This complaint is resolved and locked."
                                          : "Save the latest complaint update."}
                                      </p>

                                      {isResolved ? (
                                        <span className="bg-green-100 text-green-700 px-4 py-2 rounded-lg text-sm font-medium">
                                          Complaint Closed
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleUpdate(complaint._id)}
                                          className="bg-blue-700 hover:bg-blue-800 text-white px-5 py-2 rounded-lg"
                                        >
                                          Save Update
                                        </button>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </React.Fragment>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}

export default ComplaintManagement;