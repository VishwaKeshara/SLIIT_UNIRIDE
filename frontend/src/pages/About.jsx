import React from "react";
import {
  FaBullseye,
  FaClock,
  FaMapMarkedAlt,
  FaShieldAlt,
} from "react-icons/fa";

function About() {
  const values = [
    {
      icon: <FaBullseye className="text-2xl text-cyan-700" />,
      title: "Student First",
      text: "Routes and timing decisions are shaped around lectures, practical sessions, and daily student travel patterns.",
    },
    {
      icon: <FaClock className="text-2xl text-cyan-700" />,
      title: "Reliable Service",
      text: "Consistent departures and clear schedule visibility help users plan every ride with more confidence.",
    },
    {
      icon: <FaShieldAlt className="text-2xl text-cyan-700" />,
      title: "Safe Commute",
      text: "Verified drivers, monitored trips, and organized ride records support a safer campus transport experience.",
    },
    {
      icon: <FaMapMarkedAlt className="text-2xl text-cyan-700" />,
      title: "Smart Tracking",
      text: "The platform connects schedules, routes, and service updates in one place for better visibility.",
    },
  ];

  const highlights = [
    "Live shuttle schedule visibility",
    "Seat booking for upcoming rides",
    "Driver and route information access",
    "Notifications and service updates",
  ];

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[32px] border border-white/35 bg-white/14 p-8 shadow-[0_30px_90px_rgba(2,8,23,0.45)] backdrop-blur-2xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                About UniRide
              </p>
              <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
                Campus transport made simpler and more reliable.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                SLIIT-UniRide is built to reduce travel stress for students and
                staff by connecting schedules, bookings, driver details, and
                route visibility in one system.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/72 p-6 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
                Platform Snapshot
              </p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Focus</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Daily campus mobility
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Coverage</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Routes, bookings, support
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Priority</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Safety and punctuality
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Audience</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Students and staff
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          <article className="rounded-[32px] border border-white/45 bg-white/76 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
              Our Mission
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Create a dependable university travel experience.
            </h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">
              UniRide helps the SLIIT community move between campus and key
              travel points with better schedule visibility, organized booking
              access, and more transparent service information. The goal is to
              make everyday transport more predictable, safer, and easier to
              manage.
            </p>
          </article>

          <article className="rounded-[32px] border border-white/45 bg-white/76 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
              What We Provide
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Core features for smoother daily travel.
            </h2>
            <ul className="mt-4 space-y-3 text-sm text-slate-600">
              {highlights.map((item) => (
                <li
                  key={item}
                  className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-3"
                >
                  {item}
                </li>
              ))}
            </ul>
          </article>
        </div>

        <div className="mt-8">
          <div className="rounded-[32px] border border-white/35 bg-white/14 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.35)] backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
              Why UniRide
            </p>
            <h2 className="mt-3 text-3xl font-bold text-white">
              Why students trust the platform
            </h2>
            <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {values.map((value) => (
                <article
                  key={value.title}
                  className="rounded-[28px] border border-white/45 bg-white/76 p-5 shadow-[0_18px_50px_rgba(2,8,23,0.22)] backdrop-blur-xl"
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/35 bg-cyan-50">
                    {value.icon}
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-slate-900">
                    {value.title}
                  </h3>
                  <p className="mt-2 text-sm leading-6 text-slate-600">
                    {value.text}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
