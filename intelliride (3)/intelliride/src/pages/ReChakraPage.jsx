import { motion } from "framer-motion";
import {
  BatteryCharging,
  MapPin,
  Truck,
  Activity,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";

const ReChakraPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#f4fff7] via-white to-[#e8fff0]">

      {/* HERO */}
      <section className="relative pt-12 pb-10 px-6 overflow-hidden">

        {/* GLOW BACKGROUND */}
        <div className="absolute top-20 left-20 w-72 h-72 bg-green-300/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-10 right-10 w-72 h-72 bg-green-200/30 blur-[120px] rounded-full"></div>

        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">

          {/* LEFT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 text-green-700 font-semibold mb-6">
              <BatteryCharging size={18} />
              ReChakra Energy Network
            </div>

            <h1 className="text-5xl md:text-7xl font-bold leading-tight text-gray-900">
              Smart Battery
              <span className="text-green-600"> Swapping</span>
              <br />
              For Bharat ⚡
            </h1>

            <p className="text-gray-600 text-lg mt-8 leading-relaxed max-w-xl">
              ReChakra powers India's next-generation shared mobility ecosystem
              with intelligent battery swapping, fleet monitoring,
              and AI-powered energy optimization.
            </p>

            {/* BUTTONS */}
            <div className="flex flex-wrap gap-4 mt-10">
              <button
  onClick={() => navigate("/find-and-book")}
  className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl font-semibold shadow-xl transition hover:scale-105"
>
  Find Swap Station
</button>

              <button className="px-8 py-4 bg-white border border-gray-200 rounded-2xl font-semibold hover:shadow-lg transition">
                Learn More
              </button>
            </div>

            {/* STATS */}
            <div className="grid grid-cols-3 gap-5 mt-14">
              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg border border-white">
                <h3 className="text-3xl font-bold text-green-600">120+</h3>
                <p className="text-gray-500 mt-1 text-sm">Swap Stations</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg border border-white">
                <h3 className="text-3xl font-bold text-green-600">8K+</h3>
                <p className="text-gray-500 mt-1 text-sm">Daily Swaps</p>
              </div>

              <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-5 shadow-lg border border-white">
                <h3 className="text-3xl font-bold text-green-600">99%</h3>
                <p className="text-gray-500 mt-1 text-sm">Uptime</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT SIDE */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >

            {/* MAIN CARD */}
            <div className="relative z-20 bg-white/70 backdrop-blur-2xl border border-white rounded-[40px] p-8 shadow-2xl">

              {/* HEADER */}
              <div className="flex justify-between items-center mb-8">
                <div>
                  <p className="text-gray-500 text-sm">
                    Live Battery Status
                  </p>
                  <h2 className="text-2xl font-bold text-gray-900 mt-1">
                    Fleet Dashboard
                  </h2>
                </div>

                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center">
                  <BatteryCharging className="text-green-600" />
                </div>
              </div>

              {/* BATTERY */}
              <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-3xl p-6 text-white shadow-xl">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-green-100">Available Batteries</p>
                    <h3 className="text-5xl font-bold mt-2">248</h3>
                  </div>

                  <div className="w-28 h-14 border-4 border-white rounded-lg relative">
                    <div className="absolute top-0 left-0 h-full w-[85%] bg-white rounded-md"></div>
                    <div className="absolute -right-3 top-4 w-2 h-6 bg-white rounded"></div>
                  </div>
                </div>
              </div>

              {/* FEATURES */}
              <div className="grid grid-cols-2 gap-5 mt-8">
                <div className="bg-[#f8fff9] rounded-3xl p-5 border border-green-100">
                  <MapPin className="text-green-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Smart Stations</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Real-time station discovery & navigation
                  </p>
                </div>

                <div className="bg-[#f8fff9] rounded-3xl p-5 border border-green-100">
                  <Truck className="text-green-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Fleet Control</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Monitor commercial EV fleets instantly
                  </p>
                </div>

                <div className="bg-[#f8fff9] rounded-3xl p-5 border border-green-100">
                  <Activity className="text-green-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Live Analytics</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    AI-powered battery health monitoring
                  </p>
                </div>

                <div className="bg-[#f8fff9] rounded-3xl p-5 border border-green-100">
                  <ShieldCheck className="text-green-600 mb-3" />
                  <h3 className="font-bold text-gray-900">Safe Charging</h3>
                  <p className="text-gray-500 text-sm mt-2">
                    Intelligent thermal & voltage protection
                  </p>
                </div>
              </div>
            </div>

            {/* FLOATING CARD (FIXED) */}
      

          </motion.div>

        </div>
      </section>
    </div>
  );
};

export default ReChakraPage;