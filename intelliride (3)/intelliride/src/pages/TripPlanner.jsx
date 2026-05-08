import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowLeftRight,
  Car,
  Zap,
  BatteryCharging,
  Clock3,
  Route as RouteIcon,
  Navigation,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./TripPlanner.css";
import api, { tripService } from "../utils/api";

// Map Recenter Component
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
};

const TripPlanner = () => {
  const location = useLocation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [vehicle, setVehicle] = useState("Nexon EV");
  const [battery, setBattery] = useState(80);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [rerouteAlert, setRerouteAlert] = useState(null);
  const [endCoords, setEndCoords] = useState(null);

  // Custom User Marker Icon (Pulsing)
  const userIcon = L.divIcon({
    className: "user-marker-icon",
    html: '<div class="user-marker-pulse"></div>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });

  // Custom Station Icon (Premium Design)
  const stationIcon = L.divIcon({
    className: "custom-station-icon",
    html: `
      <div class="station-marker-outer">
        <div class="station-marker-inner">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 7V5a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2"></path>
            <line x1="10" y1="9" x2="10" y2="15"></line>
            <polyline points="14 12 10 12"></polyline>
            <path d="M22 11h-4"></path>
            <path d="M22 15h-4"></path>
          </svg>
        </div>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });

  useEffect(() => {
    // 1. Get User Location
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const coords = [pos.coords.latitude, pos.coords.longitude];
          setUserLocation(coords);
          setFrom("My Current Location");
        },
        (err) => console.warn("Geolocation denied", err)
      );
    }

    if (location.state) {
      setFrom(location.state.from || "");
      setTo(location.state.to || "");
    }
  }, [location]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handlePlan = async () => {
    if (!from || !to) return alert("Please enter both locations");
    setLoading(true);
    try {
      const cityCoords = {
        "delhi": [28.6139, 77.2090],
        "mumbai": [19.0760, 72.8777],
        "bangalore": [12.9716, 77.5946],
        "hyderabad": [17.3850, 78.4867],
        "chennai": [13.0827, 80.2707],
        "agra": [27.1767, 78.0081],
        "jaipur": [26.9124, 75.7873],
        "bhopal": [23.2599, 77.4126],
        "indore": [22.7196, 75.8577],
        "pune": [18.5204, 73.8567],
        "nagpur": [21.1458, 79.0882],
      };

      let start = userLocation;
      if (!start || (from && from.toLowerCase() !== "my current location")) {
        const startCity = cityCoords[from.toLowerCase()];
        if (startCity) {
          start = startCity;
        } else {
          try {
            const resStart = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${from}`);
            const dataStart = await resStart.json();
            if (dataStart && dataStart.length > 0) {
              start = [parseFloat(dataStart[0].lat), parseFloat(dataStart[0].lon)];
            } else {
              start = cityCoords["delhi"];
            }
          } catch (e) {
            start = cityCoords["delhi"];
          }
        }
      }
      
      let end = cityCoords["mumbai"];
      const endCity = cityCoords[to.toLowerCase()];
      if (endCity) {
        end = endCity;
      } else {
        try {
          const resEnd = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${to}`);
          const dataEnd = await resEnd.json();
          if (dataEnd && dataEnd.length > 0) {
            end = [parseFloat(dataEnd[0].lat), parseFloat(dataEnd[0].lon)];
          }
        } catch (e) {
          end = cityCoords["mumbai"];
        }
      }

      // 2. Fetch Plan from Backend
      const res = await api.post("/trips/plan", {
        startLat: start[0],
        startLng: start[1],
        endLat: end[0],
        endLng: end[1],
        vehicleRangeKm: 350,
        currentChargePct: parseInt(battery)
      });

      setResult(res.data);
      setEndCoords(end);
      
      // 3. Fetch Road-accurate coordinates from OSRM
      const points = [start, ...res.data.chargingStops.filter(s => s.lat).map(s => [s.lat, s.lng]), end];
      const waypoints = points.map(p => `${p[1]},${p[0]}`).join(';');
      const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
      const osrmData = await osrmRes.json();
      
      if (osrmData.routes && osrmData.routes[0]) {
        const roadCoords = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRouteCoordinates(roadCoords);
      } else {
        setRouteCoordinates(points);
      }

      // 4. Start polling stations for offline detection (Dynamic Rerouting)
      const pollInterval = setInterval(async () => {
        if (!res.data.chargingStops || res.data.chargingStops.length === 0) { clearInterval(pollInterval); return; }
        try {
          for (const stop of res.data.chargingStops) {
            if (!stop.id) continue;
            const statusRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stations/${stop.id}`);
            const stationData = await statusRes.json();
            if (stationData.status === "offline") {
              clearInterval(pollInterval);
              setRerouteAlert(`⚠️ "${stop.name}" went offline. Rerouting...`);
              setTimeout(() => setRerouteAlert(null), 5000);
              // Trigger reroute from start
              const rerouteRes = await tripService.reroute({
                currentLat: start[0], currentLng: start[1],
                endLat: end[0], endLng: end[1],
                excludeStationId: stop.id, vehicleRangeKm: 350
              });
              setResult(rerouteRes.data);
              break;
            }
          }
        } catch (e) { /* silent fail on poll */ }
      }, 60000);

    } catch (err) {
      console.error("Trip planning failed:", err);
      alert("Planning failed. Try cities like Bhopal, Indore, Delhi, or Mumbai.");
    } finally {
      setLoading(false);
    }
  };

  const vehicles = [
    { name: "Nexon EV", range: "312km" },
    { name: "MG ZS EV", range: "461km" },
    { name: "BYD Atto 3", range: "521km" },
    { name: "Tiago EV", range: "250km" },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-20 overflow-x-hidden">
      {/* REROUTE ALERT TOAST */}
      <AnimatePresence>
        {rerouteAlert && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-amber-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <AlertCircle size={20} />
            {rerouteAlert}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
              CHRG<span className="text-green-500">PLANNER</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Smart highway navigation for electric vehicles</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
              <ShieldCheck className="text-green-500" size={18} />
              <span className="text-sm font-bold text-slate-700">Safe Route Enabled</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INPUT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">Trip Details</h2>
              
              <div className="space-y-4 relative">
                {/* START */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Starting point"
                    className="w-full pl-16 pr-4 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                  <button 
                    onClick={handleSwap}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-green-500 hover:rotate-180 transition-all shadow-md"
                  >
                    <ArrowLeftRight size={18} />
                  </button>
                </div>

                {/* END */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <Navigation size={18} />
                  </div>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Destination"
                    className="w-full pl-16 pr-4 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* VEHICLE SELECTOR */}
              <div className="mt-8">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Vehicle</p>
                <div className="grid grid-cols-2 gap-3">
                  {vehicles.map((v) => (
                    <button
                      key={v.name}
                      onClick={() => setVehicle(v.name)}
                      className={`p-4 rounded-2xl border-2 text-left transition-all ${
                        vehicle === v.name 
                          ? "border-green-500 bg-green-50" 
                          : "border-slate-50 bg-slate-50 hover:border-slate-200"
                      }`}
                    >
                      <Car size={20} className={vehicle === v.name ? "text-green-600" : "text-slate-400"} />
                      <p className={`mt-2 font-black ${vehicle === v.name ? "text-slate-900" : "text-slate-600"}`}>{v.name}</p>
                      <p className="text-[10px] text-slate-400 font-bold">{v.range}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* BATTERY SLIDER */}
              <div className="mt-8">
                <div className="flex justify-between items-end mb-4">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initial Battery</p>
                  <span className="text-2xl font-black text-green-600">{battery}%</span>
                </div>
                <div className="relative h-6 flex items-center">
                   <div className="absolute w-full h-2 bg-slate-100 rounded-full"></div>
                   <div className="absolute h-2 bg-green-500 rounded-full" style={{ width: `${battery}%` }}></div>
                   <input
                     type="range"
                     min="10" max="100"
                     value={battery}
                     onChange={(e) => setBattery(e.target.value)}
                     className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 accent-green-600"
                   />
                </div>
              </div>

              <button
                onClick={handlePlan}
                disabled={loading}
                className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Calculate Route <ChevronRight size={20} /></>
                )}
              </button>
            </motion.div>
          </div>

          {/* RIGHT: MAP & RESULTS */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 relative h-[600px]"
            >
              <div className="absolute top-6 left-6 z-[1000] flex gap-2">
                <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-xs font-black text-slate-900 uppercase">Live Map</span>
                </div>
              </div>

              <MapContainer
                center={userLocation || [20.5937, 78.9629]}
                zoom={userLocation ? 12 : 5}
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapRecenter center={routeCoordinates.length > 0 ? routeCoordinates[0] : userLocation} />

                {/* USER LOCATION */}
                {userLocation && (
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup className="custom-popup">
                      <p className="font-black">You are here</p>
                    </Popup>
                  </Marker>
                )}

                {/* START POINT (If not my location) */}
                {routeCoordinates.length > 0 && from.toLowerCase() !== "my current location" && (
                  <Marker position={routeCoordinates[0]}>
                    <Popup><p className="font-black">Start: {from}</p></Popup>
                  </Marker>
                )}

                {/* CHARGING STOPS */}
                {result?.chargingStops?.map((stop, i) => (
                  stop.lat && (
                    <Marker key={i} position={[stop.lat, stop.lng]} icon={stationIcon}>
                      <Popup className="custom-popup">
                        <div className="p-1 min-w-[180px]">
                          <div className="flex items-center gap-2 mb-2">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                              <Zap size={16} />
                            </div>
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{stop.name}</h4>
                          </div>
                          
                          <div className="space-y-2 border-t border-slate-100 pt-2">
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Power</span>
                              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-md">{stop.power || "30kW"}</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Price</span>
                              <span className="text-[10px] font-black text-slate-700">₹{stop.price_per_unit || "15"}/unit</span>
                            </div>
                            <div className="flex justify-between items-center">
                              <span className="text-[10px] font-bold text-slate-400 uppercase">Type</span>
                              <span className="text-[10px] font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{stop.type || "CCS2"}</span>
                            </div>
                          </div>
                          
                          <p className="text-[9px] text-slate-400 mt-3 italic line-clamp-1">{stop.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                ))}

                {/* DESTINATION */}
                {routeCoordinates.length > 1 && (
                  <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                    <Popup><p className="font-black">Destination: {to}</p></Popup>
                  </Marker>
                )}

                {/* ROUTE POLYLINE */}
                {routeCoordinates.length > 1 && (
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: "#22c55e",
                      weight: 8,
                      opacity: 0.8,
                      lineJoin: 'round'
                    }}
                  />
                )}
              </MapContainer>
            </motion.div>

            {/* RESULTS SECTION */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black">Trip Overview</h3>
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/30">
                      Optimized Route
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: RouteIcon, label: "Total Distance", value: `${result.totalDistance} km` },
                      { icon: BatteryCharging, label: "Charge Needed", value: `${result.stopsNeeded} Stops` },
                      { icon: Clock3, label: "Est. Duration", value: `${(result.totalDistance / 60).toFixed(1)} hrs` },
                      { icon: Zap, label: "Battery Buffer", value: "20%" },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <stat.icon className="text-green-500 mb-3" size={24} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {result.chargingStops.length > 0 ? (
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Charging Schedule</h4>
                      <div className="space-y-4">
                        {result.chargingStops.map((stop, i) => (
                          <div key={i} className="flex items-center gap-4 bg-white/5 p-4 rounded-2xl">
                            <div className="w-10 h-10 rounded-xl bg-green-500 flex items-center justify-center text-slate-900">
                              <Zap size={20} />
                            </div>
                            <div className="flex-1">
                              <p className="font-black">{stop.name || stop.location}</p>
                              <p className="text-xs text-slate-400">Available station along route</p>
                            </div>
                            <div className="text-right">
                              <p className="text-xs font-bold text-green-500 uppercase">Stop {i + 1}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3 text-green-400 bg-green-400/10 p-4 rounded-2xl">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold">Direct route possible! No charging stops required.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;