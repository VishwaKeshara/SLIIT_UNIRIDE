import React, { useEffect, useState } from "react";
import axios from "../axiosinstance";
import { Link, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaUserCog,
  FaClipboardList,
  FaSignOutAlt,
  FaSearch,
  FaUsers,
  FaUserCheck,
  FaUserTimes,
} from "react-icons/fa";

function UserManagement() {
  const navigate = useNavigate();

  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);

  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/admin/users");
      setUsers(res.data);
      setFilteredUsers(res.data);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    let data = users;

    if (search) {
      data = data.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (roleFilter) {
      data = data.filter((u) => u.role === roleFilter);
    }

    if (statusFilter) {
      data = data.filter((u) =>
        statusFilter === "active" ? u.isActive : !u.isActive
      );
    }

    setFilteredUsers(data);
  }, [search, roleFilter, statusFilter, users]);

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    localStorage.removeItem("adminData");
    navigate("/adminlogin");
  };

  const toggleStatus = async (user) => {
    try {
      await axios.put(`/admin/users/${user._id}`, {
        isActive: !user.isActive,
      });
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;

    try {
      await axios.delete(`/admin/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.log(err);
    }
  };

  const totalUsers = users.length;
  const activeUsers = users.filter((u) => u.isActive).length;
  const inactiveUsers = users.filter((u) => !u.isActive).length;

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
            className="flex items-center gap-3 bg-blue-600 px-5 py-3 rounded-xl font-semibold text-lg"
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
        <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-10 gap-4">
          <div>
            <p className="text-blue-600 font-semibold text-lg mb-2">
              User Overview
            </p>
            <h1 className="text-5xl font-bold text-slate-800">
              User Management
            </h1>
            <p className="text-slate-500 mt-2 text-lg">
              Manage registered users and control account access.
            </p>
          </div>

          <div className="bg-white/90 backdrop-blur-sm px-6 py-4 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 text-base">
            <p className="text-slate-500">Total Users</p>
            <p className="text-4xl font-bold text-blue-600 mt-1">{totalUsers}</p>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg">Total Users</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{totalUsers}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-blue-100 flex items-center justify-center">
                <FaUsers className="text-blue-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg">Active</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{activeUsers}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                <FaUserCheck className="text-green-600 text-2xl" />
              </div>
            </div>
          </div>

          <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-500 text-lg">Inactive</p>
                <h2 className="text-5xl font-bold text-slate-800 mt-2">{inactiveUsers}</h2>
              </div>
              <div className="w-14 h-14 rounded-2xl bg-red-100 flex items-center justify-center">
                <FaUserTimes className="text-red-600 text-2xl" />
              </div>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 mb-8">
          <div className="flex flex-col lg:flex-row gap-5 lg:items-end">
            <div className="flex-1">
              <label className="block text-base font-medium text-slate-700 mb-2">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search name or email..."
                  className="w-full border border-blue-100 bg-white py-3 pl-11 pr-4 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="w-full lg:w-60">
              <label className="block text-base font-medium text-slate-700 mb-2">
                Role
              </label>
              <select
                className="w-full border border-blue-100 bg-white p-3 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="instructor">Instructor</option>
                <option value="admin">Admin</option>
                <option value="routemanager">Route Manager</option>
                <option value="driver">Driver</option>
              </select>
            </div>

            <div className="w-full lg:w-60">
              <label className="block text-base font-medium text-slate-700 mb-2">
                Status
              </label>
              <select
                className="w-full border border-blue-100 bg-white p-3 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-blue-400"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="bg-white/90 backdrop-blur-sm p-6 rounded-3xl shadow-[0_10px_30px_rgba(59,130,246,0.08)] border border-blue-100 overflow-x-auto">
          <table className="w-full text-base">
            <thead>
              <tr className="bg-[#edf4ff] text-center text-slate-700">
                <th className="p-4 rounded-l-2xl">Name</th>
                <th className="p-4">Email</th>
                <th className="p-4">Role</th>
                <th className="p-4">Phone</th>
                <th className="p-4">Status</th>
                <th className="p-4 rounded-r-2xl">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr
                  key={user._id}
                  className="border-t border-blue-50 text-center hover:bg-[#f8fbff] transition"
                >
                  <td className="p-4 font-semibold text-slate-800">{user.name}</td>
                  <td className="p-4 text-slate-600">{user.email}</td>
                  <td className="p-4 capitalize text-slate-700">{user.role}</td>
                  <td className="p-4 text-slate-600">{user.phoneNumber || "-"}</td>
                  <td className="p-4">
                    <span
                      className={`px-4 py-2 rounded-full text-sm font-semibold ${
                        user.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-4">
                    <div className="flex justify-center gap-3 flex-wrap">
                      <button
                        onClick={() => toggleStatus(user)}
                        className={`text-white px-4 py-2 rounded-xl text-sm font-medium transition ${
                          user.isActive
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-medium transition"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-10 text-slate-500 text-lg">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}

export default UserManagement;
