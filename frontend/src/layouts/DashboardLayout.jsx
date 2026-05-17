import React, { useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  Map,
  Calendar,
  LogOut,
  Bell,
  User,
  Menu,
  X,
} from "lucide-react";

const DashboardLayout = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      {/* 🔹 BACKDROP FOR MOBILE */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity"
        />
      )}

      {/* 🔹 SIDEBAR */}
      <div
        className={`w-64 bg-white shadow-xl flex flex-col p-6 fixed h-full z-50 transition-transform duration-300 lg:translate-x-0 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between mb-10">
          <h1
            onClick={() => {
              navigate("/");
              setIsSidebarOpen(false);
            }}
            className="text-2xl font-bold text-green-600 cursor-pointer"
          >
            IntelliRide
          </h1>
          {/* Close button on mobile */}
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="flex flex-col gap-3">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = location.pathname === item.path;

            return (
              <button
                key={item.name}
                onClick={() => {
                  navigate(item.path);
                  setIsSidebarOpen(false);
                }}
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
      <div className="flex-1 lg:ml-64 p-4 sm:p-6 md:p-8 min-w-0">
        {/* 🔸 TOPBAR */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 sm:mb-10 gap-4">
          <div className="flex items-center gap-3">
            {/* Hamburger button on mobile */}
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 text-gray-700 bg-white shadow rounded-xl hover:bg-gray-50 focus:outline-none"
            >
              <Menu size={22} />
            </button>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 capitalize truncate">
              {location.pathname.split("/").pop() || "Dashboard"}
            </h2>
          </div>

          <div className="flex items-center justify-between sm:justify-end gap-6 bg-white sm:bg-transparent p-3 sm:p-0 rounded-2xl shadow sm:shadow-none">
            <Bell className="cursor-pointer hover:text-green-600 transition" />
            <div className="flex items-center gap-3 bg-white px-4 py-2 rounded-xl shadow-sm sm:shadow border border-gray-100 sm:border-transparent max-w-[240px] sm:max-w-none">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center overflow-hidden flex-shrink-0">
                {user?.photo ? (
                  <img src={user.photo} alt="profile" className="w-full h-full object-cover" />
                ) : (
                  <User className="text-green-600" />
                )}
              </div>
              <div className="text-sm min-w-0">
                <p className="font-medium text-gray-900 truncate">{user?.email}</p>
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
