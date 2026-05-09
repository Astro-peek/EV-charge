
import { useState } from "react";
import { motion } from "framer-motion";
import {
  Car,
  BatteryCharging,
  Zap,
  QrCode,
  CheckCircle,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";

const VehicleProtocolPage = () => {
  const [vehicleData, setVehicleData] = useState({
    owner: "",
    vehicle: "",
    connector: "CCS2",
    battery: "",
    number: "",
  });

  const [generated, setGenerated] = useState(false);

  const handleChange = (e) => {
    setVehicleData({
      ...vehicleData,
      [e.target.name]: e.target.value,
    });
  };

  const generateQRData = () => {
    return JSON.stringify({
      owner: vehicleData.owner,
      vehicle: vehicleData.vehicle,
      connector: vehicleData.connector,
      battery: vehicleData.battery,
      number: vehicleData.number,
      protocol: "VehicleID v1",
      fastCharging: true,
    });
  };

  const handleGenerate = () => {
    if (
      !vehicleData.owner ||
      !vehicleData.vehicle ||
      !vehicleData.battery ||
      !vehicleData.number
    ) {
      alert("Please complete all fields");
      return;
    }

    setGenerated(true);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-green-100 px-6 py-6">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="inline-flex items-center gap-2 bg-green-100 text-green-700 px-5 py-2 rounded-full font-semibold mb-6">
            <QrCode size={18} />
            VehicleID Protocol
          </div>

          <h1 className="text-5xl md:text-6xl font-black leading-tight text-gray-900">
            One Scan.
            <span className="text-green-600"> Instant Charging.</span>
          </h1>

          <p className="text-gray-600 text-lg mt-6 leading-relaxed max-w-xl">
            Register your EV once and generate a smart QR code that every charging station can understand automatically.
          </p>

          {/* FEATURES */}
          <div className="mt-10 space-y-5">

            <div className="bg-white p-5 rounded-3xl shadow border border-green-100 flex gap-4">
              <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center text-green-600">
                <Car />
              </div>

              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  Auto Vehicle Detection
                </h3>
                <p className="text-gray-600 mt-1">
                  Chargers instantly detect connector type, battery size, and charging support.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow border border-green-100 flex gap-4">
              <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center text-green-600">
                <BatteryCharging />
              </div>

              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  Faster Charging Experience
                </h3>
                <p className="text-gray-600 mt-1">
                  No manual setup needed. Scan and start charging instantly.
                </p>
              </div>
            </div>

            <div className="bg-white p-5 rounded-3xl shadow border border-green-100 flex gap-4">
              <div className="bg-green-100 w-14 h-14 rounded-2xl flex items-center justify-center text-green-600">
                <Zap />
              </div>

              <div>
                <h3 className="font-bold text-xl text-gray-900">
                  Bharat Ready
                </h3>
                <p className="text-gray-600 mt-1">
                  Designed for India's future EV infrastructure ecosystem.
                </p>
              </div>
            </div>

          </div>
        </motion.div>

        {/* RIGHT SIDE */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.7 }}
        >

          <div className="bg-white rounded-[40px] shadow-2xl border border-green-100 overflow-hidden">

            {/* HEADER */}
            <div className="bg-gradient-to-r from-green-500 to-green-600 p-8 text-white">
              <h2 className="text-3xl font-bold">
                Register Your EV
              </h2>

              <p className="text-green-100 mt-2">
                Generate your smart VehicleID QR code.
              </p>
            </div>

            {/* FORM */}
            <div className="p-8 space-y-5">

              <input
                type="text"
                name="owner"
                placeholder="Owner Name"
                value={vehicleData.owner}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                name="vehicle"
                placeholder="Vehicle Model"
                value={vehicleData.vehicle}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500"
              />

              <input
                type="text"
                name="number"
                placeholder="Vehicle Number"
                value={vehicleData.number}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500"
              />

              <select
                name="connector"
                value={vehicleData.connector}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option>CCS2</option>
                <option>Type 2</option>
                <option>CHAdeMO</option>
              </select>

              <input
                type="text"
                name="battery"
                placeholder="Battery Capacity (e.g. 40 kWh)"
                value={vehicleData.battery}
                onChange={handleChange}
                className="w-full p-4 rounded-2xl border border-gray-200 outline-none focus:ring-2 focus:ring-green-500"
              />

              <button
                onClick={handleGenerate}
                className="w-full bg-green-500 hover:bg-green-600 transition text-white font-bold py-4 rounded-2xl text-lg"
              >
                Generate Vehicle QR
              </button>

              {/* QR RESULT */}
              {generated && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-8 bg-gradient-to-br from-green-50 to-white rounded-3xl p-8 border border-green-100"
                >

                  <div className="flex justify-center">
                    <div className="bg-white p-5 rounded-3xl shadow-lg">
                     <div className="flex justify-center">
  <div className="bg-white p-4 rounded-3xl shadow-xl">
    <QRCodeSVG
      value={generateQRData()}
      size={220}
      bgColor="#ffffff"
      fgColor="#000000"
      level="H"
    />
  </div>
</div>
                    </div>
                  </div>

                  <div className="mt-8 space-y-3">

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Vehicle</span>
                      <span className="font-bold text-gray-900">
                        {vehicleData.vehicle}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Connector</span>
                      <span className="font-bold text-green-600">
                        {vehicleData.connector}
                      </span>
                    </div>

                    <div className="flex justify-between border-b pb-2">
                      <span className="text-gray-500">Battery</span>
                      <span className="font-bold text-gray-900">
                        {vehicleData.battery}
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span className="text-gray-500">Fast Charging</span>
                      <span className="font-bold text-green-600 flex items-center gap-2">
                        <CheckCircle size={18} /> Enabled
                      </span>
                    </div>

                  </div>
                </motion.div>
              )}

            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default VehicleProtocolPage;

