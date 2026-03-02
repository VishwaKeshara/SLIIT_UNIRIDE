import React from "react";
import { FaBus, FaMapMarkedAlt, FaClock, FaUsers, FaRoute, FaTicketAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Home() {
  const navigate = useNavigate();

  const features = [
    {
      icon: <FaRoute size={40} className="text-blue-500" />,
      title: "Route Management",
      description: "View and manage shuttle routes easily.",
    },
    {
      icon: <FaClock size={40} className="text-blue-500" />,
      title: "Schedule Tracking",
      description: "Check shuttle arrival and departure times.",
    },
    {
      icon: <FaTicketAlt size={40} className="text-blue-500" />,
      title: "Booking System",
      description: "Book your university shuttle seats online.",
    },
    {
      icon: <FaUsers size={40} className="text-blue-500" />,
      title: "Passenger Support",
      description: "Contact support for any travel issues.",
    },
  ];

  return (
    <div className="min-h-screen bg-blue-50">

      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blue-100 to-blue-300 py-24">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between">

          <div className="md:w-1/2 mb-12 md:mb-0">
            <h1 className="text-5xl font-bold text-blue-900 mb-6">
              Welcome to SLIIT-UniRide 🚍
            </h1>

            <p className="text-lg text-blue-800 mb-8">
              Smart shuttle management system for SLIIT students and staff.
            </p>

            <button
              onClick={() => navigate("/booking")}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl shadow-lg transition"
            >
              Book Your Ride
            </button>
          </div>

          <div className="md:w-1/2">
            <div className="bg-white rounded-3xl shadow-2xl p-6">
              <FaBus size={200} className="mx-auto text-blue-500" />
            </div>
          </div>

        </div>
      </section>

      {/* Features Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-12">
            System Features
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((item, index) => (
              <div
                key={index}
                className="bg-white p-8 rounded-3xl shadow-lg text-center hover:shadow-2xl transition duration-300 border border-blue-100"
              >
                <div className="flex justify-center mb-4">{item.icon}</div>
                <h3 className="text-xl font-semibold text-blue-900 mb-2">
                  {item.title}
                </h3>
                <p className="text-blue-700">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-200 relative overflow-hidden">
        <div className="max-w-3xl mx-auto text-center px-6">
          <h2 className="text-4xl font-bold text-blue-900 mb-6">
            Travel Smart with UniRide
          </h2>

          <p className="text-blue-800 mb-8">
            Manage shuttle bookings, check schedules, and track university transport easily.
          </p>

          <button
            onClick={() => navigate("/routes")}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-xl shadow-lg transition"
          >
            Explore Routes
          </button>
        </div>

        <div className="absolute top-10 left-10 text-blue-300 text-5xl">
          🚍
        </div>
        <div className="absolute bottom-10 right-10 text-blue-300 text-6xl">
          🚍
        </div>
      </section>

    </div>
  );
}

export default Home;