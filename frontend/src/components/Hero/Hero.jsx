import { useState } from "react";
import { motion } from "framer-motion";
import { MapPin, ArrowLeftRight, Zap, Search } from "lucide-react";
import { useNavigate } from "react-router-dom";
import MapView from "../MapView";

const Hero = () => {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const navigate = useNavigate();

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  return (
    <section className="min-h-[90vh] flex items-center px-1 pt-2">
      <div className="max-w-7xl mx-auto w-full grid md:grid-cols-2 gap-12 items-center">

        {/* ================= LEFT SIDE ================= */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-block px-4 py-2 bg-lightGreen rounded-full text-darkGreen font-medium mb-6">
            India’s Smart EV Ecosystem ⚡
          </div>

          <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
            Charge.
            <span className="text-primary"> Navigate.</span>
            Drive Smarter.
          </h1>

          <p className="text-gray-600 text-lg mt-6">
            Plan routes, book charging slots, and power your EV journey —
            all in one intelligent platform.
          </p>

          {/* SEARCH CARD */}
          <div className="mt-10 bg-white/80 backdrop-blur-lg p-6 rounded-3xl shadow-xl space-y-4">

            {/* SEARCH BAR */}
            <div className="bg-white shadow rounded-2xl p-3 flex flex-col sm:flex-row items-center gap-3">

              {/* FROM */}
              <div className="flex items-center gap-2 px-3 w-full sm:flex-1">
                <MapPin className="text-primary" size={18} />
                <input
                  type="text"
                  placeholder="From"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>

              <div className="w-full h-px sm:w-px sm:h-8 bg-gray-200"></div>

              {/* TO */}
              <div className="flex items-center gap-2 px-3 w-full sm:flex-1">
                <MapPin className="text-green-500" size={18} />
                <input
                  type="text"
                  placeholder="To"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full outline-none text-sm"
                />
              </div>

              {/* SWAP & SEARCH CONTAINER FOR MOBILE */}
              <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-start mt-2 sm:mt-0">
                {/* SWAP */}
                <button
                  onClick={handleSwap}
                  className="p-2 hover:bg-gray-100 rounded-full transition sm:rotate-0 rotate-90"
                >
                  <ArrowLeftRight size={18} />
                </button>

                {/* SEARCH */}
                <button
                  onClick={() =>
                    navigate("/trip-planner", {
                      state: { from, to },
                    })
                  }
                  className="bg-primary text-white px-6 py-3 rounded-xl flex items-center gap-2 hover:scale-105 transition flex-1 sm:flex-none justify-center"
                >
                  <Search size={18} />
                  Search
                </button>
              </div>
            </div>

            {/* QUICK ROUTES */}
            <div className="flex gap-3 flex-wrap">
              {["Hyderabad → Bangalore", "Delhi → Jaipur", "Mumbai → Pune"].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    const [f, t] = item.split(" → ");
                    setFrom(f);
                    setTo(t);
                  }}
                  className="px-4 py-2 bg-lightGreen text-darkGreen rounded-full text-sm hover:scale-105 transition"
                >
                  {item}
                </button>
              ))}
            </div>

            {/* CTA BUTTONS */}
            <div className="grid grid-cols-2 gap-4 pt-2">

              <button
                onClick={() =>
                  navigate("/trip-planner", {
                    state: { from, to },
                  })
                }
                className="bg-primary text-white py-3 rounded-xl font-semibold hover:scale-105 transition"
              >
                Plan Trip
              </button>

              <button
                onClick={() => navigate("/book-slot")}
                className="border border-gray-300 py-3 rounded-xl font-semibold hover:bg-gray-100 transition flex items-center justify-center gap-2"
              >
                <Zap size={16} />
                Book Slot
              </button>

            </div>

          </div>
        </motion.div>

        {/* ================= RIGHT SIDE ================= */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="flex flex-col gap-6"
        >

          {/* MAP */}
          <div className="bg-white p-4 rounded-3xl shadow-2xl h-[300px] border border-green-100">
            <h3 className="font-semibold text-gray-700 mb-3">
              📍 Your Location & Nearby Chargers
            </h3>

            <div className="h-[230px]">
              <MapView />
            </div>
          </div>

          {/* STATUS CARD */}
          <div className="bg-white p-6 rounded-3xl shadow-2xl border border-green-100">

            <h3 className="font-semibold text-gray-700 mb-4">
              Live Charging Status
            </h3>

            <div className="mb-4">
              <div className="flex justify-between text-sm">
                <span>Battery</span>
                <span className="text-primary font-bold">78%</span>
              </div>

              <div className="w-full h-3 bg-gray-200 rounded-full mt-2">
                <div className="w-[78%] h-full bg-primary rounded-full"></div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-6">

              <div className="bg-lightGreen p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500">Speed</p>
                <h2 className="font-bold text-lg text-darkGreen">48 kW</h2>
              </div>

              <div className="bg-lightGreen p-4 rounded-xl text-center">
                <p className="text-sm text-gray-500">Range</p>
                <h2 className="font-bold text-lg text-darkGreen">312 km</h2>
              </div>

            </div>

          </div>

        </motion.div>

      </div>
    </section>
  );
};

export default Hero;