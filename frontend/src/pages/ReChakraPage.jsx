import { useState } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  MapPin,
  IndianRupee,
  Activity,
  Battery,
  Settings,
  Volume2
} from "lucide-react";

const ReChakraPage = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("Bhojpuri");
  
  // Dummy dashboard data
  const income = 850;
  const chargeCost = 120;
  const healthPercent = 88;

  const handleVoiceSearch = () => {
    setIsRecording(true);
    // Simulate recording delay
    setTimeout(() => {
      setIsRecording(false);
      setTranscript("Varanasi ghat ke pass sabse sasta charge kahan ba?");
      // Speak back
      setTimeout(() => {
        alert("Audio Response: Aas pass sabse sasta charge point Dashashwamedh Ghat ke piche 10 rupaye unit hai.");
      }, 1000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffdf5] via-white to-[#f5fff8] pt-16">
      {/* Mobile-first constraints for realistic feel */}
      <div className="max-w-md mx-auto min-h-[calc(100vh-4rem)] bg-white shadow-2xl overflow-hidden relative border-x border-gray-100">
        
        {/* Header */}
        <div className="bg-green-600 text-white p-6 rounded-b-[30px] shadow-lg relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-wide">ReChakra</h1>
              <p className="text-green-100 text-sm mt-1">Bharat ka E-Rickshaw App</p>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-green-700 text-white text-sm rounded-xl px-3 py-2 border-none outline-none font-medium cursor-pointer"
            >
              <option>Bhojpuri</option>
              <option>Hindi</option>
              <option>English</option>
            </select>
          </div>
        </div>

        <div className="p-6 space-y-6 pb-24">
          
          {/* Voice Search Widget */}
          <div className="bg-green-50 rounded-[32px] p-8 text-center border border-green-100 shadow-sm relative overflow-hidden">
            <h2 className="text-gray-800 font-bold text-xl mb-6">
              {language === 'Bhojpuri' ? 'Boliye, kahan charge karna ba?' : 'Boliye, kahan charge karna hai?'}
            </h2>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceSearch}
              className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-xl transition-all ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-tr from-green-500 to-green-400'
              }`}
            >
              <Mic size={48} className="text-white" />
            </motion.button>
            
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white p-4 rounded-2xl shadow-sm text-gray-700 font-medium flex items-center gap-3"
              >
                <Volume2 className="text-green-500 shrink-0" size={20} />
                <span className="text-sm">"{transcript}"</span>
              </motion.div>
            )}
          </div>

          {/* Income Tracker */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h3 className="text-gray-500 font-semibold mb-4 flex items-center gap-2">
              <IndianRupee size={18} /> Aaj ki Kamai vs Kharcha
            </h3>
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-400">Kamai (Income)</p>
                <p className="text-3xl font-black text-green-600">₹{income}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400">Kharcha (Charge)</p>
                <p className="text-2xl font-bold text-red-500">₹{chargeCost}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 h-3 rounded-full mt-4 overflow-hidden flex">
              <div className="bg-green-500 h-full transition-all duration-1000" style={{ width: `${(income/(income+chargeCost))*100}%` }}></div>
              <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${(chargeCost/(income+chargeCost))*100}%` }}></div>
            </div>
          </div>

          {/* Battery Health Monitor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-blue-50 rounded-3xl p-5 border border-blue-100">
              <Battery className="text-blue-500 mb-2" size={24} />
              <p className="text-xs text-gray-500 font-medium">Battery Health</p>
              <p className="text-2xl font-black text-blue-700">{healthPercent}%</p>
              <p className="text-[10px] text-blue-600 mt-1">Status: Achha (Good)</p>
            </div>
            
            <div className="bg-orange-50 rounded-3xl p-5 border border-orange-100">
              <Activity className="text-orange-500 mb-2" size={24} />
              <p className="text-xs text-gray-500 font-medium">Charge Cycles</p>
              <p className="text-2xl font-black text-orange-700">412</p>
              <p className="text-[10px] text-orange-600 mt-1">Est. 800 remaining</p>
            </div>
          </div>

        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 w-full bg-white border-t border-gray-100 p-4 flex justify-around text-gray-400">
          <button className="flex flex-col items-center text-green-600">
            <MapPin size={24} />
            <span className="text-[10px] font-medium mt-1">Map</span>
          </button>
          <button className="flex flex-col items-center hover:text-green-600 transition">
            <IndianRupee size={24} />
            <span className="text-[10px] font-medium mt-1">Khata</span>
          </button>
          <button className="flex flex-col items-center hover:text-green-600 transition">
            <Settings size={24} />
            <span className="text-[10px] font-medium mt-1">Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReChakraPage;