import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

const Navbar = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // ✅ get logged-in user

  const navLinks = [
    { name: "Home", path: "/" },
    { name: "Trip Planner", path: "/trip-planner" },
    { name: "ChargeAnna", path: "/become-host" },
    { name: "Vehicle ID", path: "/vehicle-id" },
    { name: "Book Slot", path: "/book-slot" },
    { name: "ReChakra", path: "/rechakra" },
  ];

  return (
    <header className="w-full bg-white shadow-sm border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 lg:px-10 h-[72px] flex items-center justify-between">

        {/* LOGO */}
        <div
          onClick={() => navigate("/")}
          className="cursor-pointer"
        >
          <h1 className="text-4xl font-black text-green-500 tracking-tight">
            IntelliRide
          </h1>
        </div>

        {/* NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-10">
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

        {/* RIGHT SIDE */}
        <div className="flex items-center gap-4">

          {/* HOST DASHBOARD LINK - only for logged in users */}
          {user && (
            <button
              onClick={() => navigate("/host-dashboard")}
              className="hidden md:flex px-4 py-2 rounded-xl bg-slate-900 text-white text-sm font-bold hover:bg-slate-700 transition-all items-center gap-1.5"
            >
              ⚡ Host Dashboard
            </button>
          )}

          {/* ✅ CONDITIONAL BUTTON */}
          {user ? (
            <button
              onClick={() => navigate("/dashboard")}
              className="px-6 py-2.5 rounded-2xl bg-green-500 text-white font-semibold hover:bg-green-600 transition-all duration-300 shadow-md"
            >
              My Profile
            </button>
          ) : (
            <button
              onClick={() => navigate("/login")}
              className="px-7 py-2.5 rounded-2xl border-2 border-green-500 text-green-600 font-semibold hover:bg-green-50 transition-all duration-300"
            >
              Login
            </button>
          )}

        </div>

      </div>
    </header>
  );
};

export default Navbar;