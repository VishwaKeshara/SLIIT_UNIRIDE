import React from "react";
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate } from "react-router-dom";
// Removed unused context providers and toast imports

import Login from "./pages/Login";
import Home from "./pages/Home";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import Adminlogin from "./admin/Adminlogin";
import Schedules from "./pages/Schedules";
import BookRide from "./pages/BookRide";
import MyRides from "./pages/MyRides";
import Drivers from "./pages/Drivers";
import About from "./pages/About";
import Contact from "./pages/Contact";

// ...existing code...

function App() {
  return (
    <Router>
      <Navbar />
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
        <Route path="/adminlogin" element={<Adminlogin />} />
        <Route path="*" element={<Home />} />
      </Routes>
      <Footer />
    </Router>
  );
}

export default App;