import React from "react";

function MyRides() {
  const sections = [
    {
      title: "Acceptance of Terms",
      content:
        "By accessing or using SLIIT-UniRide, you agree to follow these terms and all applicable university transport policies.",
    },
    {
      title: "User Responsibility",
      content:
        "Users must provide accurate account information, keep login details secure, and use the platform only for valid shuttle-related activities.",
    },
    {
      title: "Bookings and Cancellations",
      content:
        "Ride bookings are subject to seat availability. Users should review trip details carefully and cancel bookings in advance whenever plans change.",
    },
    {
      title: "Code of Conduct",
      content:
        "Passengers are expected to behave respectfully, follow driver instructions, and avoid any actions that may disrupt shuttle operations or affect safety.",
    },
    {
      title: "Service Availability",
      content:
        "Schedules, routes, and platform features may change due to operational, maintenance, or emergency reasons. UniRide will aim to communicate important updates promptly.",
    },
    {
      title: "Privacy and Data Use",
      content:
        "Personal information provided through the platform may be used for authentication, booking management, notifications, and service improvement in line with system requirements.",
    },
    {
      title: "Limitation of Liability",
      content:
        "While we work to provide a reliable transport service, UniRide is not responsible for delays, interruptions, or losses caused by traffic conditions, emergencies, or events beyond reasonable control.",
    },
  ];

  return (
    <section className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-orange-50 px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-5xl">
        <div className="mb-8 rounded-3xl bg-gradient-to-r from-[#0A2233] via-[#123B57] to-[#16476A] px-6 py-10 text-white shadow-xl sm:px-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-orange-300">
            SLIIT-UniRide
          </p>
          <h1 className="mb-4 text-3xl font-bold sm:text-4xl">
            Terms and Conditions
          </h1>
          <p className="max-w-3xl text-sm leading-7 text-slate-200 sm:text-base">
            Please read these terms carefully before using the UniRide platform.
            They explain the responsibilities, expectations, and service
            conditions related to campus shuttle bookings and transport access.
          </p>
        </div>

        <div className="grid gap-5">
          {sections.map((section) => (
            <article
              key={section.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
            >
              <h2 className="mb-3 text-xl font-semibold text-slate-900">
                {section.title}
              </h2>
              <p className="leading-7 text-slate-600">{section.content}</p>
            </article>
          ))}
        </div>

        <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-6 text-sm leading-7 text-slate-700">
          Continued use of the platform indicates your agreement with these
          terms. If you do not agree, please discontinue use of the booking
          system and contact the UniRide support team for clarification.
        </div>
      </div>
    </section>
  );
}

export default MyRides;
