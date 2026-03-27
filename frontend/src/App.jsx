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
import Drivers from "./pages/Drivers";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RouteList from "./features/Shuttle & Route Management/RouteList";
import RouteForm from "./features/Shuttle & Route Management/RouteForm";
import StopManagerPage from "./features/Shuttle & Route Management/StopManagerPage";
import Profile from "./pages/Profile";

function App() {
  return (
    <Router>
      <div className="flex min-h-screen flex-col bg-gray-50">
        {/* Fixed/sticky Navbar */}
        <Navbar />

        {/* Main content area – grows to fill space + padding below navbar */}
        <main className="flex-grow pt-16 md:pt-20">
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
            <Route path="/RouteList" element={<RouteList />} />
            <Route path="/RouteForm" element={<RouteForm />} />
            <Route path="/stop" element={<StopManagerPage />} />
            <Route path="/stop/:routeId" element={<StopManagerPage />} />
            <Route path="/profile" element={<Profile />} />

            {/* Fallback route – better to show 404 page in future */}
            <Route path="*" element={<Home />} />
          </Routes>
        </main>

        {/* Footer at the bottom */}
        <Footer />
      </div>
    </Router>
  );
}

export default App;
