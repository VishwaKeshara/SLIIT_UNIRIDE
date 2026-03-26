import React, { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import {
  FaTachometerAlt,
  FaUserCog,
  FaClipboardList,
  FaSignOutAlt,
  FaSearch,
  FaExclamationCircle,
  FaCheckCircle,
  FaSpinner,
} from "react-icons/fa";

function ComplaintManagement() {
  const navigate = useNavigate();

  const [complaints, setComplaints] = useState([]);
  const [replyData, setReplyData] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
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
        status: replyData[id]?.status || "pending",
        adminResponse: replyData[id]?.adminResponse || "",
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
      const search = searchTerm.toLowerCase();

      const matchesSearch =
        complaint.userName?.toLowerCase().includes(search) ||
        complaint.userEmail?.toLowerCase().includes(search) ||
        complaint.title?.toLowerCase().includes(search) ||
        complaint.type?.toLowerCase().includes(search) ||
        complaint.message?.toLowerCase().includes(search);

      const matchesStatus =
        statusFilter === "all" ? true : complaint.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [complaints, searchTerm, statusFilter]);

  const pendingCount = complaints.filter((c) => c.status === "pending").length;
  const inProgressCount = complaints.filter((c) => c.status === "in progress").length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const getStatusBadge = (status) => {
    if (status === "pending") return "bg-red-100 text-red-700";
    if (status === "in progress") return "bg-yellow-100 text-yellow-700";
    if (status === "rejected") return "bg-gray-200 text-gray-700";
    return "bg-green-100 text-green-700";
  };

  const formatStatus = (status) => {
    if (status === "in progress") return "In Progress";
    if (status === "resolved") return "Resolved";
    if (status === "rejected") return "Rejected";
    return "Pending";
  };

  const formatType = (type) => {
    if (type === "booking") return "Booking Issue";
    if (type === "driver") return "Driver Issue";
    if (type === "schedule") return "Schedule Issue";
    if (type === "payment") return "Payment Issue";
    return "Other";
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
            className="flex items-center gap-3 hover:bg-gray-700 px-5 py-3 rounded-xl transition text-lg"
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
            className="flex items-center gap-3 bg-blue-600 px-5 py-3 rounded-xl font-semibold text-lg"
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
        <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5 mb-10">
          <div>
            <p className="text-blue-600 font-semibold text-lg mb-2">
              Complaint Overview
            </p>
            <h1 className="text-5xl font-bold text-slate-800">
              Complaint Management
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Review, track, and resolve user complaints.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 text-base">
            <p className="text-slate-500">Total Complaints</p>
            <p className="text-4xl font-bold text-blue-600 mt-1">{complaints.length}</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg">Pending</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{pendingCount}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <FaExclamationCircle className="text-red-500 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg">In Progress</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{inProgressCount}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-yellow-100 flex items-center justify-center">
                <FaSpinner className="text-yellow-500 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg">Resolved</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{resolvedCount}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <FaCheckCircle className="text-green-500 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 p-6 mb-8">
          <div className="flex flex-col lg:flex-row gap-5 lg:items-end">
            <div className="flex-1">
              <label className="block text-base font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by user, email, title, type, or message"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full border border-blue-100 rounded-2xl py-3 pl-11 pr-4 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
                />
              </div>
            </div>

            <div className="w-full lg:w-72">
              <label className="block text-base font-medium text-slate-700 mb-2">
                Status Filter
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border border-blue-100 rounded-2xl p-3 text-base bg-white focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-base">
              <thead className="bg-[#edf4ff]">
                <tr className="text-left text-slate-700">
                  <th className="px-6 py-5">S.No</th>
                  <th className="px-6 py-5">User</th>
                  <th className="px-6 py-5">Title</th>
                  <th className="px-6 py-5">Type</th>
                  <th className="px-6 py-5">Message</th>
                  <th className="px-6 py-5">Status</th>
                  <th className="px-6 py-5">Action</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="px-6 py-10 text-center text-slate-500 text-lg">
                      No complaints found.
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint, index) => {
                    const isResolved = complaint.status === "resolved";
                    const isExpanded = expandedId === complaint._id;

                    return (
                      <React.Fragment key={complaint._id}>
                        <tr className="border-t border-blue-50 hover:bg-[#f8fbff] transition">
                          <td className="px-6 py-5">{index + 1}</td>
                          <td className="px-6 py-5">
                            <div className="font-semibold text-slate-800">
                              {complaint.userName || "Unknown"}
                            </div>
                            <div className="text-sm text-slate-500 mt-1">
                              {complaint.userEmail || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-slate-700">{complaint.title}</td>
                          <td className="px-6 py-5 text-slate-700">{formatType(complaint.type)}</td>
                          <td className="px-6 py-5 max-w-xs truncate text-slate-600">
                            {complaint.message}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`px-4 py-2 rounded-full text-sm font-semibold ${getStatusBadge(
                                complaint.status
                              )}`}
                            >
                              {formatStatus(complaint.status)}
                            </span>
                          </td>
                          <td className="px-6 py-5">
                            <button
                              onClick={() =>
                                setExpandedId(isExpanded ? null : complaint._id)
                              }
                              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl text-base transition"
                            >
                              {isExpanded ? "Close" : "View"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="bg-[#f8fbff] border-t border-blue-100">
                            <td colSpan="7" className="px-6 py-8">
                              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm">
                                  <h3 className="text-2xl font-semibold text-slate-800 mb-5">
                                    Complaint Details
                                  </h3>

                                  <div className="space-y-4 text-base text-slate-700">
                                    <p>
                                      <span className="font-semibold">User Name:</span>{" "}
                                      {complaint.userName || "Unknown"}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Email Address:</span>{" "}
                                      {complaint.userEmail || "-"}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Title:</span>{" "}
                                      {complaint.title}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Complaint Type:</span>{" "}
                                      {formatType(complaint.type)}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Message:</span>{" "}
                                      {complaint.message}
                                    </p>
                                    <p>
                                      <span className="font-semibold">Current Response:</span>{" "}
                                      {complaint.adminResponse || "No response yet"}
                                    </p>
                                  </div>
                                </div>

                                <div className="bg-white border border-blue-100 rounded-3xl p-6 shadow-sm">
                                  <h3 className="text-2xl font-semibold text-slate-800 mb-5">
                                    Update Complaint
                                  </h3>

                                  <div className="space-y-5">
                                    <div>
                                      <label className="block text-base font-medium text-slate-700 mb-2">
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
                                        className={`w-full border border-blue-100 rounded-2xl p-3 text-base focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                          isResolved
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white"
                                        }`}
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-base font-medium text-slate-700 mb-2">
                                        Admin Response
                                      </label>
                                      <textarea
                                        rows="5"
                                        placeholder="Enter admin response"
                                        value={
                                          replyData[complaint._id]?.adminResponse ||
                                          complaint.adminResponse ||
                                          ""
                                        }
                                        onChange={(e) =>
                                          handleChange(
                                            complaint._id,
                                            "adminResponse",
                                            e.target.value
                                          )
                                        }
                                        disabled={isResolved}
                                        className={`w-full border border-blue-100 rounded-2xl p-3 text-base resize-none focus:outline-none focus:ring-2 focus:ring-blue-400 ${
                                          isResolved
                                            ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                                            : "bg-white"
                                        }`}
                                      />
                                    </div>

                                    <div className="flex items-center justify-between gap-4 flex-wrap">
                                      <p className="text-base text-slate-500">
                                        {isResolved
                                          ? "This complaint is resolved and locked."
                                          : "Save the latest complaint update."}
                                      </p>

                                      {isResolved ? (
                                        <span className="bg-green-100 text-green-700 px-5 py-2.5 rounded-xl text-base font-semibold">
                                          Complaint Closed
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() => handleUpdate(complaint._id)}
                                          className="bg-blue-700 hover:bg-blue-800 text-white px-6 py-3 rounded-xl text-base font-medium transition"
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