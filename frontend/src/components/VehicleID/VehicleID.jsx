import { motion } from "framer-motion";
import { useState } from "react";
import { QRCodeCanvas } from "qrcode.react";

const VehicleProtocolPage = () => {
  const [vehicle, setVehicle] = useState("Tata Nexon EV");
  const [connector, setConnector] = useState("CCS2");
  const [battery, setBattery] = useState("40");
  const [fastCharging, setFastCharging] = useState(true);

  // QR DATA
  const qrData = JSON.stringify({
    vehicle,
    connector,
    battery: `${battery} kWh`,
    fastCharging,
  });

  return (
    <section className="min-h-screen py-3 px-4 bg-gradient-to-br from-green-50 via-white to-green-100 overflow-hidden">

      <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-12 items-center">

        {/* LEFT */}
        <motion.div
          initial={{ opacity: 0, x: -60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >

          <div className="inline-block px-5 py-2 rounded-full bg-green-100 text-green-700 font-medium mb-6">
            VehicleID Protocol
          </div>

          <h2 className="text-5xl md:text-6xl font-bold leading-tight text-gray-900">
            One QR.
            <span className="text-green-600"> Zero Confusion.</span>
          </h2>

          <p className="text-gray-600 text-lg mt-6 leading-relaxed">
            Register your EV once and instantly connect with compatible
            chargers across India.
          </p>

          {/* FORM */}
          <div className="mt-10 space-y-5">

            <input
              type="text"
              placeholder="Vehicle Name"
              value={vehicle}
              onChange={(e) => setVehicle(e.target.value)}
              className="w-full p-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-lg outline-none focus:ring-2 focus:ring-green-500"
            />

            <select
              value={connector}
              onChange={(e) => setConnector(e.target.value)}
              className="w-full p-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-lg outline-none"
            >
              <option>CCS2</option>
              <option>Type 2</option>
              <option>CHAdeMO</option>
              <option>GB/T</option>
            </select>

            <input
              type="number"
              placeholder="Battery Capacity"
              value={battery}
              onChange={(e) => setBattery(e.target.value)}
              className="w-full p-4 rounded-2xl border border-gray-200 bg-white/80 backdrop-blur-lg outline-none"
            />

            <div className="flex items-center justify-between bg-white/80 backdrop-blur-lg p-4 rounded-2xl border border-gray-200">
              <p className="font-medium text-gray-700">
                Fast Charging Enabled
              </p>

              <button
                onClick={() => setFastCharging(!fastCharging)}
                className={`w-16 h-8 rounded-full transition relative ${
                  fastCharging
                    ? "bg-green-500"
                    : "bg-gray-300"
                }`}
              >
                <div
                  className={`absolute top-1 w-6 h-6 bg-white rounded-full transition ${
                    fastCharging ? "left-9" : "left-1"
                  }`}
                />
              </button>
            </div>

          </div>

        </motion.div>

        {/* RIGHT */}
        <motion.div
          initial={{ opacity: 0, x: 60 }}
          whileInView={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="relative"
        >

          {/* CARD */}
          <div className="relative bg-white/30 backdrop-blur-2xl border border-white/20 rounded-[40px] p-10 shadow-[0_20px_80px_rgba(0,0,0,0.15)] overflow-hidden">

            {/* GLOW */}
            <div className="absolute -top-20 -right-20 w-72 h-72 bg-green-300/30 blur-3xl rounded-full"></div>

            <div className="relative z-10">

              {/* QR */}
              <div className="flex justify-center">

                <div className="bg-white p-6 rounded-3xl shadow-xl">
                  <QRCodeCanvas
                    value={qrData}
                    size={220}
                    level="H"
                  />
                </div>

              </div>

              {/* DETAILS */}
              <div className="mt-10 space-y-4">

                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500">Vehicle</span>
                  <span className="font-semibold text-gray-900">
                    {vehicle}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500">Connector</span>
                  <span className="font-semibold text-green-600">
                    {connector}
                  </span>
                </div>

                <div className="flex justify-between items-center border-b border-gray-200 pb-3">
                  <span className="text-gray-500">Battery</span>
                  <span className="font-semibold text-gray-900">
                    {battery} kWh
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-gray-500">
                    Fast Charging
                  </span>

                  <span className="font-semibold text-green-600">
                    {fastCharging ? "Enabled" : "Disabled"}
                  </span>
                </div>

              </div>

            </div>

          </div>

          {/* FLOATING CARD */}
          <div className="absolute -bottom-5 -left-5 bg-white rounded-3xl p-5 shadow-2xl border border-gray-100">
            <p className="text-gray-500 text-sm">
              Charger Compatibility
            </p>

            <h3 className="text-3xl font-bold text-green-600 mt-2">
              100%
            </h3>
          </div>

        </motion.div>

      </div>

    </section>
  );
};

export default VehicleProtocolPage;