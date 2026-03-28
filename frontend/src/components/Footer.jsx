import React from "react";
import {
  FaFacebook,
  FaTwitter,
  FaInstagram,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
} from "react-icons/fa";
import { Link } from "react-router-dom";

function Footer() {
  const quickLinks = [
    { name: "Home", path: "/home" },
    { name: "Book Ride", path: "/book" },
    { name: "Drivers", path: "/drivers" },
    { name: "Schedules", path: "/schedules" },
    { name: "About", path: "/about" },
  ];

  return (
    <footer className="mt-16 border-t border-orange-500/20 bg-gradient-to-r from-[#0A2233] via-[#123B57] to-[#16476A] text-white shadow-inner">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-10 px-6 py-14 text-center md:grid-cols-3 md:gap-12 md:text-left">
        <div className="space-y-4">
          <h3 className="text-2xl font-bold tracking-wide text-white">
            SLIIT-UniRide
          </h3>
          <p className="mx-auto max-w-sm text-sm leading-relaxed text-white/80 md:mx-0">
            Reliable campus shuttle service for SLIIT students - book, track,
            and ride with confidence.
          </p>
          <div className="flex items-center justify-center gap-3 text-sm text-white/80 md:justify-start">
            <FaMapMarkerAlt className="text-orange-300" />
            <span>Malabe Campus, Colombo</span>
          </div>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold tracking-wide text-white">
            Quick Links
          </h3>
          <ul className="space-y-3 text-sm">
            {quickLinks.map((link) => (
              <li key={link.path}>
                <Link
                  to={link.path}
                  className="group relative inline-block text-white/80 transition duration-300 hover:text-orange-300"
                >
                  {link.name}
                  <span className="absolute -bottom-1 left-0 h-[2px] w-0 bg-orange-300 transition-all duration-300 group-hover:w-full" />
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-6 text-lg font-semibold tracking-wide text-white">
            Contact and Support
          </h3>
          <div className="space-y-3 text-sm text-white/80">
            <p className="flex items-center justify-center gap-2 md:justify-start">
              <FaEnvelope className="text-orange-300" />
              support@uniride.sliit.lk
            </p>
            <p className="flex items-center justify-center gap-2 md:justify-start">
              <FaPhone className="text-orange-300" />
              +94 11 754 4800
            </p>
          </div>

          <div className="mt-6 flex justify-center gap-4 md:justify-start">
            {[FaFacebook, FaTwitter, FaInstagram].map((Icon, index) => (
              <a
                key={index}
                href="#"
                className="rounded-full border border-orange-400/30 bg-orange-500/20 p-2 transition duration-300 hover:scale-110 hover:bg-orange-500/35 hover:text-orange-200"
                aria-label="Social link"
              >
                <Icon size={18} />
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="border-t border-orange-500/20">
        <div className="mx-auto max-w-7xl px-6 py-5 text-center text-sm text-white/75">
          &copy; {new Date().getFullYear()} SLIIT-UniRide - Shuttle Management
          System. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

export default Footer;