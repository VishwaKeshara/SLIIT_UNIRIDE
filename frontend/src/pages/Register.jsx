import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
import bgImage from "../assets/bus.jpg";
import {
  FaEye,
  FaEyeSlash,
  FaEnvelope,
  FaLock,
  FaUser,
  FaBus,
  FaArrowLeft,
} from "react-icons/fa";

function Register() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    role: "student",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
    setError("");
    setSuccess("");

    if (
      !formData.name ||
      !formData.email ||
      !formData.role ||
      !formData.password ||
      !formData.confirmPassword
    ) {
      setError("Please fill in all fields.");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await axios.post("/users/register", {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        password: formData.password,
      });

      setSuccess("Account created successfully. Redirecting to login...");
      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
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

      <div className="relative z-10 min-h-[calc(100vh-180px)] flex items-center justify-center px-4 py-5 md:py-6">
        <div className="w-full max-w-5xl grid lg:grid-cols-2 rounded-[22px] overflow-hidden border border-white/10 shadow-2xl backdrop-blur-xl bg-white/5">
          
          <div className="hidden lg:flex flex-col justify-between p-7 xl:p-8 bg-gradient-to-br from-slate-950/70 via-slate-900/50 to-blue-950/30 border-r border-white/10">
            <div>
              <span className="inline-flex items-center rounded-full border border-blue-400/30 bg-blue-400/10 px-4 py-1.5 text-sm font-medium text-blue-300">
                Join UniRide Today
              </span>
            </div>

            <div className="max-w-xl">
              <h2 className="text-3xl font-bold text-white mb-4">
                Uni<span className="text-blue-400">Ride</span>
              </h2>

              <h1 className="text-4xl xl:text-[44px] font-extrabold leading-tight text-white mb-4">
                Start your
                <br />
                smarter travel
                <br />
                <span className="text-blue-400">journey</span>
              </h1>

              <p className="text-sm xl:text-base text-slate-300 leading-7 mb-5">
                Create your account to book rides, manage your trips, access
                schedules, and enjoy a safer and more convenient campus
                transport experience.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <h3 className="text-base font-bold text-white mb-1">Fast</h3>
                  <p className="text-xs text-slate-300">
                    Simple and quick account setup
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <h3 className="text-base font-bold text-white mb-1">Easy</h3>
                  <p className="text-xs text-slate-300">
                    Book and manage rides with ease
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <h3 className="text-base font-bold text-white mb-1">Smart</h3>
                  <p className="text-xs text-slate-300">
                    Built for campus transport needs
                  </p>
                </div>

                <div className="rounded-2xl border border-white/10 bg-white/5 p-3.5">
                  <h3 className="text-base font-bold text-white mb-1">Secure</h3>
                  <p className="text-xs text-slate-300">
                    Protected access for every user
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-5">
              <Link
                to="/home"
                className="inline-flex items-center gap-2 rounded-xl border border-white/20 px-4 py-2.5 text-white hover:bg-white/10 transition"
              >
                <FaArrowLeft />
                Back Home
              </Link>

              <Link
                to="/login"
                className="rounded-xl bg-blue-500 px-4 py-2.5 font-semibold text-white hover:bg-blue-600 transition"
              >
                Login Now
              </Link>
            </div>
          </div>

          <div className="flex items-center justify-center bg-slate-950/40 px-5 py-6 sm:px-7 md:px-8">
            <div className="w-full max-w-md">
              <div className="rounded-[22px] border border-white/10 bg-white/10 backdrop-blur-2xl p-6 sm:p-7 shadow-[0_20px_80px_rgba(0,0,0,0.45)]">
                <div className="mb-5 text-center lg:text-left">
                  <div className="mx-auto lg:mx-0 mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-500/15 border border-blue-400/30">
                    <FaBus className="text-lg text-blue-400" />
                  </div>

                  <h1 className="text-3xl sm:text-[34px] font-bold text-white mb-1">
                    Create account
                  </h1>
                  <p className="text-slate-300 text-sm">
                    Register to use your UniRide account
                  </p>
                </div>

                {error && (
                  <div className="mb-4 rounded-xl border border-red-400/20 bg-red-500/15 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="mb-4 rounded-xl border border-green-400/20 bg-green-500/15 px-4 py-3 text-sm text-green-200">
                    {success}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-3.5">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">
                      Full Name
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaUser />
                      </span>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        placeholder="Enter your full name"
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-12 pr-4 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">
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
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-12 pr-4 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">
                      Role
                    </label>
                    <select
                      name="role"
                      value={formData.role}
                      onChange={handleChange}
                      className="w-full rounded-xl border border-white/10 bg-white/10 py-3 px-4 text-white outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
                    >
                      <option className="text-black" value="student">
                        Student
                      </option>
                      <option className="text-black" value="lecturer">
                        Lecturer
                      </option>
                      <option className="text-black" value="driver">
                        Driver
                      </option>
                    </select>
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">
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
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-12 pr-12 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
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

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-200">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                        <FaLock />
                      </span>
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="Confirm password"
                        className="w-full rounded-xl border border-white/10 bg-white/10 py-3 pl-12 pr-12 text-white placeholder:text-slate-400 outline-none transition focus:border-blue-400/60 focus:ring-2 focus:ring-blue-400/30"
                      />
                      <button
                        type="button"
                        onClick={() =>
                          setShowConfirmPassword(!showConfirmPassword)
                        }
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-white"
                      >
                        {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full rounded-xl bg-blue-600 py-3 text-base font-bold text-white shadow-lg transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-70"
                  >
                    {loading ? "Creating Account..." : "Create Account"}
                  </button>
                </form>

                <div className="mt-4 text-center">
                  <p className="text-sm text-slate-300">
                    Already have an account?{" "}
                    <Link
                      to="/login"
                      className="font-semibold text-blue-400 hover:text-blue-300"
                    >
                      Login
                    </Link>
                  </p>
                </div>

                <div className="mt-5 flex flex-col gap-3 lg:hidden">
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
                    Login Now
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

export default Register;