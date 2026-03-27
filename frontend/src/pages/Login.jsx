import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import bgImage from "../assets/bus.jpg";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaBus,
  FaArrowLeft,
} from "react-icons/fa";

function Login() {
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

      const res = await axios.post("/users/login", formData);

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("userData", JSON.stringify(res.data.user));

      navigate("/home");
    } catch (err) {
      setError(err.response?.data?.message || "Login failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="w-full relative overflow-hidden bg-slate-950"
      style={{
        backgroundImage: `url(${bgImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-slate-950/75"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-blue-950/50 via-slate-900/60 to-cyan-900/20"></div>

      <div className="relative z-10 min-h-[calc(100vh-140px)] flex items-center justify-center px-4 py-6 md:py-8">
        <div className="w-full max-w-6xl grid lg:grid-cols-2 rounded-[24px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          
          <div className="hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-blue-950/30 border-r border-white/10">
            <div>
              <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-sm font-medium text-blue-300">
                Smart Campus Transport
              </span>
            </div>

            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-5">
                Uni<span className="text-blue-400">Ride</span>
              </h2>

              <h1 className="text-4xl xl:text-5xl font-extrabold leading-tight text-white mb-5">
                Ride smarter,
                <br />
                travel safer with
                <br />
                <span className="text-blue-400">UniRide</span>
              </h1>

              <p className="text-base xl:text-lg text-slate-300 leading-7 mb-6">
                Access your account to book rides, manage your journeys, view
                schedules, and enjoy a safer and smoother campus transport
                experience.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">Book</h3>
                  <p className="text-sm text-slate-300">
                    Reserve your shuttle seat easily
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">Track</h3>
                  <p className="text-sm text-slate-300">
                    View rides and schedule details
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">Manage</h3>
                  <p className="text-sm text-slate-300">
                    Check and manage your bookings
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <h3 className="text-lg font-bold text-white mb-1">Secure</h3>
                  <p className="text-sm text-slate-300">
                    Safe login for UniRide users
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pt-6">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-5 py-3 text-white hover:bg-white/10 transition"
              >
                <FaArrowLeft />
                Back Home
              </Link>

              <Link
                to="/register"
                className="rounded-xl bg-blue-500 px-5 py-3 font-semibold text-white hover:bg-blue-600 transition"
              >
                Create Account
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-950/40 px-5 py-8 sm:px-8 md:px-10">
            <div className="w-full max-w-md">
              <div className="rounded-[24px] border border-white/10 bg-white/10 backdrop-blur-2xl p-7 sm:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                <div className="mb-6 text-center lg:text-left">
                  <div className="mx-auto lg:mx-0 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-400/30">
                    <FaBus className="text-xl text-blue-400" />
                  </div>

                  <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
                    Welcome back
                  </h1>
                  <p className="text-slate-300 text-sm sm:text-base">
                    Sign in to your UniRide account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/15 px-4 py-3 text-sm text-red-200">
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
                        placeholder="Enter your email"
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-4 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
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
                        placeholder="Enter your password"
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3.5 pl-12 pr-12 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
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

                  <div className="flex items-center justify-end">
                    <Link
                      to="/forgot-password"
                      className="text-sm text-blue-400 hover:text-blue-300"
                    >
                      Forgot Password?
                    </Link>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 py-3.5 text-base font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Logging in..." : "Login"}
                  </button>
                </form>

                <div className="mt-5 text-center">
                  <p className="text-sm text-slate-300">
                    Don&apos;t have an account?{" "}
                    <Link
                      to="/register"
                      className="font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Join now
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
                    to="/register"
                    className="w-full rounded-xl bg-white/10 py-3 text-center text-white hover:bg-white/15 transition"
                  >
                    Create Account
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

export default Login;