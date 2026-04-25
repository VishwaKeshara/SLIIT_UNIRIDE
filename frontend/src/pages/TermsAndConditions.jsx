import React from "react";

function TermsAndConditions() {
  const sections = [
    {
      title: "Service Access",
      points: [
        "UniRide is intended for authorized students, staff, and approved users of the SLIIT transport system.",
        "Users are responsible for keeping their account information accurate and up to date.",
        "Access may be restricted or suspended if platform use violates university or service policies.",
      ],
    },
    {
      title: "Bookings and Travel",
      points: [
        "Ride bookings depend on available route capacity, schedule status, and system confirmation.",
        "Users should review travel dates, route details, and payment information before confirming a booking.",
        "Failure to board on time or repeated misuse of reservations may affect future booking privileges.",
      ],
    },
    {
      title: "Payments and Cancellations",
      points: [
        "Displayed fares, when applicable, are based on route pricing and the selected travel period.",
        "Cancellation and payment handling follow the rules configured in the UniRide service process.",
        "Users should keep payment references and booking confirmations for support and verification purposes.",
      ],
    },
    {
      title: "Conduct and Support",
      points: [
        "Users must interact respectfully with drivers, staff, and support teams when using the platform.",
        "Complaints and support requests should contain factual, accurate, and relevant information.",
        "UniRide may review misuse, abusive behavior, or false submissions and take appropriate action.",
      ],
    },
  ];

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[32px] border border-white/35 bg-white/14 p-8 shadow-[0_30px_90px_rgba(2,8,23,0.45)] backdrop-blur-2xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Terms & Conditions
              </p>
              <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
                Understand the rules that guide UniRide usage.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                These terms outline how users should access bookings, payments,
                support, and transport services through the UniRide platform.
              </p>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/72 p-6 backdrop-blur-xl">
              <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
                Policy Summary
              </p>
              <div className="mt-5 space-y-4">
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Applies to</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Platform accounts and ride bookings
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Includes</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Booking, conduct, payments, support
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/85 p-4">
                  <p className="text-sm text-slate-500">Review before</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">
                    Confirming rides and submitting requests
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <article className="rounded-[32px] border border-white/45 bg-white/76 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
              Important Notes
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Use the platform responsibly.
            </h2>
            <div className="mt-5 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                Review booking details carefully before confirming a ride.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                Keep confirmation references available for support or payment
                verification.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                Submit only accurate complaints, requests, and account
                information.
              </div>
            </div>
          </article>

          <div className="space-y-6">
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[32px] border border-white/45 bg-white/76 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl md:p-8"
              >
                <p className="text-sm uppercase tracking-[0.24em] text-cyan-600">
                  Policy Area
                </p>
                <h2 className="mt-3 text-2xl font-bold text-slate-900">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-3">
                  {section.points.map((point) => (
                    <div
                      key={point}
                      className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4 text-sm leading-6 text-slate-600"
                    >
                      {point}
                    </div>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default TermsAndConditions;
