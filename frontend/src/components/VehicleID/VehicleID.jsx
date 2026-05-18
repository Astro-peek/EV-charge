import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useNavigate } from "react-router-dom";
import { Cpu, Zap, QrCode, ArrowRight, ShieldAlert, CheckCircle2 } from "lucide-react";

const VehicleID = () => {
  const navigate = useNavigate();
  const [vehicle, setVehicle] = useState("Tata Nexon EV");
  const [connector, setConnector] = useState("CCS2");
  const [battery, setBattery] = useState("30.2");
  
  // Simulation State
  const [isScanning, setIsScanning] = useState(false);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState("generate"); // generate | simulate

  // QR DATA
  const qrData = JSON.stringify({
    vehicle,
    connector,
    battery: `${battery} kWh`,
    fastCharging: true,
    protocol: "VehicleID v1.2"
  });

  const triggerSimulation = () => {
    setIsScanning(true);
    setScanSuccess(false);
    setTimeout(() => {
      setIsScanning(false);
      setScanSuccess(true);
    }, 2000);
  };

  return (
    <section className="py-20 px-6 md:px-12 bg-slate-950 text-white rounded-[40px] border border-slate-900 shadow-2xl relative overflow-hidden my-8">
      
      {/* Dynamic Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-emerald-500/5 blur-[120px] rounded-full pointer-events-none"></div>

      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* LEFT: Copy & Setup */}
        <motion.div
          initial={{ opacity: 0, x: -40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-bold text-sm">
            <QrCode size={16} />
            VehicleID Protocol v1.2
          </div>

          <h2 className="text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight">
            One Unified Scan.<br />
            <span className="bg-gradient-to-r from-emerald-400 to-green-300 bg-clip-text text-transparent">
              No Manual Setup.
            </span>
          </h2>

          <p className="text-slate-400 text-lg leading-relaxed">
            Eliminate compatibility doubts. Instantly share connector speed limits, battery capacities, and voltage limits automatically with any IntelliRide charger in India.
          </p>

          {/* Interactive Simulation / Generator Switcher */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 w-fit">
            <button
              onClick={() => setActiveTab("generate")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "generate"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Interactive QR Generator
            </button>
            <button
              onClick={() => setActiveTab("simulate")}
              className={`px-6 py-2.5 rounded-xl font-bold text-sm transition-all ${
                activeTab === "simulate"
                  ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              Simulate Charger Handshake
            </button>
          </div>

          {activeTab === "generate" ? (
            <div className="space-y-4 max-w-lg">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Model</label>
                  <input
                    type="text"
                    value={vehicle}
                    onChange={(e) => setVehicle(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Capacity (kWh)</label>
                  <input
                    type="number"
                    value={battery}
                    onChange={(e) => setBattery(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold outline-none focus:border-emerald-500 transition"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Connector</label>
                <select
                  value={connector}
                  onChange={(e) => setConnector(e.target.value)}
                  className="w-full px-4 py-3.5 rounded-xl bg-slate-900 border border-slate-800 text-sm font-semibold outline-none focus:border-emerald-500 transition"
                >
                  <option>CCS2</option>
                  <option>Type 2</option>
                  <option>CHAdeMO</option>
                  <option>5A/15A Socket</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="space-y-4 max-w-lg bg-slate-900/60 p-6 rounded-3xl border border-slate-800">
              <h4 className="font-bold text-lg">Virtual Smart Charger Simulation</h4>
              <p className="text-sm text-slate-400 leading-relaxed">
                Click below to simulate scanning this VehicleID QR code at a public 60kW DC Supercharger to witness auto-negotiation in real-time.
              </p>
              <button
                onClick={triggerSimulation}
                className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-emerald-400 hover:text-white px-5 py-3 rounded-xl transition font-bold text-sm border border-slate-700 w-full justify-center"
              >
                <Cpu size={16} />
                {isScanning ? "Initializing Grid Handshake..." : "Scan & Start Handshake"}
              </button>
            </div>
          )}

          <button
            onClick={() => navigate("/vehicle-id")}
            className="group flex items-center gap-2 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 transition text-slate-950 font-bold px-8 py-4.5 rounded-2xl text-lg shadow-xl shadow-emerald-500/10"
          >
            Register Full VehicleID
            <ArrowRight size={20} className="group-hover:translate-x-1 transition" />
          </button>
        </motion.div>

        {/* RIGHT: Visual Showcase (Card Grid / Simulator) */}
        <motion.div
          initial={{ opacity: 0, x: 40 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative"
        >
          {activeTab === "generate" ? (
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden max-w-md mx-auto">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 blur-xl rounded-full"></div>
              
              <div className="relative z-10 space-y-8">
                
                {/* QR Display */}
                <div className="flex justify-center">
                  <div className="bg-white p-5 rounded-3xl shadow-inner border border-slate-200">
                    <QRCodeSVG
                      value={qrData}
                      size={180}
                      bgColor="#ffffff"
                      fgColor="#020617"
                      level="H"
                      includeMargin={true}
                    />
                  </div>
                </div>

                {/* Details list */}
                <div className="space-y-3 text-sm border-t border-slate-800 pt-6">
                  <div className="flex justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-slate-500">Vehicle</span>
                    <span className="font-bold text-slate-100">{vehicle}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-slate-500">Connector</span>
                    <span className="font-bold text-emerald-400">{connector}</span>
                  </div>

                  <div className="flex justify-between border-b border-slate-800 pb-2.5">
                    <span className="text-slate-500">Battery pack</span>
                    <span className="font-bold text-slate-100">{battery} kWh</span>
                  </div>

                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500">Fast Charging support</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 size={14} /> Active
                    </span>
                  </div>
                </div>

              </div>
            </div>
          ) : (
            <div className="relative bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-[32px] p-8 md:p-10 shadow-2xl overflow-hidden max-w-md mx-auto min-h-[380px] flex flex-col justify-center">
              
              <AnimatePresence mode="wait">
                {isScanning && (
                  <motion.div
                    key="scanning"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="text-center space-y-6"
                  >
                    <div className="w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-xl italic tracking-tight">Reading VehicleID...</h4>
                      <p className="text-xs text-slate-400">Negotiating charging rate constraints with VAHAN grid</p>
                    </div>
                  </motion.div>
                )}

                {scanSuccess && !isScanning && (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    className="space-y-6 text-center"
                  >
                    <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                      <CheckCircle2 size={32} />
                    </div>
                    <div className="space-y-2">
                      <h4 className="font-bold text-2xl text-slate-100">Handshake Successful!</h4>
                      <p className="text-xs text-emerald-400 font-bold uppercase tracking-wider">AUTO-OPTIMIZATION COMPLETE</p>
                    </div>

                    <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-left text-xs space-y-2.5">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Negotiated Rate:</span>
                        <span className="font-bold text-slate-200">60 kW Max Speed</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Target Level:</span>
                        <span className="font-bold text-slate-200">80% SOC Optimized</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Safety Limit:</span>
                        <span className="font-bold text-emerald-400">Temperature Safeguard Enabled</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {!isScanning && !scanSuccess && (
                  <motion.div
                    key="idle"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center space-y-4"
                  >
                    <div className="w-16 h-16 bg-slate-800 rounded-full flex items-center justify-center mx-auto text-slate-400">
                      <Zap size={24} />
                    </div>
                    <h4 className="font-bold text-lg">Simulate Smart Handshake</h4>
                    <p className="text-xs text-slate-500 max-w-[280px] mx-auto">
                      Click the "Scan & Start Handshake" button on the left to see the simulation in action!
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          )}
        </motion.div>

      </div>

    </section>
  );
};

export default VehicleID;