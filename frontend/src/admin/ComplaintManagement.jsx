import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AdminSidebar from "./AdminSidebar";
import axios from "../axiosinstance";
import { FaSearch } from "react-icons/fa";

function ComplaintManagement() {
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
  const inProgressCount = complaints.filter(
    (c) => c.status === "in progress"
  ).length;
  const resolvedCount = complaints.filter((c) => c.status === "resolved").length;

  const statCards = [
    { label: "Pending Complaints", value: pendingCount },
    { label: "In Progress", value: inProgressCount },
    { label: "Resolved", value: resolvedCount },
  ];

  const getStatusBadge = (status) => {
    if (status === "pending") return "bg-[#ffe3e1] text-[#ef534f]";
    if (status === "in progress") return "bg-[#fff3dc] text-[#d08a00]";
    if (status === "rejected") return "bg-slate-200 text-slate-600";
    return "bg-[#dff7ec] text-[#049b63]";
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
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              Complaint Management
            </h1>
          </div>

          <div className="flex flex-wrap gap-4">
            <Link
              to="/admin/dashboard"
              className="rounded-3xl bg-[#e8eefb] px-7 py-4 text-lg font-extrabold text-[#0a3772] shadow-sm transition hover:opacity-90"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="rounded-3xl bg-[#ffbf00] px-7 py-4 text-lg font-extrabold text-[#111827] shadow-sm transition hover:opacity-90"
            >
              Manage Users
            </Link>
          </div>
        </div>

        <div className="mb-8 grid grid-cols-1 gap-6 xl:grid-cols-3">
          {statCards.map((card) => (
            <div
              key={card.label}
              className="rounded-[30px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]"
            >
              <p className="text-[1.05rem] font-bold text-[#5c79a8]">
                {card.label}
              </p>
              <h2 className="mt-5 text-5xl font-extrabold text-[#0b2f67]">
                {card.value}
              </h2>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
              Filter Complaints
            </h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
              Admin Control
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr]">
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c79a8]" />
                <input
                  type="text"
                  placeholder="Search by user, email, title, type, or message"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] py-3 pl-11 pr-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Status
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="in progress">In Progress</option>
                <option value="resolved">Resolved</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
              Complaint Records
            </h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
              {filteredComplaints.length} Results
            </span>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-blue-100 bg-[#f7faff]">
            <table className="w-full min-w-[980px] text-left">
              <thead>
                <tr className="text-[#5c79a8]">
                  <th className="px-6 py-5 text-base font-extrabold">#</th>
                  <th className="px-6 py-5 text-base font-extrabold">User</th>
                  <th className="px-6 py-5 text-base font-extrabold">Title</th>
                  <th className="px-6 py-5 text-base font-extrabold">Type</th>
                  <th className="px-6 py-5 text-base font-extrabold">Message</th>
                  <th className="px-6 py-5 text-base font-extrabold">Status</th>
                  <th className="px-6 py-5 text-base font-extrabold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredComplaints.length === 0 ? (
                  <tr>
                    <td
                      colSpan="7"
                      className="px-6 py-12 text-center text-lg font-bold text-[#5c79a8]"
                    >
                      No complaints found
                    </td>
                  </tr>
                ) : (
                  filteredComplaints.map((complaint, index) => {
                    const isResolved = complaint.status === "resolved";
                    const isExpanded = expandedId === complaint._id;

                    return (
                      <React.Fragment key={complaint._id}>
                        <tr className="border-t border-blue-100 bg-white/60 text-[#0b1f45]">
                          <td className="px-6 py-5 text-base font-bold">
                            {index + 1}
                          </td>
                          <td className="px-6 py-5">
                            <div className="text-base font-extrabold">
                              {complaint.userName || "Unknown"}
                            </div>
                            <div className="mt-1 text-sm text-[#617ba4]">
                              {complaint.userEmail || "-"}
                            </div>
                          </td>
                          <td className="px-6 py-5 text-base font-extrabold">
                            {complaint.title}
                          </td>
                          <td className="px-6 py-5 text-base">
                            {formatType(complaint.type)}
                          </td>
                          <td className="max-w-xs truncate px-6 py-5 text-base">
                            {complaint.message}
                          </td>
                          <td className="px-6 py-5">
                            <span
                              className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${getStatusBadge(
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
                              className="rounded-[18px] bg-[#143d7a] px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90"
                            >
                              {isExpanded ? "Close" : "View"}
                            </button>
                          </td>
                        </tr>

                        {isExpanded && (
                          <tr className="border-t border-blue-100 bg-[#f2f7ff]">
                            <td colSpan="7" className="px-6 py-8">
                              <div className="grid grid-cols-1 gap-6 xl:grid-cols-2">
                                <div className="rounded-[24px] border border-blue-100 bg-white p-6">
                                  <h4 className="text-2xl font-extrabold text-[#0b2f67]">
                                    Complaint Details
                                  </h4>

                                  <div className="mt-5 space-y-4 text-base text-[#0b1f45]">
                                    <p>
                                      <span className="font-extrabold">
                                        User Name:
                                      </span>{" "}
                                      {complaint.userName || "Unknown"}
                                    </p>
                                    <p>
                                      <span className="font-extrabold">
                                        Email:
                                      </span>{" "}
                                      {complaint.userEmail || "-"}
                                    </p>
                                    <p>
                                      <span className="font-extrabold">
                                        Title:
                                      </span>{" "}
                                      {complaint.title}
                                    </p>
                                    <p>
                                      <span className="font-extrabold">
                                        Type:
                                      </span>{" "}
                                      {formatType(complaint.type)}
                                    </p>
                                    <p>
                                      <span className="font-extrabold">
                                        Message:
                                      </span>{" "}
                                      {complaint.message}
                                    </p>
                                    <p>
                                      <span className="font-extrabold">
                                        Current Response:
                                      </span>{" "}
                                      {complaint.adminResponse || "No response yet"}
                                    </p>
                                  </div>
                                </div>

                                <div className="rounded-[24px] border border-blue-100 bg-white p-6">
                                  <h4 className="text-2xl font-extrabold text-[#0b2f67]">
                                    Update Complaint
                                  </h4>

                                  <div className="mt-5 space-y-5">
                                    <div>
                                      <label className="mb-2 block text-base font-bold text-[#5c79a8]">
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
                                        className={`w-full rounded-[20px] border border-blue-100 p-3 text-base outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff] ${
                                          isResolved
                                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                            : "bg-[#f7faff] text-[#0b1f45]"
                                        }`}
                                      >
                                        <option value="pending">Pending</option>
                                        <option value="in progress">In Progress</option>
                                        <option value="resolved">Resolved</option>
                                        <option value="rejected">Rejected</option>
                                      </select>
                                    </div>

                                    <div>
                                      <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                                        Admin Response
                                      </label>
                                      <textarea
                                        rows="5"
                                        placeholder="Enter admin response"
                                        value={
                                          replyData[complaint._id]
                                            ?.adminResponse ||
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
                                        className={`w-full rounded-[20px] border border-blue-100 p-3 text-base outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff] ${
                                          isResolved
                                            ? "cursor-not-allowed bg-slate-100 text-slate-400"
                                            : "bg-[#f7faff] text-[#0b1f45]"
                                        }`}
                                      />
                                    </div>

                                    <div className="flex flex-wrap gap-3">
                                      {isResolved ? (
                                        <span className="inline-flex rounded-[18px] bg-[#dff7ec] px-5 py-2.5 text-sm font-extrabold text-[#049b63]">
                                          Complaint Closed
                                        </span>
                                      ) : (
                                        <button
                                          onClick={() =>
                                            handleUpdate(complaint._id)
                                          }
                                          className="rounded-[18px] bg-[#143d7a] px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90"
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
        </section>
      </main>
    </div>
  );
}

export default ComplaintManagement;
