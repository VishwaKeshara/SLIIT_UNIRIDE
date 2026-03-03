import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaBus,
  FaCalendarAlt,
  FaTicketAlt,
  FaUser,
  FaUsers,
  FaSignInAlt,
  FaUserShield,
  FaInfoCircle,
  FaPhoneAlt,
  FaBars,
  FaTimes,
} from "react-icons/fa";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { to: "/schedules", label: "Schedules", icon: <FaCalendarAlt /> },
    { to: "/book", label: "Book Ride", icon: <FaTicketAlt /> },
    { to: "/myrides", label: "My Rides", icon: <FaUser /> },
    { to: "/drivers", label: "Drivers", icon: <FaUsers /> },
    { to: "/about", label: "About Us", icon: <FaInfoCircle /> },
    { to: "/contact", label: "Contact", icon: <FaPhoneAlt /> },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 bg-yellow-500 text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <div className="flex items-center gap-2.5 text-xl font-bold md:text-2xl">
          <FaBus size={28} className="hidden sm:block" />
          <Link to="/home" onClick={() => setMobileOpen(false)}>
            SLIIT-UniRide
          </Link>
        </div>

        <div className="hidden items-center gap-5 text-sm font-medium md:flex lg:gap-6 lg:text-base">
          {navLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 transition hover:text-yellow-100"
            >
              {item.icon} {item.label}
            </Link>
          ))}
          <Link to="/login" className="flex items-center gap-2 transition hover:text-yellow-100">
            <FaSignInAlt /> Sign In
          </Link>
          <Link
            to="/adminlogin"
            className="flex items-center gap-2 rounded-lg bg-white/20 px-4 py-2 transition hover:bg-white/30"
          >
            <FaUserShield /> Admin
          </Link>
        </div>

        <button
          type="button"
          className="text-2xl md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {mobileOpen && (
        <div className="border-t border-yellow-400/40 bg-yellow-500 px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm font-medium">
            {navLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-yellow-600"
              >
                {item.icon} {item.label}
              </Link>
            ))}
            <Link
              to="/login"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-yellow-600"
            >
              <FaSignInAlt /> Sign In
            </Link>
            <Link
              to="/adminlogin"
              onClick={() => setMobileOpen(false)}
              className="flex items-center gap-2 rounded-md bg-white/20 px-2 py-2 transition hover:bg-white/30"
            >
              <FaUserShield /> Admin
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
