import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaMapMarkedAlt,
  FaBus,
  FaBell,
  FaLock,
  FaArrowRight,
  FaExclamationCircle,
} from "react-icons/fa";
import heroBg from "../assets/home.jpg"; // change path if needed

function Home() {
  const navigate = useNavigate();
  const [loggedUser, setLoggedUser] = useState(null);

  useEffect(() => {
    const userData = localStorage.getItem("userData");
    if (userData) {
      try {
        setLoggedUser(JSON.parse(userData));
      } catch (error) {
        console.error("Failed to parse userData", error);
        setLoggedUser(null);
      }
    } else {
      setLoggedUser(null);
    }
  }, []);

  const stats = [
    { number: "2500+", label: "Active Students" },
    { number: "50+", label: "Daily Trips" },
    { number: "99%", label: "On-Time Rate" },
    { number: "24/7", label: "Support" },
  ];

  const features = [
    {
      icon: <FaMapMarkedAlt size={38} className="text-yellow-400" />,
      title: "Live Tracking",
      description: "Track shuttles in real-time with GPS accuracy and know exactly when your ride arrives.",
    },
    {
      icon: <FaBus size={38} className="text-yellow-400" />,
      title: "Easy Booking",
      description: "Reserve your seat quickly with a simple and smooth booking experience.",
    },
    {
      icon: <FaBell size={38} className="text-yellow-400" />,
      title: "Smart Alerts",
      description: "Get instant notifications about schedules, delays, and important trip updates.",
    },
    {
      icon: <FaLock size={38} className="text-yellow-400" />,
      title: "Secure Payment",
      description: "Enjoy secure and reliable payment options for a worry-free booking process.",
    },
  ];

  return (
    <>
      {/* Hero Section */}
      <section
        className="relative min-h-screen bg-cover bg-center bg-no-repeat"
        style={{ backgroundImage: `url(${heroBg})` }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-blue-950/75 to-slate-900/70"></div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-32 min-h-screen flex items-center">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center w-full">
            <div>
              {loggedUser ? (
                <p className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm sm:text-base font-medium text-blue-100 backdrop-blur-md">
                  Welcome back, {loggedUser.name || "User"} 👋
                </p>
              ) : (
                <p className="mb-5 inline-block rounded-full border border-white/20 bg-white/10 px-5 py-2 text-sm sm:text-base font-medium text-blue-100 backdrop-blur-md">
                  Welcome to UniRide
                </p>
              )}

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6 text-white">
                Smart Shuttle
                <br />
                <span className="bg-gradient-to-r from-yellow-300 via-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Booking System
                </span>
              </h1>

              <p className="text-lg sm:text-xl text-slate-200 mb-8 max-w-2xl leading-relaxed">
                Seamless campus transportation for SLIIT students. Book rides instantly,
                track your shuttle live, and enjoy a safe, reliable travel experience every day.
              </p>

              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/book")}
                  className="px-8 py-3.5 bg-yellow-500 text-slate-900 font-bold rounded-xl shadow-lg hover:bg-yellow-400 transition duration-300"
                >
                  Book Now
                </button>

                <button
                  onClick={() => navigate("/about")}
                  className="px-8 py-3.5 border border-white/40 bg-white/10 backdrop-blur-md text-white rounded-xl hover:bg-white/20 transition duration-300"
                >
                  Learn More
                </button>

                {loggedUser && (
                  <button
                    onClick={() => navigate("/complaint")}
                    className="px-8 py-3.5 bg-red-500 text-white font-semibold rounded-xl shadow-lg hover:bg-red-400 transition duration-300 inline-flex items-center gap-2"
                  >
                    <FaExclamationCircle />
                    Add Complaint
                  </button>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-5">
              {stats.map((stat, i) => (
                <div
                  key={i}
                  className="rounded-2xl border border-white/15 bg-white/10 backdrop-blur-xl p-6 text-center text-white shadow-2xl hover:scale-105 transition duration-300"
                >
                  <div className="text-3xl sm:text-4xl font-extrabold text-yellow-400">
                    {stat.number}
                  </div>
                  <div className="text-slate-200 mt-2 text-sm sm:text-base">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose UniRide */}
      <section className="py-16 lg:py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Choose UniRide?
          </h2>
          <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto">
            Experience smart, reliable, and secure campus mobility built for modern students.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-md border border-slate-100 hover:shadow-2xl hover:-translate-y-2 transition duration-300"
              >
                <div className="mb-5 flex justify-center">{f.icon}</div>
                <h3 className="text-xl font-semibold text-slate-900 mb-3">
                  {f.title}
                </h3>
                <p className="text-slate-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-slate-900 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 to-indigo-900/80"></div>

        <div className="relative max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">
            Ready to Ride with UniRide?
          </h2>
          <p className="text-slate-200 text-lg max-w-2xl mx-auto mb-8">
            Book your shuttle in seconds and enjoy a smarter way to travel around campus.
          </p>

          <div className="flex flex-wrap justify-center gap-4">
            <button
              onClick={() => navigate("/book")}
              className="bg-yellow-500 hover:bg-yellow-400 text-slate-900 px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3 shadow-lg transition duration-300"
            >
              Book Your First Ride <FaArrowRight />
            </button>

            {loggedUser && (
              <button
                onClick={() => navigate("/complaint")}
                className="bg-white text-blue-900 hover:bg-slate-100 px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3 shadow-lg transition duration-300"
              >
                Submit Complaint <FaExclamationCircle />
              </button>
            )}
          </div>
        </div>
      </section>
    </>
  );
}

export default Home;
