import { motion } from "framer-motion";

const stops = [
  {
    city: "Gurugram",
    battery: "72%",
    status: "Reserved",
  },
  {
    city: "Neemrana",
    battery: "41%",
    status: "Confirmed",
  },
  {
    city: "Jaipur",
    battery: "18%",
    status: "Destination",
  },
];

const ChargeSaathi = () => {
  return (
    <section className="py-32 px-6 bg-[#f8fff9] overflow-hidden">

      <div className="max-w-7xl mx-auto">

        {/* TOP CONTENT */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="text-center"
        >

          <div className="inline-block px-5 py-2 rounded-full bg-lightGreen text-darkGreen font-medium mb-6">
            ChargeSaathi
          </div>

          <h2 className="text-4xl md:text-6xl font-bold text-gray-900 leading-tight">
            The IRCTC of
            <span className="text-primary"> Highway EV Travel</span>
          </h2>

          <p className="text-gray-600 text-lg mt-6 max-w-3xl mx-auto leading-relaxed">
            Pre-book your entire charging journey before you even start driving.
            Intelligent routing, weather-adjusted range prediction,
            and automatic backup reservations.
          </p>

        </motion.div>

        {/* MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-14 items-center mt-24">

          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >

            <div className="bg-white rounded-[40px] p-8 shadow-2xl border border-green-100">

              <h3 className="text-2xl font-bold text-gray-900">
                Plan EV Journey
              </h3>

              <div className="space-y-5 mt-8">

                <input
                  type="text"
                  placeholder="Starting Location"
                  className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-primary"
                />

                <input
                  type="text"
                  placeholder="Destination"
                  className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-primary"
                />

                <input
                  type="text"
                  placeholder="Current Battery %"
                  className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:border-primary"
                />

                <button className="w-full bg-primary text-white py-4 rounded-2xl font-semibold hover:scale-[1.02] transition">
                  Reserve Complete Journey
                </button>

              </div>

              {/* STATS */}
              <div className="grid grid-cols-3 gap-4 mt-10">

                <div className="bg-lightGreen rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-500">Stops</p>
                  <h4 className="text-2xl font-bold text-darkGreen">
                    2
                  </h4>
                </div>

                <div className="bg-lightGreen rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-500">Distance</p>
                  <h4 className="text-2xl font-bold text-darkGreen">
                    281 km
                  </h4>
                </div>

                <div className="bg-lightGreen rounded-2xl p-4 text-center">
                  <p className="text-sm text-gray-500">Confidence</p>
                  <h4 className="text-2xl font-bold text-darkGreen">
                    96%
                  </h4>
                </div>

              </div>

            </div>

          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 60 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            viewport={{ once: true }}
          >

            <div className="relative">

              {/* TIMELINE */}
              <div className="absolute left-6 top-0 h-full w-1 bg-primary rounded-full"></div>

              <div className="space-y-10">

                {stops.map((stop, index) => (
                  <div
                    key={index}
                    className="relative flex items-start gap-6"
                  >

                    {/* DOT */}
                    <div className="w-12 h-12 rounded-full bg-primary border-4 border-white shadow-lg z-10"></div>

                    {/* CARD */}
                    <div className="bg-white rounded-3xl p-6 shadow-xl border border-green-100 w-full">

                      <div className="flex justify-between items-center">

                        <div>
                          <h3 className="text-2xl font-bold text-gray-900">
                            {stop.city}
                          </h3>

                          <p className="text-gray-500 mt-1">
                            Battery on arrival: {stop.battery}
                          </p>
                        </div>

                        <div className="bg-lightGreen text-darkGreen px-4 py-2 rounded-full font-medium">
                          {stop.status}
                        </div>

                      </div>

                    </div>

                  </div>
                ))}

              </div>

            </div>

          </motion.div>

        </div>

        {/* BOTTOM SHOWCASE */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="mt-24 bg-gradient-to-r from-darkGreen to-primary rounded-[40px] p-10 md:p-16 text-white"
        >

          <div className="max-w-4xl">

            <h3 className="text-4xl md:text-5xl font-bold leading-tight">
              Book Delhi → Jaipur EV Trip
              with Reserved Charging Stops in 30 Seconds
            </h3>

            <p className="mt-6 text-lg text-green-100">
              IntelliRide automatically reserves charging slots,
              predicts battery usage, and reroutes instantly
              if any station goes offline.
            </p>

            <button className="mt-8 bg-white text-darkGreen px-8 py-4 rounded-2xl font-semibold hover:scale-105 transition">
              Start Smart Journey
            </button>

          </div>

        </motion.div>

      </div>

    </section>
  );
};

export default ChargeSaathi;