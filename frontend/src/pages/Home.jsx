import React from "react";
import { useNavigate } from "react-router-dom";
import { FaMapMarkedAlt, FaBus, FaBell, FaLock, FaArrowRight } from "react-icons/fa";

function Home() {
  const navigate = useNavigate();

  const stats = [
    { number: "2500+", label: "Active Students" },
    { number: "50+",   label: "Daily Trips" },
    { number: "99%",   label: "On-Time Rate" },
    { number: "24/7",  label: "Support" },
  ];

  const features = [
    { icon: <FaMapMarkedAlt size={40} className="text-yellow-500" />, title: "Live Tracking",    description: "Track shuttles in real-time with GPS accuracy." },
    { icon: <FaBus size={40} className="text-yellow-500"           />, title: "Easy Booking",     description: "Reserve your seat instantly in seconds." },
    { icon: <FaBell size={40} className="text-yellow-500"          />, title: "Smart Alerts",     description: "Instant notifications for updates & delays." },
    { icon: <FaLock size={40} className="text-yellow-500"          />, title: "Secure Payment",   description: "Multiple safe payment options available." },
  ];

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 text-white">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                Smart Shuttle
                <br />
                <span className="bg-gradient-to-r from-yellow-400 to-orange-400 bg-clip-text text-transparent">
                  Booking System
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-blue-100 mb-8 max-w-xl">
                Seamless campus transportation for SLIIT students. Book instantly, track live, and travel safely every day.
              </p>
              <div className="flex flex-wrap gap-4">
                <button
                  onClick={() => navigate("/book")}
                  className="px-8 py-3.5 bg-white text-blue-900 font-semibold rounded-xl shadow-lg hover:bg-gray-100 transition"
                >
                  Book Now
                </button>
                <button
                  onClick={() => navigate("/about")}
                  className="px-8 py-3.5 border-2 border-white rounded-xl hover:bg-white/10 transition"
                >
                  Learn More
                </button>
              </div>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl shadow-2xl order-first lg:order-last">
              <div className="grid grid-cols-2 gap-6 text-center">
                {stats.map((stat, i) => (
                  <div key={i}>
                    <div className="text-4xl sm:text-5xl font-bold text-yellow-400">{stat.number}</div>
                    <div className="text-blue-100 mt-1">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-5 sm:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
            Why Choose UniRide?
          </h2>
          <p className="text-lg text-slate-600 mb-12 max-w-3xl mx-auto">
            Experience smart, reliable and secure campus mobility.
          </p>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {features.map((f, i) => (
              <div
                key={i}
                className="bg-white p-6 lg:p-8 rounded-2xl shadow-md hover:shadow-xl hover:-translate-y-1 transition duration-300"
              >
                <div className="mb-5 flex justify-center">{f.icon}</div>
                <h3 className="text-xl font-semibold mb-3">{f.title}</h3>
                <p className="text-slate-600">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-16 lg:py-20 bg-gradient-to-r from-blue-900 to-indigo-900 text-white text-center">
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <h2 className="text-3xl sm:text-4xl font-bold mb-6">Ready to Ride?</h2>
          <button
            onClick={() => navigate("/book")}
            className="bg-yellow-500 hover:bg-yellow-600 px-10 py-4 rounded-xl font-bold text-lg inline-flex items-center gap-3 shadow-lg transition"
          >
            Book Your First Ride <FaArrowRight />
          </button>
        </div>
      </section>
    </>
  );
}

export default Home;