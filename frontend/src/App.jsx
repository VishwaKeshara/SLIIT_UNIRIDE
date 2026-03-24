import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
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
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

function AppLayout() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname.startsWith("/admin/") || location.pathname === "/adminlogin";

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "flex-grow" : "flex-grow pt-16 md:pt-20"}>
        <Routes>
          {/* User side routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/book" element={<BookRide />} />
          <Route path="/myrides" element={<MyRides />} />
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          {/* Admin login */}
          <Route path="/adminlogin" element={<AdminLogin />} />

          {/* Protected admin routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedAdminRoute>
                <AdminDashboard />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/users"
            element={
              <ProtectedAdminRoute>
                <UserManagement />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/complaints"
            element={
              <ProtectedAdminRoute>
                <ComplaintManagement />
              </ProtectedAdminRoute>
            }
          />

          {/* Default route */}
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