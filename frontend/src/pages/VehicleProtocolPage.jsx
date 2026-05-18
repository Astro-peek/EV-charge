
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Car,
  BatteryCharging,
  Zap,
  QrCode,
  CheckCircle,
  Download,
  RotateCcw,
  Search,
  User,
  Cpu,
  ShieldCheck,
  AlertCircle,
  Sparkles
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { vehicleService } from "../utils/api";
import { useAuth } from "../context/AuthContext";

const VehicleProtocolPage = () => {
  const { user } = useAuth();
  const [vehicleData, setVehicleData] = useState({
    owner: "",
    vehicle: "",
    connector: "CCS2",
    battery: "",
    number: "",
  });

  const [vahanSearch, setVahanSearch] = useState("");
  const [fetchingVahan, setFetchingVahan] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [notification, setNotification] = useState(null);

  // Load from local storage or pre-fill owner name if user is logged in
  useEffect(() => {
    const cached = localStorage.getItem("registeredVehicle");
    if (cached) {
      setVehicleData(JSON.parse(cached));
      setGenerated(true);
    } else if (user) {
      setVehicleData((prev) => ({ ...prev, owner: user.name }));
    }
  }, [user]);

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
      number: vehicleData.number.toUpperCase().replace(/\s/g, ''),
      protocol: "VehicleID v1.2",
      fastCharging: true,
    });
  };

  const handleVahanFetch = async () => {
    if (!vahanSearch) {
      setNotification({ type: "error", message: "Please enter a vehicle registration number" });
      return;
    }
    setFetchingVahan(true);
    setNotification(null);
    try {
      const formattedReg = vahanSearch.toUpperCase().replace(/\s/g, '');
      const res = await vehicleService.getProfile(formattedReg);
      if (res.data) {
        setVehicleData({
          owner: user?.name || "EV Owner",
          vehicle: res.data.model || "Tata Nexon EV",
          connector: res.data.connector_type || "CCS2",
          battery: res.data.battery_capacity || "30.2 kWh",
          number: res.data.reg_number || formattedReg,
        });
        setNotification({
          type: "success",
          message: `Success: Loaded ${res.data.model} profile from VAHAN 4.0 database!`
        });
      }
    } catch (err) {
      setNotification({
        type: "info",
        message: "Not found in VAHAN. You can still input details manually below!"
      });
      setVehicleData((prev) => ({
        ...prev,
        number: vahanSearch.toUpperCase(),
      }));
    } finally {
      setFetchingVahan(false);
    }
  };

  const handleGenerate = async () => {
    if (
      !vehicleData.owner ||
      !vehicleData.vehicle ||
      !vehicleData.battery ||
      !vehicleData.number
    ) {
      setNotification({ type: "error", message: "Please complete all fields first" });
      return;
    }

    setRegistering(true);
    setNotification(null);
    try {
      const formattedReg = vehicleData.number.toUpperCase().replace(/\s/g, '');
      await vehicleService.registerProfile({
        regNumber: formattedReg,
        model: vehicleData.vehicle,
        connectorType: vehicleData.connector,
        batteryCapacity: vehicleData.battery,
        type: "4W",
      });

      localStorage.setItem("registeredVehicle", JSON.stringify(vehicleData));
      setGenerated(true);
      setNotification({ type: "success", message: "VehicleID generated and synced to Cloud!" });
    } catch (err) {
      console.error(err);
      // Offline fallback
      localStorage.setItem("registeredVehicle", JSON.stringify(vehicleData));
      setGenerated(true);
      setNotification({ type: "warning", message: "VehicleID generated offline. (Cloud sync pending)" });
    } finally {
      setRegistering(false);
    }
  };

  const resetForm = () => {
    localStorage.removeItem("registeredVehicle");
    setVehicleData({
      owner: user?.name || "",
      vehicle: "",
      connector: "CCS2",
      battery: "",
      number: "",
    });
    setVahanSearch("");
    setGenerated(false);
    setNotification(null);
  };

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    const svgData = new XMLSerializer().serializeToString(svg);
    const blob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${vehicleData.number.toUpperCase() || "vehicle"}_VehicleID_QR.svg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-slate-900 to-emerald-950 text-white px-4 py-12 md:py-20 relative overflow-hidden">
      
      {/* Dynamic Grid Background Glimmer */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-40"></div>
      
      {/* Radiant Glows */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-emerald-500/10 blur-[150px] rounded-full"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-green-500/10 blur-[150px] rounded-full"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-12 lg:gap-16 items-center relative z-10">

        {/* LEFT SIDE: Pitch & Marketing */}
        <motion.div
          initial={{ opacity: 0, x: -30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 px-4 py-1.5 rounded-full text-sm font-semibold">
            <Sparkles size={16} className="animate-pulse" />
            VehicleID Protocol v1.2
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold leading-tight tracking-tight">
            One Unified QR. <br />
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              Zero Charging Drama.
            </span>
          </h1>

          <p className="text-slate-300 text-lg leading-relaxed max-w-xl">
            Securely register your EV once into the digital grid. Generate a smart universal QR code that automatically configures any charging station across India instantaneosly.
          </p>

          {/* Core Feature Badges */}
          <div className="space-y-4 max-w-xl">
            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-5 rounded-2xl flex gap-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <Cpu size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">VAHAN 4.0 API Autopilot</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Instantly pull your manufacturer-certified Charging Profile directly via VAHAN.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-5 rounded-2xl flex gap-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <BatteryCharging size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Intelligent Station Handshake</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Automatically match compatible connector speeds and optimize charging curves instantly.
                </p>
              </div>
            </div>

            <div className="bg-slate-900/60 border border-slate-800 backdrop-blur-md p-5 rounded-2xl flex gap-4 hover:border-emerald-500/30 transition-all duration-300">
              <div className="bg-emerald-500/10 text-emerald-400 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0">
                <ShieldCheck size={24} />
              </div>
              <div>
                <h3 className="font-bold text-lg text-slate-100">Encrypted Grid Synced</h3>
                <p className="text-slate-400 text-sm mt-1">
                  Access your VehicleID from any browser or device securely linked with Supabase cloud.
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* RIGHT SIDE: Interactive UI registration */}
        <motion.div
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
        >
          <div className="bg-slate-900/50 backdrop-blur-xl rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl relative">
            
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-600 to-green-600 p-6 md:p-8 text-white relative">
              <h2 className="text-2xl md:text-3xl font-black">
                {generated ? "Your Digital Pass" : "EV Grid Registry"}
              </h2>
              <p className="text-emerald-100 text-sm mt-1.5">
                {generated ? "Download or print your universal charging pass." : "Lookup your EV with VAHAN or register custom details."}
              </p>
            </div>

            {/* Notification Bar */}
            <AnimatePresence>
              {notification && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className={`px-6 py-3 text-sm font-medium flex items-center gap-2 border-b ${
                    notification.type === "success" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" :
                    notification.type === "error" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                    notification.type === "warning" ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" :
                    "bg-blue-500/10 text-blue-400 border-blue-500/20"
                  }`}
                >
                  {notification.type === "error" ? <AlertCircle size={16} /> : <CheckCircle size={16} />}
                  <span className="flex-1">{notification.message}</span>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="p-6 md:p-8 space-y-6">
              {!generated ? (
                <>
                  {/* Step 1: VAHAN 4.0 Database lookup */}
                  <div className="space-y-2">
                    <label className="text-xs uppercase tracking-wider font-bold text-slate-400 block">
                      Fast Lookup (VAHAN API Registry)
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input
                          type="text"
                          placeholder="e.g. MH12AB1234, DL3CDE5678..."
                          value={vahanSearch}
                          onChange={(e) => setVahanSearch(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 rounded-xl bg-slate-950/80 border border-slate-800 outline-none focus:border-emerald-500 text-slate-100 transition-all font-semibold tracking-wide uppercase placeholder:lowercase"
                        />
                      </div>
                      <button
                        type="button"
                        onClick={handleVahanFetch}
                        disabled={fetchingVahan}
                        className="bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white px-5 rounded-xl transition-all font-bold text-sm border border-slate-700 disabled:opacity-50"
                      >
                        {fetchingVahan ? "Loading..." : "Search"}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-500 block">
                      Try MH12AB1234, DL3CDE5678, or KA01EF9012 for mock hits
                    </span>
                  </div>

                  <div className="h-px bg-slate-800 my-2"></div>

                  {/* Step 2: Custom details profile */}
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Owner Name
                        </label>
                        <div className="relative">
                          <User size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            name="owner"
                            placeholder="Full Name"
                            value={vehicleData.owner}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 outline-none focus:border-emerald-500 text-slate-100 transition-all text-sm font-semibold"
                          />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Vehicle Model
                        </label>
                        <div className="relative">
                          <Car size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
                          <input
                            type="text"
                            name="vehicle"
                            placeholder="e.g. Tata Nexon EV"
                            value={vehicleData.vehicle}
                            onChange={handleChange}
                            className="w-full pl-11 pr-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 outline-none focus:border-emerald-500 text-slate-100 transition-all text-sm font-semibold"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Registration Number
                        </label>
                        <input
                          type="text"
                          name="number"
                          placeholder="MH12AB1234"
                          value={vehicleData.number}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 outline-none focus:border-emerald-500 text-slate-100 transition-all text-sm font-bold uppercase"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                          Battery Capacity
                        </label>
                        <input
                          type="text"
                          name="battery"
                          placeholder="e.g. 40 kWh"
                          value={vehicleData.battery}
                          onChange={handleChange}
                          className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 outline-none focus:border-emerald-500 text-slate-100 transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] uppercase tracking-wider font-bold text-slate-400">
                        Connector Type
                      </label>
                      <select
                        name="connector"
                        value={vehicleData.connector}
                        onChange={handleChange}
                        className="w-full px-4 py-3.5 rounded-xl bg-slate-950/80 border border-slate-800 outline-none focus:border-emerald-500 text-slate-100 transition-all text-sm font-semibold"
                      >
                        <option>CCS2</option>
                        <option>Type 2</option>
                        <option>CHAdeMO</option>
                        <option>5A/15A Socket</option>
                      </select>
                    </div>

                    <button
                      onClick={handleGenerate}
                      disabled={registering}
                      className="w-full bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition text-white font-bold py-4 rounded-xl text-lg shadow-lg shadow-emerald-500/20 disabled:opacity-50 mt-2"
                    >
                      {registering ? "Registering on EV Grid..." : "Register EV & Generate VehicleID"}
                    </button>
                  </div>
                </>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-6"
                >
                  {/* Digital Dashcard Showcase */}
                  <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-emerald-500/30 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 blur-xl rounded-full"></div>
                    
                    {/* Brand Card header */}
                    <div className="flex justify-between items-start border-b border-slate-800 pb-4 mb-6">
                      <div>
                        <h4 className="text-xs uppercase tracking-widest font-black text-emerald-400">
                          IntelliRide
                        </h4>
                        <p className="text-[10px] text-slate-500 font-bold uppercase">
                          GRID PROTOCOL PASS
                        </p>
                      </div>
                      <div className="bg-emerald-500/10 px-2.5 py-1 rounded-full text-[10px] font-black text-emerald-400 border border-emerald-500/20">
                        ACTIVE
                      </div>
                    </div>

                    {/* QR and Metadata side-by-side */}
                    <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                      <div className="bg-white p-4 rounded-2xl shadow-inner border border-slate-200">
                        <QRCodeSVG
                          id="qr-code-svg"
                          value={generateQRData()}
                          size={160}
                          bgColor="#ffffff"
                          fgColor="#020617"
                          level="H"
                          includeMargin={true}
                        />
                      </div>

                      <div className="flex-1 w-full space-y-3.5 text-sm">
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-500 text-xs">Owner</span>
                          <span className="font-bold text-slate-100">{vehicleData.owner}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-500 text-xs">Vehicle Plate</span>
                          <span className="font-bold text-slate-100 uppercase tracking-wider">{vehicleData.number}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-500 text-xs">Connector</span>
                          <span className="font-bold text-emerald-400">{vehicleData.connector}</span>
                        </div>
                        <div className="flex justify-between border-b border-slate-800/80 pb-2">
                          <span className="text-slate-500 text-xs">Battery Pack</span>
                          <span className="font-bold text-slate-100">{vehicleData.battery}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500">Fast Charging</span>
                          <span className="font-bold text-emerald-400 flex items-center gap-1">
                            <CheckCircle size={14} /> Supported
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions Buttons */}
                  <div className="grid grid-cols-2 gap-4">
                    <button
                      onClick={downloadQR}
                      className="flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-600 text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/10"
                    >
                      <Download size={18} /> Download SVG
                    </button>
                    <button
                      onClick={resetForm}
                      className="flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-300 py-3.5 rounded-xl font-bold transition-all border border-slate-700"
                    >
                      <RotateCcw size={18} /> Reset Card
                    </button>
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

