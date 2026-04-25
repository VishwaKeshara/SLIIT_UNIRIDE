import React from "react";
import {
  FaClock,
  FaEnvelope,
  FaMapMarkerAlt,
  FaPhoneAlt,
} from "react-icons/fa";

function Contact() {
  const contactCards = [
    {
      icon: <FaEnvelope className="text-2xl text-cyan-300" />,
      title: "Email Support",
      text: "support@uniride.sliit.lk",
      detail: "Best for booking issues, route questions, and service requests.",
    },
    {
      icon: <FaPhoneAlt className="text-2xl text-cyan-300" />,
      title: "Phone Line",
      text: "+94 11 754 4800",
      detail: "Call during office hours for urgent support and ride coordination.",
    },
    {
      icon: <FaMapMarkerAlt className="text-2xl text-cyan-300" />,
      title: "Campus Desk",
      text: "SLIIT Malabe Campus, Colombo",
      detail: "Visit the transport support desk for in-person assistance.",
    },
  ];

  return (
    <section className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(56,189,248,0.16),_transparent_28%),linear-gradient(135deg,#06121f_0%,#0d2237_45%,#123b57_100%)] pb-16 text-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="overflow-hidden rounded-[32px] border border-white/35 bg-white/14 p-8 shadow-[0_30px_90px_rgba(2,8,23,0.45)] backdrop-blur-2xl md:p-12">
          <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-cyan-300">
                Contact UniRide
              </p>
              <h1 className="mt-4 text-4xl font-extrabold sm:text-5xl">
                Get in touch with the support team.
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                Need help with booking, shuttle schedules, complaints, or route
                updates? Reach out through any of the channels below and our
                team will guide you quickly.
              </p>

              <div className="mt-8 grid gap-4 sm:grid-cols-3">
                <div className="rounded-[24px] border border-white/45 bg-white/72 p-5 backdrop-blur-xl">
                  <p className="text-sm text-slate-400">Response target</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">
                    Under 24h
                  </p>
                </div>
                <div className="rounded-[24px] border border-white/45 bg-white/72 p-5 backdrop-blur-xl">
                  <p className="text-sm text-slate-400">Support channels</p>
                  <p className="mt-2 text-2xl font-bold text-slate-900">3</p>
                </div>
                <div className="rounded-[24px] border border-white/45 bg-white/72 p-5 backdrop-blur-xl">
                  <p className="text-sm text-slate-400">Service desk</p>
                  <p className="mt-2 text-2xl font-bold text-emerald-600">
                    Active
                  </p>
                </div>
              </div>
            </div>

            <div className="rounded-[28px] border border-white/40 bg-white/72 p-6 backdrop-blur-xl">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl border border-cyan-300/40 bg-cyan-50 p-3">
                  <FaClock className="text-xl text-cyan-700" />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-slate-400">
                    Office Hours
                  </p>
                  <h2 className="mt-1 text-2xl font-bold text-slate-900">
                    Support availability
                  </h2>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                  <p className="text-sm text-slate-400">Monday - Friday</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    7:00 AM - 7:00 PM
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                  <p className="text-sm text-slate-400">Saturday</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    8:00 AM - 2:00 PM
                  </p>
                </div>
                <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                  <p className="text-sm text-slate-400">Sunday</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    Closed
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {contactCards.map((card) => (
            <article
              key={card.title}
              className="rounded-[28px] border border-white/45 bg-white/74 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl"
            >
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-cyan-300/40 bg-cyan-50">
                {card.icon}
              </div>
              <h2 className="mt-5 text-xl font-bold text-slate-900">{card.title}</h2>
              <p className="mt-2 text-base font-semibold text-cyan-700">
                {card.text}
              </p>
              <p className="mt-3 text-sm leading-6 text-slate-600">
                {card.detail}
              </p>
            </article>
          ))}
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <article className="rounded-[32px] border border-white/45 bg-white/76 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl md:p-8">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
              Send a Message
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Let us know how we can help.
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-7 text-slate-600">
              Share your booking concern, route issue, or service request and
              our team will follow up with the right support.
            </p>

            <form className="mt-6 grid gap-4 sm:grid-cols-2">
              <input
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                type="text"
                placeholder="Your name"
              />
              <input
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20"
                type="email"
                placeholder="Email address"
              />
              <input
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 sm:col-span-2"
                type="text"
                placeholder="Subject"
              />
              <textarea
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-cyan-400/50 focus:ring-2 focus:ring-cyan-400/20 sm:col-span-2"
                rows="5"
                placeholder="Write your message..."
              />
              <button
                type="button"
                className="rounded-2xl bg-cyan-400 px-6 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300 sm:w-fit"
              >
                Send Message
              </button>
            </form>
          </article>

          <article className="rounded-[32px] border border-white/45 bg-white/76 p-6 shadow-[0_24px_70px_rgba(2,8,23,0.26)] backdrop-blur-xl">
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300">
              Quick Help
            </p>
            <h2 className="mt-3 text-2xl font-bold text-slate-900">
              Best way to reach us
            </h2>

            <div className="mt-6 space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                For urgent shuttle issues, call the support line during office
                hours.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                For booking records and follow-up, email support with your route
                and travel date.
              </div>
              <div className="rounded-2xl border border-slate-200 bg-white/80 px-4 py-4">
                For transport desk help, visit the campus support point during
                the day.
              </div>
            </div>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Contact;
