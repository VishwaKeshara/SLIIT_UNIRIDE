import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Schedules from "./pages/Schedules";
import BookRide from "./pages/BookRide";
import MyRides from "./pages/MyRides";
import Drivers from "./pages/Drivers";
import About from "./pages/About";
import Contact from "./pages/Contact";

import AdminLogin from "./admin/Adminlogin";
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import ComplaintManagement from "./admin/ComplaintManagement";

function AppLayout() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin/") || location.pathname === "/adminlogin";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "flex-grow" : "flex-grow pt-16 md:pt-20"}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/book" element={<BookRide />} />
          <Route path="/myrides" element={<MyRides />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />

          <Route path="/adminlogin" element={<AdminLogin />} />
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UserManagement />} />
          <Route path="/admin/complaints" element={<ComplaintManagement />} />

          <Route path="*" element={<Home />} />
        </Routes>
      </main>

      {!isAdminRoute && <Footer />}
    </div>
  );
}

function App() {
  return (
    <Router>
      <AppLayout />
    </Router>
  );
}

export default App;