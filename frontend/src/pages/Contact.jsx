import React from "react";
import { FaEnvelope, FaPhoneAlt, FaMapMarkerAlt, FaClock } from "react-icons/fa";

function Contact() {
  return (
    <section className="bg-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8 lg:py-14">
        <div className="rounded-3xl bg-white p-8 shadow-md md:p-10">
          <p className="text-sm uppercase tracking-[0.2em] text-blue-700">Contact</p>
          <h1 className="mt-2 text-3xl font-extrabold text-slate-900 sm:text-4xl">Get In Touch</h1>
          <p className="mt-3 max-w-3xl text-slate-600">
            Need help with booking, shuttle schedules, or route updates? Reach out and our support team will respond as quickly as possible.
          </p>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-md">
            <FaEnvelope className="text-2xl text-yellow-500" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Email</h2>
            <p className="mt-2 text-slate-600">support@uniride.sliit.lk</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-md">
            <FaPhoneAlt className="text-2xl text-yellow-500" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Phone</h2>
            <p className="mt-2 text-slate-600">+94 11 754 4800</p>
          </article>
          <article className="rounded-2xl bg-white p-6 shadow-md">
            <FaMapMarkerAlt className="text-2xl text-yellow-500" />
            <h2 className="mt-3 text-lg font-semibold text-slate-900">Location</h2>
            <p className="mt-2 text-slate-600">SLIIT Malabe Campus, Colombo</p>
          </article>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <article className="rounded-2xl bg-white p-6 shadow-md lg:col-span-2">
            <h2 className="text-xl font-bold text-slate-900">Send a Message</h2>
            <form className="mt-5 grid gap-4 sm:grid-cols-2">
              <input className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" type="text" placeholder="Your name" />
              <input className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500" type="email" placeholder="Email address" />
              <input className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2" type="text" placeholder="Subject" />
              <textarea className="rounded-xl border border-slate-300 px-4 py-3 outline-none focus:border-blue-500 sm:col-span-2" rows="5" placeholder="Write your message..." />
              <button type="button" className="rounded-xl bg-blue-900 px-6 py-3 font-semibold text-white transition hover:bg-blue-800 sm:w-fit">
                Send Message
              </button>
            </form>
          </article>

          <article className="rounded-2xl bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <FaClock className="text-xl text-yellow-500" />
              <h2 className="text-xl font-bold text-slate-900">Office Hours</h2>
            </div>
            <ul className="mt-4 space-y-2 text-slate-600">
              <li>Monday - Friday: 7:00 AM - 7:00 PM</li>
              <li>Saturday: 8:00 AM - 2:00 PM</li>
              <li>Sunday: Closed</li>
            </ul>
          </article>
        </div>
      </div>
    </section>
  );
}

export default Contact;
