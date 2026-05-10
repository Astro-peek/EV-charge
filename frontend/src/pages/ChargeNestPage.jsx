import { motion } from "framer-motion";
import { Zap, IndianRupee, MapPin } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChargeNestPage = () => {
  const navigate = useNavigate();

  return (
    <div className="pt-24 px-6 bg-gradient-to-br from-green-50 to-white min-h-screen">

      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900">
            ChargeNest ⚡
          </h1>
          <p className="text-gray-600 mt-4">
            Turn your EV charger into a shared resource for nearby drivers.
          </p>
        </motion.div>

        {/* FEATURES */}
        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-2xl shadow">
            <IndianRupee className="text-primary mb-3" />
            <h3 className="font-semibold">Set Pricing</h3>
            <p className="text-gray-500 text-sm mt-2">
              Control your own rates and availability.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <MapPin className="text-primary mb-3" />
            <h3 className="font-semibold">List Location</h3>
            <p className="text-gray-500 text-sm mt-2">
              Make your charger discoverable nearby.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <Zap className="text-primary mb-3" />
            <h3 className="font-semibold">Accept Bookings</h3>
            <p className="text-gray-500 text-sm mt-2">
              Manage requests in real-time.
            </p>
          </div>

        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button
            onClick={() => navigate("/become-host")}
            className="bg-primary text-white px-8 py-4 rounded-xl hover:scale-105 transition"
          >
            Become a Host
          </button>
        </div>

      </div>

    </div>
  );
};

export default ChargeNestPage;