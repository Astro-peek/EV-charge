import { motion } from "framer-motion";
import { MapPin, Zap, Clock } from "lucide-react";

const ChargeSaathiPage = () => {
  return (
    <div className="pt-24 px-6 bg-gray-50 min-h-screen">

      <div className="max-w-7xl mx-auto">

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-bold text-gray-900">
            ChargeSaathi 🚗⚡
          </h1>
          <p className="text-gray-600 mt-4">
            Find and book EV charging stations near you.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">

          <div className="bg-white p-6 rounded-2xl shadow">
            <MapPin className="text-primary mb-3" />
            <h3>Find Nearby Chargers</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <Zap className="text-primary mb-3" />
            <h3>Fast Charging Options</h3>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow">
            <Clock className="text-primary mb-3" />
            <h3>Book Time Slots</h3>
          </div>

        </div>

      </div>

    </div>
  );
};

export default ChargeSaathiPage;