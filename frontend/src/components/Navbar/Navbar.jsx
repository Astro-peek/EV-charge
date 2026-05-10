import { useState } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ get logged-in user
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Trip Planner", path: "/trip-planner" },
    { name: "ChargeNest", path: "/become-host" },
    { name: "Vehicle ID", path: "/vehicle-id" },
    { name: "Book Slot", path: "/book-slot" },
  ];

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-10 h-[72px] flex items-center justify-between">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer"
        >
          <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-green-500 tracking-tight">
            IntelliRide
          </h1>
        </div>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-8 xl:gap-10">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              className={({ isActive }) =>
                `text-[15px] font-semibold transition-all duration-200 hover:text-green-500 ${
                  isActive ? "text-green-500" : "text-gray-900"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
        </nav>

        {/* RIGHT SIDE & HAMBURGER */}
        <div className="flex items-center gap-3 sm:gap-4">

          {/* HOST DASHBOARD LINK - only for logged in users */}
          {user && (
            <button
              onClick={() => navigate("/host-dashboard")}
              className="hidden lg:flex px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-all items-center gap-1.5"
            >
              ⚡ Host
            </button>
          )}

          {/* ✅ CONDITIONAL BUTTON */}
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="hidden sm:block px-5 sm:px-6 py-2 sm:py-2.5 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-300 shadow-md text-sm sm:text-base"
            >
              Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="hidden sm:block px-5 sm:px-7 py-2 sm:py-2.5 rounded-2xl border-2 border-green-500 text-green-600 font-semibold hover:bg-green-50 transition-all duration-300 text-sm sm:text-base"
            >
              Login
            </button>
          )}

          {/* HAMBURGER MENU BUTTON */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU */}
      {isMobileMenuOpen && (
        <div className="lg:hidden absolute top-[72px] left-0 w-full bg-white shadow-md border-b border-gray-100 flex flex-col py-4 px-6 space-y-4">
          {navLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.path}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block text-lg font-semibold transition-all duration-200 hover:text-green-500 ${
                  isActive ? "text-green-500" : "text-gray-900"
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}
          
          <div className="pt-4 border-t border-gray-100 flex flex-col gap-3">
            {user && (
              <button
                onClick={() => {
                  navigate("/host-dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-700 transition-all text-center flex justify-center items-center gap-2"
              >
                ⚡ Host Dashboard
              </button>
            )}

            {user ? (
              <button
                onClick={() => {
                  navigate("/dashboard");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-300 shadow-md text-center"
              >
                My Profile
              </button>
            ) : (
              <button
                onClick={() => {
                  navigate("/login");
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-3 rounded-2xl border-2 border-green-500 text-green-600 font-semibold hover:bg-green-50 transition-all duration-300 text-center"
              >
                Login
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;