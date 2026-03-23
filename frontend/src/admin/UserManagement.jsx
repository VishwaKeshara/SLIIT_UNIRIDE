import React, { useEffect, useState } from "react";
import axios from "../axiosinstance";

function UserManagement() {
  const [users, setUsers] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    role: "",
    phone: "",
    status: "active",
  });
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const res = await axios.get("/users");
      setUsers(res.data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  };

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.role) {
      setError("Full Name, Email Address, and Role are required.");
      return false;
    }

    if (!editingId && !formData.password) {
      setError("Password is required for new users.");
      return false;
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(formData.email)) {
      setError("Enter a valid email address.");
      return false;
    }

    setError("");
    return true;
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      role: "",
      phone: "",
      status: "active",
    });
    setEditingId(null);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`/users/${editingId}`, {
          name: formData.name,
          email: formData.email,
          role: formData.role,
          phone: formData.phone,
          status: formData.status,
        });
      } else {
        await axios.post("/users", formData);
      }

      resetForm();
      fetchUsers();
    } catch (err) {
      console.error("Failed to save user", err);
      setError(err.response?.data?.message || "Failed to save user.");
    }
  };

  const handleEdit = (user) => {
    setFormData({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone || "",
      status: user.status || "active",
    });
    setEditingId(user._id);
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error("Failed to delete user", err);
    }
  };

  const fillDummyData = () => {
    setFormData({
      name: "Lecturer Demo",
      email: "lecturerdemo@gmail.com",
      password: "123456",
      role: "lecturer",
      phone: "0770000000",
      status: "active",
    });
    setError("");
  };

  return (
    <div className="max-w-6xl mx-auto px-6 py-10">
      <h1 className="text-3xl font-bold mb-8 text-center">User Management</h1>

      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8 border">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-medium mb-1">Full Name</label>
            <input
              type="text"
              name="name"
              placeholder="Enter full name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              placeholder="Enter email address"
              value={formData.email}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          {!editingId && (
            <div>
              <label className="block font-medium mb-1">Password</label>
              <input
                type="password"
                name="password"
                placeholder="Enter password"
                value={formData.password}
                onChange={handleChange}
                className="w-full border p-2 rounded"
              />
            </div>
          )}

          <div>
            <label className="block font-medium mb-1">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="">Select Role</option>
              <option value="student">Student</option>
              <option value="lecturer">Lecturer</option>
              <option value="driver">Driver</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <div>
            <label className="block font-medium mb-1">Phone Number</label>
            <input
              type="text"
              name="phone"
              placeholder="Enter phone number"
              value={formData.phone}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full border p-2 rounded"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
        </div>

        {error && <p className="text-red-600 mt-3">{error}</p>}

        <div className="mt-4 flex flex-wrap gap-3">
          <button type="submit" className="bg-blue-700 text-white px-5 py-2 rounded hover:bg-blue-800">
            {editingId ? "Update User" : "Add User"}
          </button>

          <button
            type="button"
            onClick={fillDummyData}
            className="bg-gray-300 text-black px-5 py-2 rounded hover:bg-gray-400"
          >
            Fill Dummy Data
          </button>

          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="bg-red-500 text-white px-5 py-2 rounded hover:bg-red-600"
            >
              Cancel Edit
            </button>
          )}
        </div>
      </form>

      <div className="bg-white shadow-md rounded-lg p-6 border overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-100">
              <th className="border p-3">Full Name</th>
              <th className="border p-3">Email Address</th>
              <th className="border p-3">Role</th>
              <th className="border p-3">Phone Number</th>
              <th className="border p-3">Status</th>
              <th className="border p-3">Actions</th>
            </tr>
          </thead>

          <tbody>
            {users.map((user) => (
              <tr key={user._id}>
                <td className="border p-3">{user.name}</td>
                <td className="border p-3">{user.email}</td>
                <td className="border p-3">{user.role}</td>
                <td className="border p-3">{user.phone}</td>
                <td className="border p-3">{user.status}</td>
                <td className="border p-3">
                  <button
                    onClick={() => handleEdit(user)}
                    className="bg-yellow-500 text-white px-3 py-1 rounded hover:bg-yellow-600"
                  >
                    Edit
                  </button>

                  <button
                    onClick={() => handleDelete(user._id)}
                    className="bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600 ml-2"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}

            {users.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center p-4">
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default UserManagement;