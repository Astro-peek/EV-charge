import { Routes, Route } from "react-router-dom";

import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

import MainLayout from "./layouts/MainLayout";

import Home from "./pages/Home";
import TripPlanner from "./pages/TripPlanner";
import About from "./pages/About";
import Login from "./pages/Login";
import AdminDashboard from "./pages/AdminDashboard";
import Dashboard from "./pages/Dashboard";
import BecomeHost from "./pages/BecomeHost";
import HostDashboard from "./pages/HostDashboard";

import ChargeNestPage from "./pages/ChargeNestPage";
import ChargeSaathiPage from "./pages/ChargeSaathiPage";
import VehicleProtocolPage from "./pages/VehicleProtocolPage";

import FindAndBook from "./pages/FindAndBook";
import PaymentSuccess from "./pages/PaymentSuccess";
import PaymentCancel from "./pages/PaymentCancel";

function App() {
  return (
    <Routes>
      {/* ALL PAGES WITH NAVBAR */}
      <Route element={<MainLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/trip-planner" element={<TripPlanner />} />
        <Route path="/about" element={<About />} />
        <Route path="/become-host" element={<BecomeHost />} />
        <Route path="/host-dashboard" element={<HostDashboard />} />
        <Route path="/charge-anna" element={<ChargeNestPage />} />
        <Route path="/charge-saathi" element={<ChargeSaathiPage />} />
        <Route path="/vehicle-id" element={<VehicleProtocolPage />} />
        <Route path="/book-slot" element={<FindAndBook />} />

        {/* Protected User Dashboard */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminDashboard />
            </AdminRoute>
          }
        />
      </Route>

      {/* WITHOUT NAVBAR */}
      <Route path="/login" element={<Login />} />
      <Route path="/payment/success" element={<PaymentSuccess />} />
      <Route path="/payment/cancel" element={<PaymentCancel />} />

      {/* 404 */}
      <Route path="*" element={<h1 className="text-center mt-20 text-3xl font-bold">404 - Page Not Found</h1>} />
    </Routes>
  );
}

export default App;