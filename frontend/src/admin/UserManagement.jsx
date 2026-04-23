import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "../axiosinstance";
import AdminSidebar from "./AdminSidebar";
import { FaSearch } from "react-icons/fa";

const initialForm = {
  name: "",
  email: "",
  role: "student",
  phoneNumber: "",
  password: "",
  isActive: true,
};

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [formData, setFormData] = useState(initialForm);
  const [editingUserId, setEditingUserId] = useState("");
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const resetForm = () => {
    setFormData(initialForm);
    setEditingUserId("");
    setFormError("");
    setFormSuccess("");
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

  const handleFormChange = (event) => {
    const { name, value, type, checked } = event.target;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    setFormError("");
    setFormSuccess("");
  };

  const handleEdit = (user) => {
    setEditingUserId(user._id);
    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "student",
      phoneNumber: user.phoneNumber || "",
      password: "",
      isActive: Boolean(user.isActive),
    });
    setFormError("");
    setFormSuccess("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.name || !formData.email || !formData.role) {
      setFormError("Name, email, and role are required.");
      return;
    }

    if (!editingUserId && !formData.password) {
      setFormError("Password is required when creating a user.");
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = {
        name: formData.name.trim(),
        email: formData.email.trim(),
        role: formData.role,
        phoneNumber: formData.phoneNumber.trim(),
        isActive: formData.isActive,
      };

      if (formData.password.trim()) {
        payload.password = formData.password;
      }

      if (editingUserId) {
        await axios.put(`/admin/users/${editingUserId}`, payload);
        setFormSuccess("User updated successfully.");
      } else {
        await axios.post("/admin/users", payload);
        setFormSuccess("User created successfully.");
      }

      await fetchUsers();
      setFormData((prev) => ({
        ...initialForm,
        role: prev.role,
      }));
      setEditingUserId("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to save user.");
    } finally {
      setIsSubmitting(false);
    }
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

  const statCards = [
    { label: "Total Users", value: totalUsers },
    { label: "Active Users", value: activeUsers },
    { label: "Inactive Users", value: inactiveUsers },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#eff4fb] via-[#f7fbff] to-[#eef3f9] lg:flex">
      <AdminSidebar />

      <main className="flex-1 p-6 lg:p-10">
        <div className="mb-10 flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div>
            <h1 className="text-4xl font-extrabold text-[#0b2f67] sm:text-6xl">
              User Management
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
              to="/admin/complaints"
              className="rounded-3xl bg-[#ffbf00] px-7 py-4 text-lg font-extrabold text-[#111827] shadow-sm transition hover:opacity-90"
            >
              Complaints
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
            <div>
              <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
                {editingUserId ? "Edit User" : "Add User"}
              </h3>
              <p className="mt-2 text-sm text-[#5c79a8]">
                Create new user accounts or update existing account details.
              </p>
            </div>

            {editingUserId && (
              <button
                type="button"
                onClick={resetForm}
                className="rounded-[18px] bg-[#e8eefb] px-5 py-3 text-sm font-extrabold text-[#0a3772] transition hover:opacity-90"
              >
                Cancel Edit
              </button>
            )}
          </div>

          {formError && (
            <div className="mb-5 rounded-[20px] border border-red-200 bg-red-50 px-5 py-4 text-sm font-bold text-red-700">
              {formError}
            </div>
          )}

          {formSuccess && (
            <div className="mb-5 rounded-[20px] border border-green-200 bg-green-50 px-5 py-4 text-sm font-bold text-green-700">
              {formSuccess}
            </div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 xl:grid-cols-2">
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleFormChange}
                placeholder="Enter full name"
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleFormChange}
                placeholder="Enter email address"
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Role
              </label>
              <select
                name="role"
                value={formData.role}
                onChange={handleFormChange}
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              >
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
                <option value="routemanager">Route Manager</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Phone Number
              </label>
              <input
                type="text"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleFormChange}
                placeholder="Enter phone number"
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              />
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                {editingUserId ? "New Password (Optional)" : "Password"}
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleFormChange}
                placeholder={
                  editingUserId ? "Leave blank to keep current password" : "Enter password"
                }
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
              />
            </div>

            <div className="flex items-center gap-3 pt-8">
              <input
                id="isActive"
                type="checkbox"
                name="isActive"
                checked={formData.isActive}
                onChange={handleFormChange}
                className="h-5 w-5 rounded border-blue-200 text-[#143d7a] focus:ring-[#3464d4]"
              />
              <label htmlFor="isActive" className="text-base font-bold text-[#0b1f45]">
                Active Account
              </label>
            </div>

            <div className="xl:col-span-2 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={isSubmitting}
                className="rounded-[18px] bg-[#143d7a] px-6 py-3 text-sm font-extrabold text-white transition hover:opacity-90 disabled:opacity-60"
              >
                {isSubmitting
                  ? "Saving..."
                  : editingUserId
                    ? "Update User"
                    : "Create User"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-[18px] bg-[#e8eefb] px-6 py-3 text-sm font-extrabold text-[#0a3772] transition hover:opacity-90"
              >
                Reset
              </button>
            </div>
          </form>
        </section>

        <section className="mb-8 rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
              Filter Users
            </h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
              Admin Control
            </span>
          </div>

          <div className="grid grid-cols-1 gap-5 xl:grid-cols-[1.4fr_0.8fr_0.8fr]">
            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Search
              </label>
              <div className="relative">
                <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5c79a8]" />
                <input
                  type="text"
                  placeholder="Search name or email"
                  className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] py-3 pl-11 pr-4 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Role
              </label>
              <select
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="student">Student</option>
                <option value="lecturer">Lecturer</option>
                <option value="driver">Driver</option>
                <option value="admin">Admin</option>
                <option value="routemanager">Route Manager</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-base font-bold text-[#5c79a8]">
                Status
              </label>
              <select
                className="w-full rounded-[20px] border border-blue-100 bg-[#f7faff] p-3 text-base text-[#0b1f45] outline-none transition focus:border-[#3464d4] focus:ring-2 focus:ring-[#dbe7ff]"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          </div>
        </section>

        <section className="rounded-[34px] border border-blue-100 bg-white p-7 shadow-[0_18px_45px_rgba(80,122,191,0.18)]">
          <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <h3 className="text-2xl font-extrabold text-[#0b2f67] sm:text-4xl">
              User Records
            </h3>
            <span className="rounded-full bg-[#e8eefb] px-5 py-2 text-lg font-bold text-[#3464d4]">
              {filteredUsers.length} Results
            </span>
          </div>

          <div className="overflow-x-auto rounded-[24px] border border-blue-100 bg-[#f7faff]">
            <table className="w-full min-w-[860px] text-left">
              <thead>
                <tr className="text-[#5c79a8]">
                  <th className="px-6 py-5 text-base font-extrabold">Name</th>
                  <th className="px-6 py-5 text-base font-extrabold">Email</th>
                  <th className="px-6 py-5 text-base font-extrabold">Role</th>
                  <th className="px-6 py-5 text-base font-extrabold">Phone</th>
                  <th className="px-6 py-5 text-base font-extrabold">Status</th>
                  <th className="px-6 py-5 text-base font-extrabold">Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredUsers.map((user) => (
                  <tr
                    key={user._id}
                    className="border-t border-blue-100 bg-white/60 text-[#0b1f45]"
                  >
                    <td className="px-6 py-5 text-base font-extrabold">
                      {user.name}
                    </td>
                    <td className="px-6 py-5 text-base">{user.email}</td>
                    <td className="px-6 py-5 text-base capitalize">
                      {user.role}
                    </td>
                    <td className="px-6 py-5 text-base">
                      {user.phoneNumber || "-"}
                    </td>
                    <td className="px-6 py-5">
                      <span
                        className={`inline-flex rounded-full px-4 py-2 text-sm font-extrabold ${
                          user.isActive
                            ? "bg-[#dff7ec] text-[#049b63]"
                            : "bg-[#ffe3e1] text-[#ef534f]"
                        }`}
                      >
                        {user.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => handleEdit(user)}
                          className="rounded-[18px] bg-[#143d7a] px-5 py-2.5 text-sm font-extrabold text-white transition hover:opacity-90"
                        >
                          Edit
                        </button>

                        <button
                          onClick={() => toggleStatus(user)}
                          className={`rounded-[18px] px-5 py-2.5 text-sm font-extrabold transition hover:opacity-90 ${
                            user.isActive
                              ? "bg-[#ffbf00] text-[#111827]"
                              : "bg-[#143d7a] text-white"
                          }`}
                        >
                          {user.isActive ? "Deactivate" : "Activate"}
                        </button>

                        <button
                          onClick={() => handleDelete(user._id)}
                          className="rounded-[18px] bg-[#ffe1df] px-5 py-2.5 text-sm font-extrabold text-[#ef534f] transition hover:opacity-90"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}

                {filteredUsers.length === 0 && (
                  <tr>
                    <td
                      colSpan="6"
                      className="px-6 py-12 text-center text-lg font-bold text-[#5c79a8]"
                    >
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}

export default UserManagement;
