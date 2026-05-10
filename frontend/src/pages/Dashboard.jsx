import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Calendar, Map, Zap, LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../layouts/DashboardLayout";
import Card from "../components/common/Card";
import Button from "../components/common/Button";
import { bookingService, invoiceService } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const Dashboard = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const response = await bookingService.getBookings(user?.id);
        setBookings(response.data);
      } catch (error) {
        console.error("Error fetching bookings:", error);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      fetchBookings();
    }
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <DashboardLayout>
      {/* 🔸 HEADER / LOGOUT */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4">
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            Welcome, {user?.name || "User"}
          </h2>
          <p className="text-gray-500 mt-1">Manage your bookings and account settings</p>
        </div>
        <Button
          variant="danger"
          onClick={handleLogout}
          className="flex items-center gap-2"
        >
          <LogOut size={18} />
          Logout
        </Button>
      </div>

      {/* 🔸 STATS */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="flex items-center gap-4">
          <div className="p-3 bg-green-100 rounded-xl text-green-600">
            <Calendar size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Total Bookings</p>
            <h3 className="text-2xl font-bold">{bookings.length}</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-blue-100 rounded-xl text-blue-600">
            <Map size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Active Stations</p>
            <h3 className="text-2xl font-bold">12</h3>
          </div>
        </Card>

        <Card className="flex items-center gap-4">
          <div className="p-3 bg-purple-100 rounded-xl text-purple-600">
            <Zap size={24} />
          </div>
          <div>
            <p className="text-gray-500 text-sm">Energy Used</p>
            <h3 className="text-2xl font-bold">320 kWh</h3>
          </div>
        </Card>
      </div>

      {/* 🔸 QUICK ACTIONS */}
      <div className="mt-12">
        <h3 className="text-xl font-semibold mb-6">Quick Actions</h3>
        <div className="grid md:grid-cols-3 gap-6">
          <Button
            onClick={() => navigate("/book-slot")}
            className="bg-gradient-to-r from-green-500 to-emerald-500 h-24 text-lg"
          >
            ⚡ Book Charging Slot
          </Button>
          <Button
            onClick={() => navigate("/trip-planner")}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-24 text-lg"
          >
            🗺️ Plan Trip
          </Button>
          <Button
            onClick={() => navigate("/rechakra")}
            className="bg-gradient-to-r from-purple-500 to-pink-500 h-24 text-lg"
          >
            🔋 Battery Swap
          </Button>
        </div>
      </div>

      {/* 🔸 RECENT BOOKINGS */}
      <div className="mt-12">
        <Card>
          <h3 className="text-xl font-semibold mb-6">Recent Bookings</h3>
          {loading ? (
            <p className="text-gray-500">Loading bookings...</p>
          ) : bookings.length > 0 ? (
            <div className="space-y-4">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="flex justify-between items-center p-3 rounded-xl hover:bg-gray-50 transition border border-transparent hover:border-gray-100"
                >
                  <div>
                    <p className="font-medium">{booking.station?.name || "Unknown Station"}</p>
                    <p className="text-sm text-gray-500">{booking.station?.address || "N/A"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm text-gray-500 block">
                      {booking.start_time ? new Date(booking.start_time).toLocaleDateString() : "Invalid Date"}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      booking.status === 'active' ? 'bg-green-100 text-green-600' 
                      : booking.status === 'completed' ? 'bg-blue-100 text-blue-600'
                      : 'bg-gray-100 text-gray-600'
                    }`}>
                      {booking.status}
                    </span>
                    {(booking.status === 'active' || booking.status === 'completed') && (
                      <a
                        href={invoiceService.downloadInvoice(booking.id)}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-green-600 font-bold hover:underline flex items-center gap-1"
                      >
                        📄 Download Invoice
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10">
              <p className="text-gray-500 mb-4">No bookings found.</p>
              <Button variant="outline" onClick={() => navigate("/book-slot")}>
                Book Your First Slot
              </Button>
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;