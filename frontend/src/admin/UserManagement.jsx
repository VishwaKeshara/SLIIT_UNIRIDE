import React, { useEffect, useState } from "react";
import axios from "../axiosinstance";

export default function UserManagement() {
  const [users, setUsers] = useState([]);
  const [form, setForm] = useState({
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
      console.error(err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const validateForm = () => {
    if (!form.name || !form.email || !form.role) {
      setError("Name, Email, and Role are required.");
      return false;
    }

    if (!editingId && !form.password) {
      setError("Password is required for new users.");
      return false;
    }

    const emailPattern = /\S+@\S+\.\S+/;
    if (!emailPattern.test(form.email)) {
      setError("Enter a valid email address.");
      return false;
    }

    setError("");
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      if (editingId) {
        await axios.put(`/users/${editingId}`, {
          name: form.name,
          email: form.email,
          role: form.role,
          phone: form.phone,
          status: form.status,
        });
      } else {
        await axios.post("/users", form);
      }

      setForm({
        name: "",
        email: "",
        password: "",
        role: "",
        phone: "",
        status: "active",
      });
      setEditingId(null);
      fetchUsers();
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Something went wrong.");
    }
  };

  const handleEdit = (user) => {
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      phone: user.phone,
      status: user.status,
    });
    setEditingId(user._id);
    setError("");
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`/users/${id}`);
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const fillDummyData = () => {
    setForm({
      name: "Lecturer Demo",
      email: "lecturerdemo@gmail.com",
      password: "123456",
      role: "lecturer",
      phone: "0770000000",
      status: "active",
    });
  };

  return (
    <div style={{ padding: "30px" }}>
      <h2>User Management</h2>

      <form onSubmit={handleSubmit} style={{ marginBottom: "20px" }}>
        <div style={rowStyle}>
          <input type="text" name="name" placeholder="Full Name" value={form.name} onChange={handleChange} />
          <input type="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} />
        </div>

        <div style={rowStyle}>
          {!editingId && (
            <input
              type="password"
              name="password"
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
            />
          )}

          <select name="role" value={form.role} onChange={handleChange}>
            <option value="">Select Role</option>
            <option value="student">Student</option>
            <option value="lecturer">Lecturer</option>
            <option value="driver">Driver</option>
            <option value="admin">Admin</option>
          </select>
        </div>

        <div style={rowStyle}>
          <input type="text" name="phone" placeholder="Phone Number" value={form.phone} onChange={handleChange} />

          <select name="status" value={form.status} onChange={handleChange}>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}

        <button type="submit" style={buttonStyle}>
          {editingId ? "Update User" : "Add User"}
        </button>

        <button type="button" onClick={fillDummyData} style={{ ...buttonStyle, marginLeft: "10px" }}>
          Fill Dummy Data
        </button>
      </form>

      <table border="1" cellPadding="10" style={{ width: "100%", borderCollapse: "collapse" }}>
        <thead>
          <tr>
            <th>Full Name</th>
            <th>Email Address</th>
            <th>Role</th>
            <th>Phone Number</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td>{u.name}</td>
              <td>{u.email}</td>
              <td>{u.role}</td>
              <td>{u.phone}</td>
              <td>{u.status}</td>
              <td>
                <button onClick={() => handleEdit(u)}>Edit</button>
                <button onClick={() => handleDelete(u._id)} style={{ marginLeft: "8px" }}>
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const rowStyle = {
  display: "flex",
  gap: "10px",
  marginBottom: "10px",
};

const buttonStyle = {
  padding: "10px 16px",
  border: "none",
  borderRadius: "6px",
  backgroundColor: "#0b2c74",
  color: "white",
  cursor: "pointer",
};