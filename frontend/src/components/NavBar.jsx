import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "../axiosinstance";
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
  FaExclamationCircle,
  FaBell,
  FaUserCircle,
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
  const [hasAlert, setHasAlert] = useState(false);
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

    const checkAlerts = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem("userData") || localStorage.getItem("user"));
        
        const [tripsRes, complaintsRes, notificationsRes] = await Promise.all([
          axios.get("/trips"),
          axios.get("/complaints"),
          userData ? axios.get(`/notifications/user/${userData.id}`) : Promise.resolve({ data: [] }),
        ]);

        const hasDelay = tripsRes.data.some((t) => t.status === "Delayed");

        const complaintAlerts = userData
          ? complaintsRes.data.some(
              (c) =>
                (c.userEmail?.toLowerCase() === userData.email?.toLowerCase() ||
                  c.userId === userData.id) &&
                Boolean(c.adminResponse)
            )
          : false;

        const paymentAlerts = userData
          ? notificationsRes.data.some((n) => !n.isRead && n.type.startsWith("payment_"))
          : false;

        setHasAlert(hasDelay || complaintAlerts || paymentAlerts);
      } catch (err) {
        console.error("Failed to fetch alerts", err);
      }
    };
    checkAlerts();
    const interval = setInterval(checkAlerts, 60000); // Check every minute

    return () => {
      window.removeEventListener("storage", checkUser);
      window.removeEventListener("userChanged", checkUser);
      clearInterval(interval);
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
    { to: "/notifications", label: "Notifications", icon: <FaBell /> },
    { to: "/complaint", label: "Complaint", icon: <FaExclamationCircle /> },
  ];

  return (
    <nav className="fixed left-0 right-0 top-0 z-50 border-b border-orange-500/20 bg-gradient-to-r from-[#0A2233] via-[#123B57] to-[#16476A] text-white shadow-lg">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:h-20 lg:px-8">
        <div className="flex items-center gap-2.5 text-xl font-bold sm:text-2xl">
          <FaBus size={28} className="hidden text-orange-400 sm:block" />
          <Link
            to="/home"
            onClick={() => setMobileOpen(false)}
            className="whitespace-nowrap transition hover:text-orange-300"
          >
            SLIIT-UniRide
          </Link>
        </div>

        {/* Desktop menu */}
        <div className="hidden items-center gap-4 text-base font-medium xl:flex xl:gap-5 2xl:gap-6 2xl:text-[1.05rem]">
          {commonLinks.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              className="relative flex items-center gap-2 whitespace-nowrap transition hover:text-orange-300"
            >
              {item.icon} {item.label}
              {item.label === "Notifications" && hasAlert && (
                <span className="absolute -right-2 -top-1 flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex h-3 w-3 rounded-full bg-red-500"></span>
                </span>
              )}
            </Link>
          ))}

          {loggedUser &&
            userOnlyLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="flex items-center gap-2 whitespace-nowrap transition hover:text-orange-300"
              >
                {item.icon} {item.label}
              </Link>
            ))}

          {!loggedUser ? (
            <>
              <Link
                to="/login"
                className="flex items-center gap-2 whitespace-nowrap transition hover:text-orange-300"
              >
                <FaSignInAlt /> Sign In
              </Link>

              <Link
                to="/adminlogin"
                className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-orange-400/30 bg-orange-500/20 px-4 py-2 transition hover:bg-orange-500/35"
              >
                <FaUserShield className="text-orange-300" /> Admin
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/profile"
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-base font-semibold whitespace-nowrap transition hover:border-orange-300/40 hover:bg-white/15 hover:text-orange-200"
              >
                <FaUserCircle className="text-orange-300" />
                Hi, {loggedUser.name?.split(" ")[0] || "User"}
              </Link>

              <button
                onClick={handleLogout}
                className="flex items-center gap-2 whitespace-nowrap rounded-lg border border-orange-400/30 bg-orange-500/20 px-4 py-2 text-base transition hover:bg-orange-500/35"
              >
                <FaSignOutAlt className="text-orange-300" /> Logout
              </button>
            </>
          )}
        </div>

        {/* Mobile menu toggle */}
        <button
          type="button"
          className="text-2xl text-orange-300 xl:hidden"
          aria-label="Toggle menu"
          onClick={() => setMobileOpen((prev) => !prev)}
        >
          {mobileOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-orange-500/20 bg-gradient-to-b from-[#0A2233] to-[#16476A] px-4 pb-4 pt-3 xl:hidden">
          <div className="flex flex-col gap-2 text-base font-medium">
            {commonLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="relative flex w-fit items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-white/10 hover:text-orange-300"
              >
                {item.icon} {item.label}
                {item.label === "Notifications" && hasAlert && (
                  <span className="absolute right-0 top-2.5 flex h-2.5 w-2.5">
                    <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
                    <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-red-500"></span>
                  </span>
                )}
              </Link>
            ))}

            {loggedUser &&
              userOnlyLinks.map((item) => (
                <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-white/10 hover:text-orange-300"
              >
                {item.icon} {item.label}
              </Link>
            ))}

            {!loggedUser ? (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md px-3 py-2.5 transition hover:bg-white/10 hover:text-orange-300"
                >
                  <FaSignInAlt /> Sign In
                </Link>

                <Link
                  to="/adminlogin"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md border border-orange-400/30 bg-orange-500/20 px-3 py-2.5 transition hover:bg-orange-500/35"
                >
                  <FaUserShield className="text-orange-300" /> Admin
                </Link>
              </>
            ) : (
              <>
                <Link
                  to="/profile"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-md border border-white/10 bg-white/10 px-3 py-2.5 text-base font-semibold transition hover:border-orange-300/40 hover:bg-white/15 hover:text-orange-200"
                >
                  <FaUserCircle className="text-orange-300" />
                  Hi, {loggedUser.name?.split(" ")[0] || "User"}
                </Link>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-3 rounded-md border border-orange-400/30 bg-orange-500/20 px-3 py-2.5 text-left text-base transition hover:bg-orange-500/35"
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
