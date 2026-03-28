import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";

import Navbar from "./components/NavBar";
import Footer from "./components/Footer";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import Complaint from "./pages/Complaint";
import Schedules from "./pages/Schedules";
import BookRide from "./pages/BookRide";
import MyRides from "./pages/MyRides";
import About from "./pages/About";
import Contact from "./pages/Contact";
import RouteList from "./features/Shuttle & Route Management/RouteList";
import RouteForm from "./features/Shuttle & Route Management/RouteFormAdmin";
import StopManagerPage from "./features/Shuttle & Route Management/StopManagerPage";
import Profile from "./pages/Profile";

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

// Admin
import AdminLogin from "./admin/Adminlogin";
import AdminDashboard from "./admin/AdminDashboard";
import UserManagement from "./admin/UserManagement";
import ComplaintManagement from "./admin/ComplaintManagement";
import ManageRoutes from "./admin/ManageRoutes";
import ProtectedAdminRoute from "./admin/ProtectedAdminRoute";

function AppLayout() {
  const location = useLocation();

  const isAdminRoute =
    location.pathname === "/adminlogin" ||
    location.pathname.startsWith("/admin/") ||
    location.pathname === "/routes/new" ||
    location.pathname === "/RouteForm" ||
    location.pathname === "/RouteList" ||
    location.pathname === "/stop" ||
    location.pathname.startsWith("/stop/");

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {!isAdminRoute && <Navbar />}

      <main className={isAdminRoute ? "flex-grow" : "flex-grow pt-16 md:pt-20"}>
        <Routes>
          {/* User routes */}
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/schedules" element={<Schedules />} />
          <Route path="/book" element={<BookRide />} />
          <Route path="/myrides" element={<MyRides />} />
          <Route path="/terms-and-conditions" element={<MyRides />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/complaint" element={<Complaint />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/routes" element={<RouteList />} />
          <Route path="/RouteList" element={<RouteList />} />
          <Route
            path="/RouteForm"
            element={
              <ProtectedAdminRoute allowedRoles={["admin", "routemanager"]}>
                <RouteForm />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/stop"
            element={
              <ProtectedAdminRoute allowedRoles={["admin", "routemanager"]}>
                <StopManagerPage />
              </ProtectedAdminRoute>
            }
          />
          <Route
            path="/stop/:routeId"
            element={
              <ProtectedAdminRoute allowedRoles={["admin", "routemanager"]}>
                <StopManagerPage />
              </ProtectedAdminRoute>
            }
          />

          {/* Driver Management */}
          <Route path="/drivers" element={<Drivers />} />
          <Route path="/drivers/add" element={<AddDriver />} />
          <Route path="/drivers/edit/:id" element={<EditDriver />} />

          {/* Trip Management */}
          <Route path="/trips" element={<Trips />} />
          <Route path="/trips/add" element={<AddTrip />} />
          <Route path="/trips/edit/:id" element={<EditTrip />} />
          <Route path="/trips/:id" element={<TripDetails />} />

          {/* Driver Portal */}
          <Route path="/driver-portal" element={<DriverDashboard />} />

          {/* Admin */}
          <Route path="/adminlogin" element={<AdminLogin />} />

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
              <ProtectedAdminRoute allowedRoles={["admin"]}>
                <UserManagement />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/complaints"
            element={
              <ProtectedAdminRoute allowedRoles={["admin"]}>
                <ComplaintManagement />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/admin/routes"
            element={
              <ProtectedAdminRoute allowedRoles={["admin"]}>
                <ManageRoutes />
              </ProtectedAdminRoute>
            }
          />

          <Route
            path="/routes/new"
            element={
              <ProtectedAdminRoute allowedRoles={["admin", "routemanager"]}>
                <RouteForm />
              </ProtectedAdminRoute>
            }
          />

          {/* Fallback */}
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
