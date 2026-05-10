import React from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Map,
  Calendar,
  LogOut,
  Bell,
  User,
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    { name: "Dashboard", icon: Home, path: "/dashboard" },
    { name: "Trip Planner", icon: Map, path: "/trip-planner" },
    { name: "Book Slot", icon: Calendar, path: "/book-slot" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* 🔹 SIDEBAR */}
      <div className="w-64 bg-white shadow-xl flex flex-col p-6 fixed h-full">
        <h1
          onClick={() => navigate("/")}
          className="text-2xl font-bold text-green-600 mb-10 cursor-pointer"
        >
          IntelliRide
        </h1>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => navigate(item.path)}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl transition ${
                  active
                    ? "bg-green-500 text-white shadow-md"
                    : "text-gray-700 hover:bg-green-50 hover:text-green-600"
                }`}
              >
                <Icon size={18} />
                {item.name}
              </button>
            );
          })}
        </nav>

        {/* LOGOUT */}
        <div className="mt-auto pt-6">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition w-full"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 MAIN AREA */}
      <div className="flex-1 ml-64 p-8">
        {/* 🔸 TOPBAR */}
        <div className="flex justify-between items-center mb-10">
          <h2 className="text-3xl font-bold text-gray-900 capitalize">
            {location.pathname.split("/").pop() || "Dashboard"}
          </h2>

          <div className="flex items-center gap-6">
            <Bell className="cursor-pointer hover:text-green-600 transition" />
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden">
                {user?.photo ? (
                  <img src={user.photo} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-green-600" />
                )}
              </div>
              <div className="text-sm">
                <p className="font-medium text-gray-900">{user?.email}</p>
                <p className="text-gray-500 text-xs">{user?.role || "User"}</p>
              </div>
            </div>
          </div>
        </div>

        {children}
      </div>
    </div>
  );
};

export default DashboardLayout;
