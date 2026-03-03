import React from "react";
import { FaBullseye, FaShieldAlt, FaClock, FaMapMarkedAlt } from "react-icons/fa";

function About() {
  const values = [
    {
      icon: <FaBullseye className="text-2xl text-yellow-500" />,
      title: "Student First",
      text: "Routes and timings are designed around lecture schedules and student needs.",
    },
    {
      icon: <FaClock className="text-2xl text-yellow-500" />,
      title: "Reliable Service",
      text: "Consistent departures with live ETA updates help you plan each day.",
    },
    {
      icon: <FaShieldAlt className="text-2xl text-yellow-500" />,
      title: "Safe Commute",
      text: "Verified drivers, monitored routes, and secure booking records.",
    },
    {
      icon: <FaMapMarkedAlt className="text-2xl text-yellow-500" />,
      title: "Smart Tracking",
      text: "Real-time shuttle visibility from departure point to arrival.",
    },
  ];

  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-3xl bg-gradient-to-r from-blue-900 to-indigo-900 p-8 text-white shadow-xl md:p-12">
          <p className="mb-3 text-sm uppercase tracking-[0.2em] text-blue-200">About Us</p>
          <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">SLIIT-UniRide</h1>
          <p className="mt-4 max-w-3xl text-blue-100">
            UniRide is the campus shuttle platform built to make daily travel simple, safe, and predictable for students and staff.
          </p>
        </div>

        <div className="mt-10 grid gap-6 lg:grid-cols-2">
          <article className="rounded-2xl bg-white p-6 shadow-md md:p-8">
            <h2 className="text-2xl font-bold text-slate-900">Our Mission</h2>
            <p className="mt-4 text-slate-600">
              We reduce travel stress by giving the university community an easy way to check schedules, reserve seats, and track buses live.
              Our focus is punctuality, safety, and smooth campus mobility.
            </p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-md md:p-8">
            <h2 className="text-2xl font-bold text-slate-900">What We Provide</h2>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>Live shuttle tracking and route visibility</li>
              <li>Fast seat booking for upcoming rides</li>
              <li>Trip reminders and service notifications</li>
              <li>Driver and support contact details</li>
            </ul>
          </article>
        </div>

        <div className="mt-10">
          <h2 className="text-2xl font-bold text-slate-900 sm:text-3xl">Why Students Trust UniRide</h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <article key={value.title} className="rounded-2xl bg-white p-5 shadow-md">
                <div>{value.icon}</div>
                <h3 className="mt-3 text-lg font-semibold text-slate-900">{value.title}</h3>
                <p className="mt-2 text-sm text-slate-600">{value.text}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
