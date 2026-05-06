import { useState, useEffect } from "react";

import { motion } from "framer-motion";

import {
  MapPin,
  ArrowLeftRight,
  Car,
  Zap,
  BatteryCharging,
  Clock3,
  Route,
  Navigation,
} from "lucide-react";

import { useLocation } from "react-router-dom";

import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
} from "react-leaflet";

import L from "leaflet";

import "leaflet/dist/leaflet.css";

// FIX LEAFLET MARKER ICONS
delete L.Icon.Default.prototype._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",

  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",

  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const TripPlanner = () => {

  const location = useLocation();

  const [from, setFrom] = useState("");

  const [to, setTo] = useState("");

  const [vehicle, setVehicle] = useState("");

  const [battery, setBattery] = useState(80);

  const [result, setResult] = useState(null);

  useEffect(() => {

    if (location.state) {

      setFrom(location.state.from || "");

      setTo(location.state.to || "");

    }

  }, [location]);

  const handleSwap = () => {

    setFrom(to);

    setTo(from);

  };

  const handlePlan = () => {

    setResult({
      distance: "312 km",
      duration: "5h 20m",
      batteryLeft: "18%",
      estimatedCost: "₹420",

      chargingStops: [
        {
          location: "Hyderabad Supercharger",
          charge: "20 min",
          battery: "45%",
        },

        {
          location: "Suryapet Fast Charger",
          charge: "15 min",
          battery: "72%",
        },
      ],
    });

  };

  const vehicles = [
    "Nexon EV",
    "MG ZS EV",
    "BYD Atto 3",
    "Tiago EV",
  ];

  // ROUTE COORDINATES
  const routeCoordinates = [
    [17.385, 78.4867],
    [17.123, 79.208],
    [16.5062, 80.648],
  ];

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f4fff8] via-white to-green-100 pt-5 overflow-hidden">

      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 text-green-700 font-medium">
            ⚡ AI Powered EV Navigation
          </div>

          <h1 className="mt-6 text-5xl md:text-7xl font-black text-gray-900 leading-tight">
            Smart EV
            <span className="text-green-500">
              {" "}Trip Planner
            </span>
          </h1>

          <p className="mt-6 text-gray-600 text-lg max-w-2xl mx-auto">
            Plan optimized EV routes with intelligent charging stops,
            battery estimation, and live navigation.
          </p>

        </motion.div>

        {/* MAIN */}
        <div className="mt-16 grid lg:grid-cols-2 gap-10 items-start">

          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/70 backdrop-blur-2xl border border-white/40 rounded-[32px] p-8 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
          >

            <h2 className="text-3xl font-black text-gray-900">
              Route Details
            </h2>

            <p className="text-gray-500 mt-2">
              Enter trip details to calculate the best EV route.
            </p>

            {/* FROM */}
            <div className="mt-8">

              <label className="text-sm font-medium text-gray-600">
                Starting Location
              </label>

              <div className="mt-2 flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-4">

                <MapPin className="text-green-500" />

                <input
                  type="text"
                  placeholder="Enter start city"
                  value={from}
                  onChange={(e) => setFrom(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />

              </div>

            </div>

            {/* SWAP */}
            <div className="flex justify-center my-5">

              <button
                onClick={handleSwap}
                className="w-14 h-14 rounded-full bg-green-100 hover:bg-green-200 flex items-center justify-center transition-all duration-300 hover:rotate-180"
              >
                <ArrowLeftRight />
              </button>

            </div>

            {/* TO */}
            <div>

              <label className="text-sm font-medium text-gray-600">
                Destination
              </label>

              <div className="mt-2 flex items-center gap-3 bg-white rounded-2xl border border-gray-200 px-4 py-4">

                <Navigation className="text-blue-500" />

                <input
                  type="text"
                  placeholder="Enter destination"
                  value={to}
                  onChange={(e) => setTo(e.target.value)}
                  className="w-full bg-transparent outline-none"
                />

              </div>

            </div>

            {/* VEHICLES */}
            <div className="mt-8">

              <label className="text-sm font-medium text-gray-600">
                Select Vehicle
              </label>

              <div className="grid grid-cols-2 gap-4 mt-3">

                {vehicles.map((v) => (

                  <div
                    key={v}
                    onClick={() => setVehicle(v)}
                    className={`cursor-pointer rounded-2xl border p-4 transition-all duration-300 ${
                      vehicle === v
                        ? "bg-green-500 text-white border-green-500 shadow-lg scale-105"
                        : "bg-white hover:bg-green-50 border-gray-200"
                    }`}
                  >

                    <Car className="mb-2" />

                    <p className="font-semibold">
                      {v}
                    </p>

                  </div>

                ))}

              </div>

            </div>

            {/* BATTERY */}
            <div className="mt-8">

              <div className="flex justify-between mb-2">

                <label className="text-sm font-medium text-gray-600">
                  Current Battery
                </label>

                <span className="font-bold text-green-600">
                  {battery}%
                </span>

              </div>

              <input
                type="range"
                min="10"
                max="100"
                value={battery}
                onChange={(e) =>
                  setBattery(e.target.value)
                }
                className="w-full accent-green-500"
              />

            </div>

            {/* BUTTON */}
            <button
              onClick={handlePlan}
              className="mt-10 w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] shadow-xl"
            >
              Plan Smart Route ⚡
            </button>

          </motion.div>

          {/* MAP */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >

            <div className="rounded-[32px] overflow-hidden border border-white/40 bg-white shadow-[0_20px_60px_rgba(0,0,0,0.08)]">

              {/* MAP HEADER */}
              <div className="p-6 flex items-center justify-between">

                <div>

                  <h3 className="text-2xl font-black text-gray-900">
                    Live EV Route
                  </h3>

                  <p className="text-gray-500 mt-1">
                    Nearby charging stations & optimized route
                  </p>

                </div>

                <div className="w-14 h-14 rounded-2xl bg-green-100 flex items-center justify-center text-green-600">
                  <Route size={28} />
                </div>

              </div>

              {/* LEAFLET MAP */}
              <div className="h-[550px] w-full">

                <MapContainer
                  center={[17.385, 78.4867]}
                  zoom={7}
                  scrollWheelZoom={true}
                  className="h-full w-full z-0"
                >

                  {/* TILE */}
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />

                  {/* START */}
                  <Marker position={[17.385, 78.4867]}>
                    <Popup>
                      Hyderabad Start Point
                    </Popup>
                  </Marker>

                  {/* CHARGER */}
                  <Marker position={[17.123, 79.208]}>
                    <Popup>
                      Suryapet Fast Charger ⚡
                    </Popup>
                  </Marker>

                  {/* DESTINATION */}
                  <Marker position={[16.5062, 80.648]}>
                    <Popup>
                      Vijayawada Destination
                    </Popup>
                  </Marker>

                  {/* ROUTE LINE */}
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: "#22c55e",
                      weight: 6,
                    }}
                  />

                </MapContainer>

              </div>

            </div>

          </motion.div>

        </div>

        {/* RESULTS */}
        {result && (

          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16 bg-white/80 backdrop-blur-2xl rounded-[32px] p-10 shadow-[0_20px_60px_rgba(0,0,0,0.08)]"
          >

            <h2 className="text-4xl font-black text-gray-900">
              Trip Overview
            </h2>

            {/* STATS */}
            <div className="grid md:grid-cols-4 gap-6 mt-10">

              {[
                {
                  icon: Route,
                  label: "Distance",
                  value: result.distance,
                },

                {
                  icon: Clock3,
                  label: "Duration",
                  value: result.duration,
                },

                {
                  icon: BatteryCharging,
                  label: "Battery Left",
                  value: result.batteryLeft,
                },

                {
                  icon: Zap,
                  label: "Estimated Cost",
                  value: result.estimatedCost,
                },
              ].map((item, index) => {

                const Icon = item.icon;

                return (

                  <div
                    key={index}
                    className="bg-green-50 rounded-3xl p-6 text-center"
                  >

                    <div className="w-16 h-16 rounded-2xl bg-white mx-auto flex items-center justify-center text-green-600 shadow-md">
                      <Icon size={28} />
                    </div>

                    <p className="mt-4 text-gray-500">
                      {item.label}
                    </p>

                    <h3 className="text-3xl font-black text-gray-900 mt-2">
                      {item.value}
                    </h3>

                  </div>

                );

              })}

            </div>

            {/* CHARGING STOPS */}
            <div className="mt-14">

              <h3 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                <Zap className="text-green-500" />
                Charging Stops
              </h3>

              <div className="mt-8 space-y-5">

                {result.chargingStops.map(
                  (stop, index) => (

                    <div
                      key={index}
                      className="flex flex-col md:flex-row md:items-center justify-between bg-green-50 rounded-3xl p-6"
                    >

                      <div>
                        <h4 className="text-xl font-bold text-gray-900">
                          {stop.location}
                        </h4>

                        <p className="text-gray-500 mt-1">
                          Recommended Fast Charging Stop
                        </p>
                      </div>

                      <div className="flex gap-4 mt-4 md:mt-0">

                        <div className="bg-white px-5 py-3 rounded-2xl">
                          ⚡ {stop.charge}
                        </div>

                        <div className="bg-white px-5 py-3 rounded-2xl">
                          🔋 {stop.battery}
                        </div>

                      </div>

                    </div>

                  )
                )}

              </div>

            </div>

          </motion.div>

        )}

      </div>

    </div>

  );

};

export default TripPlanner;