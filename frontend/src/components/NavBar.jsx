// NavBar.jsx
import React from "react";
import { Link } from "react-router-dom";
// Removed useAuth import, context does not exist
import { 
  FaBus, 
  FaCalendarAlt,
  FaTicketAlt,
  FaUser,
  FaUsers,
  FaSignInAlt, 
  FaSignOutAlt, 
  FaInfoCircle,
  FaPhoneAlt,
  FaUserShield
} from "react-icons/fa";

function Navbar() {
  // No authentication context, so no user/logout

  const menuVariants = {
    hidden: { y: -50, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { staggerChildren: 0.1 } },
  };

  const itemVariants = {
    hidden: { y: -20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <nav
      className="flex justify-between items-center p-4 bg-blue-700 text-white shadow-lg sticky top-0 z-50"
      
      
      
    >
     
      <div className="flex items-center font-bold text-2xl gap-3">
        <FaBus size={28} />
        <Link to="/home">SLIIT-UniRide</Link>
      </div>

   
      <div
        className="flex gap-6 items-center"
        
        initial="hidden"
        animate="visible"
      >

        <div className="flex items-center gap-3">
          <FaCalendarAlt />
          <Link to="/schedules">Schedules</Link>
        </div>

        <div className="flex items-center gap-3">
          <FaTicketAlt />
          <Link to="/book">Book Ride</Link>
        </div>

        <div className="flex items-center gap-3">
          <FaUser />
          <Link to="/myrides">My Rides</Link>
        </div>

        <div className="flex items-center gap-3">
          <FaUsers />
          <Link to="/drivers">Drivers</Link>
        </div>

        <div className="flex items-center gap-3">
          <FaInfoCircle />
          <Link to="/about">About Us</Link>
        </div>

        <div className="flex items-center gap-3">
          <FaPhoneAlt />
          <Link to="/contact">Contact</Link>
        </div>

       
        {/* No authentication context, always show Sign In and Admin Login */}
        <div className="flex items-center gap-2">
          <FaSignInAlt />
          <Link to="/login">Sign In</Link>
        </div>
        <div className="flex items-center gap-2">
          <FaUserShield />
          <Link to="/adminlogin">Admin Login</Link>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;