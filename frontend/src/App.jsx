// App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Schedules from "./pages/Schedules";
import BookRide from "./pages/BookRide";
import MyRides from "./pages/MyRides";
import About from "./pages/About";
import Contact from "./pages/Contact";

// Driver Management
import Drivers from "./pages/Drivers";
import AddDriver from "./pages/AddDriver";
import EditDriver from "./pages/EditDriver";

// Trip Management
import Trips from "./pages/Trips";
import AddTrip from "./pages/AddTrip";
import EditTrip from "./pages/EditTrip";
import TripDetails from "./pages/TripDetails";

// Driver Portal
import DriverDashboard from "./pages/DriverDashboard";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-gray-50">
        <Navbar />

        <main className="flex-grow pt-16 md:pt-20">
          <Routes>
            {/* Public pages */}
            <Route path="/"            element={<Home />} />
            <Route path="/home"        element={<Home />} />
            <Route path="/schedules"   element={<Schedules />} />
            <Route path="/book"        element={<BookRide />} />
            <Route path="/myrides"     element={<MyRides />} />
            <Route path="/about"       element={<About />} />
            <Route path="/contact"     element={<Contact />} />
            <Route path="/login"       element={<Login />} />

            {/* Driver Management */}
            <Route path="/drivers"          element={<Drivers />} />
            <Route path="/drivers/add"      element={<AddDriver />} />
            <Route path="/drivers/edit/:id" element={<EditDriver />} />

            {/* Trip Management */}
            <Route path="/trips"            element={<Trips />} />
            <Route path="/trips/add"        element={<AddTrip />} />
            <Route path="/trips/edit/:id"   element={<EditTrip />} />
            <Route path="/trips/:id"        element={<TripDetails />} />

            {/* Driver Portal */}
            <Route path="/driver-portal"    element={<DriverDashboard />} />

            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;