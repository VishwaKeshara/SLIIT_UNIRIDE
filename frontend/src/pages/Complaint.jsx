import React, { useState } from "react";
import axios from "../axiosinstance";
import bgImage from "../assets/bus.jpg";
import { useNavigate } from "react-router-dom";

function Complaint() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    type: "booking",
    message: "",
  });

  const [title, setTitle] = useState("");
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      setError("Please login first to submit a complaint.");
      return;
    }

    if (!title.trim() || !formData.message.trim()) {
      setError("Type and message are required.");
      return;
    }

    try {
      await axios.post("/complaints", {
        userId: user.id,
        userName: user.name,
        userEmail: user.email,
        title: title,
        type: formData.type,
        message: formData.message,
        status: "pending",
      });

      setSuccess("Complaint submitted successfully!");
      setError("");
      setTitle("");
      setFormData({
        type: "booking",
        message: "",
      });

      setTimeout(() => {
        navigate("/");
      }, 1200);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit complaint.");
      setSuccess("");
    }
  };

  return (
    <div className="min-h-screen bg-[#dfe3ea] flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-6xl min-h-[650px] rounded-[32px] overflow-hidden shadow-2xl bg-[#1d2233] grid grid-cols-1 lg:grid-cols-2">
        <div
          className="relative hidden lg:flex flex-col justify-between p-10 bg-cover bg-center"
          style={{ backgroundImage: `url(${bgImage})` }}
        >
          <div className="absolute inset-0 bg-[#0b1020]/70" />

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-white">
              Uni<span className="text-blue-400">Ride</span>
            </h2>
          </div>

          <div className="relative z-10 max-w-md">
            <p className="text-white/70 text-sm uppercase tracking-widest mb-4">
              SUPPORT CENTER
            </p>

            <h1 className="text-4xl font-extrabold leading-tight text-white">
              Submit your
              <br />
              complaint
              <br />
              <span className="text-blue-400">easily</span>
            </h1>

            <p className="text-white/70 mt-6 text-base leading-7">
              Facing an issue? Let us know and our admin team will resolve it quickly.
            </p>
          </div>

          <div className="relative z-10 text-white/50 text-sm">
            UniRide support system
          </div>
        </div>

        <div className="flex items-center justify-center bg-[#23283a] px-6 py-10">
          <div className="w-full max-w-md">
            <div className="mb-6">
              <h1 className="text-4xl font-extrabold text-white">
                New complaint<span className="text-blue-400">.</span>
              </h1>
              <p className="text-white/60 mt-2">Tell us what happened</p>
            </div>

            {error && (
              <div className="mb-4 text-red-400 bg-red-500/10 p-3 rounded">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 text-green-400 bg-green-500/10 p-3 rounded">
                {success}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-white/80 text-sm">Title</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter complaint title"
                  value={title}
                  onChange={(e) => {
                    setTitle(e.target.value);
                    setError("");
                    setSuccess("");
                  }}
                  className="w-full mt-1 p-3 rounded bg-[#2d3348] text-white border border-[#3b425c]"
                />
              </div>

              <div>
                <label className="text-white/80 text-sm">Category</label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 rounded bg-[#2d3348] text-white border border-[#3b425c]"
                >
                  <option value="booking">Booking Issue</option>
                  <option value="driver">Driver Issue</option>
                  <option value="schedule">Schedule Issue</option>
                  <option value="payment">Payment Issue</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="text-white/80 text-sm">Description</label>
                <textarea
                  name="message"
                  rows="4"
                  placeholder="Explain your issue..."
                  value={formData.message}
                  onChange={handleChange}
                  className="w-full mt-1 p-3 rounded bg-[#2d3348] text-white border border-[#3b425c]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-blue-500 hover:bg-blue-600 text-white py-3 rounded-xl font-semibold"
              >
                Submit Complaint
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Complaint;