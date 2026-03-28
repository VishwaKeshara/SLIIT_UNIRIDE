import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import bgImage from "../assets/bus.jpg";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaArrowLeft,
  FaUserShield,
} from "react-icons/fa";

function AdminLogin() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please enter both email and password.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post("/admin/login", formData);

      localStorage.setItem("adminToken", res.data.token);
      localStorage.setItem("adminData", JSON.stringify(res.data.admin));

      navigate("/admin/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Admin login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen w-full relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/80"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-900/70 to-yellow-900/20"></div>

      {/* Top left brand */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/home"
          className="inline-flex items-center gap-3 text-white/90 hover:text-white transition"
        >
          <div className="h-11 w-11 rounded-xl bg-yellow-500/15 border border-yellow-400/30 flex items-center justify-center backdrop-blur-md">
            <FaUserShield className="text-yellow-400 text-lg" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-wide">
              SLIIT-<span className="text-yellow-400">UniRide</span>
            </h2>
            <p className="text-xs text-white/60 tracking-[0.22em] uppercase">
              Admin Portal
            </p>
          </div>
        </Link>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-[28px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          
          {/* LEFT SIDE */}
          <div className="hidden lg:flex flex-col justify-between p-10 xl:p-12 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-blue-950/30 border-r border-white/10">
            <div>
              <span className="inline-flex items-center rounded-full border border-yellow-400/30 bg-yellow-400/10 px-4 py-1.5 text-sm font-medium text-yellow-300">
                Secure Admin Access
              </span>
            </div>

            <div className="max-w-lg">
              <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-white mb-5">
                Admin
                <br />
                <span className="text-yellow-400">Control Panel</span>
              </h1>

              <p className="text-base xl:text-lg text-slate-300 leading-8">
                Sign in to manage users, complaints, and UniRide system
                operations securely.
              </p>
            </div>

            <div className="flex items-center gap-4 pt-8">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-white hover:bg-white/10 transition"
              >
                <FaArrowLeft />
                Back Home
              </Link>

              <Link
                to="/login"
                className="rounded-xl bg-yellow-500 px-5 py-3 font-semibold text-slate-900 hover:bg-yellow-400 transition"
              >
                User Login
              </Link>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="flex items-center justify-center bg-slate-950/40 px-5 py-8 sm:px-8 md:px-10">
            <div className="w-full max-w-md">
              <div className="rounded-[28px] border border-white/10 bg-white/10 backdrop-blur-2xl p-8 sm:p-9 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                <div className="mb-7 text-center lg:text-left">
                  <div className="mx-auto lg:mx-0 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-yellow-500/15 border border-yellow-400/30">
                    <FaUserShield className="text-xl text-yellow-400" />
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    Admin Login
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base">
                    Sign in to continue to the UniRide admin dashboard
                  </p>
                </div>

                {error && (
                  <div className="mb-5 rounded-xl border border-red-400/20 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Email Address
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaEnvelope />
                      </span>
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="Enter admin email"
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-400 outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-200">
                      Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaLock />
                      </span>
                      <input
                        type={showPassword ? "text" : "password"}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="Enter password"
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-12 text-white placeholder:text-slate-400 outline-none transition focus:border-yellow-400/60 focus:ring-2 focus:ring-yellow-400/30"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      >
                        {showPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-yellow-500 py-3.5 text-base font-bold text-slate-900 shadow-lg transition hover:bg-yellow-400 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Logging in..." : "Login to Dashboard"}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-sm text-slate-300">
                    Not an admin?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-yellow-400 hover:text-yellow-300"
                    >
                      Go to User Login
                    </Link>
                  </p>
                </div>

                <div className="mt-6 flex flex-col gap-3 lg:hidden">
                  <Link
                    to="/home"
                    className="w-full rounded-xl border border-white/15 py-3 text-center text-white hover:bg-white/10 transition"
                  >
                    Back Home
                  </Link>
                  <Link
                    to="/login"
                    className="w-full rounded-xl bg-white/10 py-3 text-center text-white hover:bg-white/15 transition"
                  >
                    User Login
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;