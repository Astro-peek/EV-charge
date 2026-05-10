import { motion } from "framer-motion";
import { Zap, MapPin, IndianRupee, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

const ChargeNest = () => {
  const navigate = useNavigate();

  return (
    <section className="py-28 px-6 bg-gradient-to-b from-white to-green-50">

      <div className="max-w-7xl mx-auto">

        {/* MAIN CARD */}
        <motion.div
          initial={{ opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="relative rounded-[48px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.15)]"
        >

          {/* BACKGROUND LAYERS */}
          <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-green-600"></div>
          <div className="absolute inset-0 backdrop-blur-2xl bg-white/5"></div>

          {/* GLOW BLOBS */}
          <div className="absolute -top-20 -right-20 w-96 h-96 bg-white/10 blur-3xl rounded-full"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-green-300/20 blur-3xl rounded-full"></div>

          {/* CONTENT */}
          <div className="relative z-10 grid md:grid-cols-2 gap-12 items-center p-10 md:p-16">

            {/* LEFT */}
            <div>

              <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm mb-6">
                ChargeNest ⚡ Host Network
              </div>

              <h2 className="text-4xl md:text-6xl font-bold leading-tight text-white">
                Turn Your Charger
                <br />
                Into Income
              </h2>

              <p className="mt-6 text-green-100 text-lg max-w-md">
                Share your EV charger with nearby drivers and manage bookings,
                pricing, and availability—all in one place.
              </p>

              {/* FEATURES */}
              <div className="mt-8 space-y-4 text-green-100">

                <div className="flex items-center gap-3">
                  <IndianRupee />
                  <p>Set pricing & availability</p>
                </div>

                <div className="flex items-center gap-3">
                  <MapPin />
                  <p>Reach nearby EV drivers</p>
                </div>

                <div className="flex items-center gap-3">
                  <Zap />
                  <p>Accept bookings instantly</p>
                </div>

              </div>

              {/* CTA */}
              <div className="mt-10 flex gap-4 flex-wrap">

                <button
                  onClick={() => navigate("/become-host")}
                  className="bg-white text-green-600 px-8 py-4 rounded-2xl font-semibold flex items-center gap-2 hover:scale-105 transition"
                >
                  Join ChargeNest
                  <ArrowRight size={18} />
                </button>

                <button
                  className="border border-white/40 text-white px-6 py-4 rounded-2xl hover:bg-white/10 transition"
                >
                  Learn More
                </button>

              </div>

              {/* TRUST STATS */}
              <div className="mt-10 flex gap-6 md:gap-10 text-white flex-wrap">

                <div>
                  <h3 className="text-2xl font-bold">24/7</h3>
                  <p className="text-sm text-green-100">Availability</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold">Instant</h3>
                  <p className="text-sm text-green-100">Bookings</p>
                </div>

                <div>
                  <h3 className="text-2xl font-bold">Flexible</h3>
                  <p className="text-sm text-green-100">Pricing</p>
                </div>

              </div>

            </div>

            {/* RIGHT */}
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              className="relative"
            >

              <img
                src="images/charge-anna.jpg"
                alt="EV Charging"
                className="rounded-3xl w-full h-[420px] object-cover shadow-2xl"
              />

              {/* OVERLAY */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent rounded-3xl"></div>

              {/* FLOATING CARD */}
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="absolute bottom-6 left-6 bg-white p-4 rounded-xl shadow-xl"
              >
                <p className="text-sm text-gray-500">Host Earnings</p>
                <h3 className="text-lg font-bold text-primary">Flexible</h3>
              </motion.div>

            </motion.div>

          </div>

        </motion.div>

      </div>

    </section>
  );
};

export default ChargeNest;