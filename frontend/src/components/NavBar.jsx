import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaBus,
  FaCalendarAlt,
  FaTicketAlt,
  FaUsers,
  FaSignInAlt,
  FaSignOutAlt,
  FaUserShield,
  FaInfoCircle,
  FaPhoneAlt,
  FaBars,
  FaTimes,
  FaTachometerAlt,
  FaExclamationCircle,
} from "react-icons/fa";

function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedUser, setLoggedUser] = useState(() => {
    try {
      const data = localStorage.getItem("userData");
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  });
  const navigate = useNavigate();

  // Check user login status
  useEffect(() => {
    const checkUser = () => {
      const userData = localStorage.getItem("userData");
      if (userData) {
        try {
          setLoggedUser(JSON.parse(userData));
        } catch (error) {
          console.error("Failed to parse userData", error);
          setLoggedUser(null);
        }
      } else {
        setLoggedUser(null);
      }
    };

    checkUser();
    window.addEventListener("storage", checkUser);
    window.addEventListener("userChanged", checkUser);

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userChanged", checkUser);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userData");
    setLoggedUser(null);
    setMobileOpen(false);
    window.dispatchEvent(new Event("userChanged"));
    navigate("/login");
  };

  // Links visible to all users
  const commonLinks = [
    { to: "/schedules", label: "Schedules", icon: <FaCalendarAlt /> },
    { to: "/book", label: "Book Ride", icon: <FaTicketAlt /> },
    { to: "/terms-and-conditions", label: "Terms & Conditions", icon: <FaInfoCircle /> },
    { to: "/drivers", label: "Drivers", icon: <FaUsers /> },
    { to: "/about", label: "About Us", icon: <FaInfoCircle /> },
    { to: "/contact", label: "Contact", icon: <FaPhoneAlt /> },
  ];

  // Links visible only to logged-in users
  const userOnlyLinks = [
    { to: "/complaint", label: "Complaint", icon: <FaExclamationCircle /> },
    { to: "/driver-portal", label: "Driver Portal", icon: <FaTachometerAlt /> },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-orange-500/20 bg-gradient-to-r from-[#0A2233] via-[#123B57] to-[#16476A] text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 md:h-20 lg:px-8">
        <div className="flex items-center gap-2.5 text-xl font-bold md:text-2xl">
          <FaBus size={28} className="hidden text-orange-400 sm:block" />
          <Link
            to="/home"
            onClick={() => setMobileOpen(false)}
            className="transition hover:text-orange-300"
          >
            SLIIT-UniRide
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden items-center gap-5 text-sm font-medium md:flex lg:gap-6 lg:text-base">
          {commonLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="flex items-center gap-2 transition hover:text-orange-300"
            >
              {item.icon} {item.label}
            </Link>
          ))}

          {loggedUser &&
            userOnlyLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 transition hover:text-orange-300"
              >
                {item.icon} {item.label}
              </Link>
            ))}

          {!loggedUser ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 transition hover:text-orange-300"
              >
                <FaSignInAlt /> Sign In
              </Link>

              <Link
                to="/adminlogin"
                className="flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-500/20 px-4 py-2 transition hover:bg-orange-500/35"
              >
                <FaUserShield className="text-orange-300" /> Admin
              </Link>
            </>
          ) : (
            <>
              <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold">
                Hi, {loggedUser.name?.split(" ")[0] || "User"}
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 rounded-lg border border-orange-400/30 bg-orange-500/20 px-4 py-2 transition hover:bg-orange-500/35"
              >
                <FaSignOutAlt className="text-orange-300" /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="text-2xl text-orange-300 md:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-orange-500/20 bg-gradient-to-b from-[#0A2233] to-[#16476A] px-4 pb-4 pt-3 md:hidden">
          <div className="flex flex-col gap-2 text-sm font-medium">
            {commonLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-white/10 hover:text-orange-300"
              >
                {item.icon} {item.label}
              </Link>
            ))}

            {loggedUser &&
              userOnlyLinks.map((item) => (
                <Link
                  key={item.to}
                  to={item.to}
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-white/10 hover:text-orange-300"
                >
                  {item.icon} {item.label}
                </Link>
              ))}

            {!loggedUser ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md px-2 py-2 transition hover:bg-white/10 hover:text-orange-300"
                >
                  <FaSignInAlt /> Sign In
                </Link>

                <Link
                  to="/adminlogin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-2 rounded-md border border-orange-400/30 bg-orange-500/20 px-2 py-2 transition hover:bg-orange-500/35"
                >
                  <FaUserShield className="text-orange-300" /> Admin
                </Link>
              </>
            ) : (
              <>
                <div className="rounded-md border border-white/10 bg-white/10 px-2 py-2 font-semibold">
                  Hi, {loggedUser.name?.split(" ")[0] || "User"}
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-md border border-orange-400/30 bg-orange-500/20 px-2 py-2 text-left transition hover:bg-orange-500/35"
                >
                  <FaSignOutAlt className="text-orange-300" /> Logout
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

export default Navbar;
