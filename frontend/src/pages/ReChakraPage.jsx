import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  Mic,
  IndianRupee,
  Activity,
  Battery,
  Settings,
  Volume2,
  Plus,
  Users,
  MessageSquare,
  CreditCard
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { rechakraService } from "../utils/api";

const ReChakraPage = () => {
  const { user } = useAuth();
  const driverId = user?.uid || "a2d1d2b8-93c5-4306-bf25-3b98c9dbf7c4"; // mock UUID fallback
  const vehicleId = user?.uid || "a2d1d2b8-93c5-4306-bf25-3b98c9dbf7c4"; // mock UUID fallback

  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [language, setLanguage] = useState("Bhojpuri");
  
  const [dashboardData, setDashboardData] = useState({ totalIncome: 0, totalExpense: 0, ratio: 0 });
  const [batteryData, setBatteryData] = useState({ healthPercent: 100, chargeCycles: 0, status: 'Loading...' });
  const [isAddingIncome, setIsAddingIncome] = useState(false);
  const [incomeAmount, setIncomeAmount] = useState("");

  const fetchDashboardData = useCallback(async () => {
    try {
      const res = await rechakraService.getDashboard(driverId);
      if (res.data) {
        setDashboardData({
          totalIncome: res.data.totalIncome || 0,
          totalExpense: res.data.totalExpense || 0,
          ratio: res.data.ratio || 0
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    }
  }, [driverId]);

  const fetchBatteryData = useCallback(async () => {
    try {
      const res = await rechakraService.getBatteryCycle(vehicleId);
      if (res.data && res.data.health) {
        setBatteryData({
          healthPercent: Math.max(0, 100 - (res.data.health.degradation_percent || 0)),
          chargeCycles: res.data.health.charge_cycles || 0,
          status: res.data.status || 'HEALTHY'
        });
      }
    } catch (error) {
      console.error("Error fetching battery data:", error);
    }
  }, [vehicleId]);

  useEffect(() => {
    fetchDashboardData();
    fetchBatteryData();
  }, [fetchDashboardData, fetchBatteryData]);

  const handleVoiceSearch = async () => {
    setIsRecording(true);
    setTranscript(
      language === 'Bhojpuri' ? "Sun rahe hain..." : 
      language === 'Maithili' ? "Sunait chhi..." : 
      language === 'Awadhi' ? "Sunat hai..." : "Sun rahe hai..."
    );
    
    try {
      // API call to the voice search endpoint
      const res = await rechakraService.voiceSearch({ 
        audioUrl: "mock_audio.mp3", 
        textFallback: "Find cheapest charging point near Dashashwamedh Ghat",
        location: "Varanasi",
        language: language
      });
      
      setIsRecording(false);
      
      if (res.data && res.data.translatedText) {
        setTranscript(res.data.translatedText);
        // Play audio or just alert for now
        setTimeout(() => {
          alert(`Audio Response: ${res.data.translatedText}`);
        }, 500);
      }
    } catch (error) {
      setIsRecording(false);
      setTranscript("Maaf karien, connection error.");
      console.error("Voice search error:", error);
    }
  };

  const handleAddIncome = async () => {
    if (!incomeAmount || isNaN(incomeAmount)) return;
    
    try {
      await rechakraService.logIncome({
        driver_id: driverId,
        amount: parseFloat(incomeAmount)
      });
      setIncomeAmount("");
      setIsAddingIncome(false);
      fetchDashboardData();
    } catch (error) {
      console.error("Error adding income:", error);
      alert("Error saving income.");
    }
  };

  const { totalIncome, totalExpense } = dashboardData;
  const incomeWidth = (totalIncome + totalExpense) > 0 ? (totalIncome / (totalIncome + totalExpense)) * 100 : 50;
  const expenseWidth = (totalIncome + totalExpense) > 0 ? (totalExpense / (totalIncome + totalExpense)) * 100 : 50;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#fffdf5] via-white to-[#f5fff8] pt-16 font-sans pb-20">
      <div className="max-w-md mx-auto min-h-[calc(100vh-4rem)] bg-white shadow-2xl overflow-hidden relative border-x border-gray-100">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-green-500 text-white p-6 rounded-b-[30px] shadow-lg relative z-10">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black tracking-wide drop-shadow-md">ReChakra</h1>
              <p className="text-green-100 text-sm mt-1 font-medium">Bharat ka E-Rickshaw App</p>
              <div className="flex items-center gap-1 text-[10px] font-bold text-green-50 mt-2 bg-green-700/40 w-fit px-2 py-1 rounded-full border border-green-500/50">
                <Users size={12}/> Shared Vehicle Profile
              </div>
            </div>
            <select 
              value={language} 
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-white/20 backdrop-blur-md text-white text-sm rounded-xl px-3 py-2 border border-white/30 outline-none font-medium cursor-pointer appearance-none shadow-inner"
            >
              <option className="text-gray-800">Bhojpuri</option>
              <option className="text-gray-800">Maithili</option>
              <option className="text-gray-800">Awadhi</option>
              <option className="text-gray-800">Hindi</option>
            </select>
          </div>
        </div>

        <div className="p-6 space-y-6 pb-24 overflow-y-auto h-full">
          
          {/* Voice Search Widget */}
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-[32px] p-8 text-center border border-green-100 shadow-[0_8px_30px_rgb(0,0,0,0.06)] relative overflow-hidden">
            <h2 className="text-gray-800 font-bold text-xl mb-6">
              {language === 'Bhojpuri' ? 'Boliye, kahan charge karna ba?' : 
               language === 'Maithili' ? 'Bajhu, kahan charge karab?' :
               language === 'Awadhi' ? 'Batao, kahan charge kare ka hai?' :
               'Boliye, kahan charge karna hai?'}
            </h2>
            
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={handleVoiceSearch}
              className={`w-28 h-28 rounded-full flex items-center justify-center mx-auto shadow-2xl transition-all relative ${
                isRecording ? 'bg-red-500 animate-pulse' : 'bg-gradient-to-tr from-green-500 to-green-400 hover:from-green-600 hover:to-green-500 hover:shadow-green-500/50'
              }`}
            >
              <Mic size={48} className="text-white drop-shadow-lg" />
              {!isRecording && (
                <span className="absolute inset-0 rounded-full animate-ping bg-green-400 opacity-20"></span>
              )}
            </motion.button>
            
            {transcript && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 bg-white/80 backdrop-blur p-4 rounded-2xl shadow-sm text-gray-700 font-medium flex items-center gap-3 border border-green-50"
              >
                <Volume2 className="text-green-500 shrink-0" size={20} />
                <span className="text-sm italic">"{transcript}"</span>
              </motion.div>
            )}

            <button className="mt-6 text-[11px] font-bold text-green-700 flex items-center justify-center gap-1.5 mx-auto bg-green-100/80 px-4 py-2 rounded-full hover:bg-green-200 transition border border-green-200 shadow-sm">
              <MessageSquare size={14} /> Low Data? SMS Fallback Lookup
            </button>
          </div>

          {/* Income Tracker */}
          <div className="bg-white rounded-3xl p-6 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-gray-600 font-bold flex items-center gap-2">
                <IndianRupee size={20} className="text-green-600"/> Kamai vs Kharcha
              </h3>
              <div className="flex gap-2">
                <button className="bg-blue-50 text-blue-600 px-3 py-1.5 rounded-full hover:bg-blue-100 transition flex items-center gap-1.5 text-xs font-bold shadow-sm border border-blue-100" title="Jan Dhan UPI Transfer">
                  <CreditCard size={14}/> Jan Dhan UPI
                </button>
                <button 
                  onClick={() => setIsAddingIncome(!isAddingIncome)}
                  className="bg-green-100 text-green-700 p-1.5 rounded-full hover:bg-green-200 transition shadow-sm border border-green-200"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>

            {isAddingIncome && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                className="mb-4 flex gap-2"
              >
                <input 
                  type="number" 
                  value={incomeAmount}
                  onChange={(e) => setIncomeAmount(e.target.value)}
                  placeholder="Aaj ki kamai (₹)" 
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-sm outline-none focus:border-green-500"
                />
                <button 
                  onClick={handleAddIncome}
                  className="bg-green-600 text-white px-4 rounded-xl text-sm font-semibold hover:bg-green-700 shadow-md"
                >
                  Save
                </button>
              </motion.div>
            )}
            
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-400 font-medium">Kamai (Income)</p>
                <p className="text-3xl font-black text-green-600">₹{totalIncome.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 font-medium">Kharcha (Charge)</p>
                <p className="text-2xl font-bold text-red-500">₹{totalExpense.toFixed(0)}</p>
              </div>
            </div>
            
            <div className="w-full bg-gray-100 h-4 rounded-full mt-5 overflow-hidden flex shadow-inner">
              <div className="bg-gradient-to-r from-green-400 to-green-500 h-full transition-all duration-1000" style={{ width: `${incomeWidth}%` }}></div>
              <div className="bg-gradient-to-r from-red-400 to-red-500 h-full transition-all duration-1000" style={{ width: `${expenseWidth}%` }}></div>
            </div>
          </div>

          {/* Battery Health Monitor */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100/50 rounded-3xl p-5 border border-blue-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Battery size={80} />
              </div>
              <Battery className="text-blue-500 mb-2" size={28} />
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Battery Health</p>
              <p className="text-3xl font-black text-blue-700 mt-1">{batteryData.healthPercent.toFixed(1)}%</p>
              <p className={`text-[11px] mt-2 font-bold ${batteryData.healthPercent > 80 ? 'text-blue-600' : 'text-red-500'}`}>
                {language !== 'Hindi' ? 'Haisiyat: Badhiya (Saving ₹50k)' : 'Status: ' + batteryData.status}
              </p>
            </div>
            
            <div className="bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-3xl p-5 border border-orange-100 shadow-sm relative overflow-hidden">
              <div className="absolute -right-4 -top-4 opacity-10">
                <Activity size={80} />
              </div>
              <Activity className="text-orange-500 mb-2" size={28} />
              <p className="text-xs text-gray-600 font-semibold uppercase tracking-wider">Charge Cycles</p>
              <p className="text-3xl font-black text-orange-700 mt-1">{batteryData.chargeCycles}</p>
              <p className="text-[11px] text-orange-600 mt-2 font-bold">Est. {Math.max(0, 800 - batteryData.chargeCycles)} remaining</p>
            </div>
          </div>

          <div className="text-center text-[10px] text-gray-400 font-medium">
            Fleet Plan: Active (₹29/mo) • Fleet Owner: Ramesh Auto Sangh
          </div>

        </div>

        {/* Bottom Nav */}
        <div className="absolute bottom-0 w-full bg-white/90 backdrop-blur-lg border-t border-gray-100 p-4 flex justify-around text-gray-400 shadow-[0_-5px_20px_rgb(0,0,0,0.03)] z-20">
          <button className="flex flex-col items-center text-green-600 group">
            <div className="p-2 rounded-xl group-hover:bg-green-50 transition-colors">
              <Mic size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold mt-1">ReChakra</span>
          </button>
          <button className="flex flex-col items-center hover:text-green-600 transition group">
            <div className="p-2 rounded-xl group-hover:bg-green-50 transition-colors">
              <IndianRupee size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold mt-1">Khata</span>
          </button>
          <button className="flex flex-col items-center hover:text-green-600 transition group">
            <div className="p-2 rounded-xl group-hover:bg-green-50 transition-colors">
              <Settings size={24} className="group-hover:scale-110 transition-transform" />
            </div>
            <span className="text-[10px] font-bold mt-1">Settings</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default ReChakraPage;