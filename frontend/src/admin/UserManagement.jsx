import React, { useEffect, useState } from "react";
import axios from "../axiosinstance";
import { Link, useNavigate } from "react-router-dom";

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
    <div className="min-h-screen flex bg-gray-100">
      <aside className="w-64 bg-blue-900 text-white flex flex-col p-6">
        <h2 className="text-2xl font-bold mb-10">Admin Panel</h2>

        <nav className="flex flex-col gap-4">
          <Link to="/admin/dashboard" className="hover:bg-blue-700 px-4 py-3 rounded-lg">
            Dashboard
          </Link>

          <Link to="/admin/users" className="bg-blue-700 px-4 py-3 rounded-lg">
            Manage Users
          </Link>

          <Link to="/admin/complaints" className="hover:bg-blue-700 px-4 py-3 rounded-lg">
            Manage Complaints
          </Link>
        </nav>

        <button
          onClick={handleLogout}
          className="mt-auto bg-red-500 py-3 rounded-lg"
        >
          Logout
        </button>
      </aside>

      <div className="flex-1 p-8">
        <h1 className="text-3xl font-bold mb-6">User Management</h1>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white p-4 rounded shadow text-center">
            <p>Total Users</p>
            <h2 className="text-2xl font-bold">{totalUsers}</h2>
          </div>

          <div className="bg-green-100 p-4 rounded text-center">
            <p>Active</p>
            <h2 className="text-2xl font-bold">{activeUsers}</h2>
          </div>

          <div className="bg-red-100 p-4 rounded text-center">
            <p>Inactive</p>
            <h2 className="text-2xl font-bold">{inactiveUsers}</h2>
          </div>
        </div>

        <div className="bg-white p-4 rounded shadow mb-6 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search name or email..."
            className="border p-2 rounded w-64"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          <select
            className="border p-2 rounded"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
          >
            <option value="">All Roles</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="instructor">Instructor</option>
            <option value="admin">Admin</option>
          </select>

          <select
            className="border p-2 rounded"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All Status</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div className="bg-white p-6 rounded shadow overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-100 text-center">
                <th className="p-3">Name</th>
                <th className="p-3">Email</th>
                <th className="p-3">Role</th>
                <th className="p-3">Phone</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>

            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user._id} className="border-t text-center">
                  <td className="p-3">{user.name}</td>
                  <td className="p-3">{user.email}</td>
                  <td className="p-3 capitalize">{user.role}</td>
                  <td className="p-3">{user.phoneNumber || "-"}</td>
                  <td className="p-3">
                    <span
                      className={`px-3 py-1 rounded-full text-sm ${
                        user.isActive
                          ? "bg-green-200 text-green-800"
                          : "bg-red-200 text-red-800"
                      }`}
                    >
                      {user.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(user)}
                        className={`text-white px-3 py-1 rounded ${
                          user.isActive
                            ? "bg-yellow-500 hover:bg-yellow-600"
                            : "bg-blue-500 hover:bg-blue-600"
                        }`}
                      >
                        {user.isActive ? "Deactivate" : "Activate"}
                      </button>

                      <button
                        onClick={() => handleDelete(user._id)}
                        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}

              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="text-center py-4">
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default UserManagement;