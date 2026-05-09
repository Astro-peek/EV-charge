import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { stationService } from "../utils/api";
import {
  ClipboardList,
  PlugZap,
  IndianRupee,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  Calculator,
  MessageCircle,
  FileCheck
} from "lucide-react";

const BecomeHost = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    address: "",
    type: "Dhaba",
    power: "Single Phase (3.3 kW)",
    contact: "",
    aadhaar: ""
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login first to become a host!");
      navigate('/login');
      return;
    }
    
    setIsLoading(true);
    try {
      await stationService.createStation({
        name: `${formData.name} (${formData.type})`,
        address: formData.address,
        type: "AC", // Postgres constraint expects AC, DC, or Both
        power: formData.power,
        status: "available",
        price_per_unit: 14.0,
        connector_types: ["15A Socket", "16A Socket"],
        host_id: user.uid
      });
      setIsSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Failed to register space. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  const steps = [
    {
      icon: ClipboardList,
      title: "Register",
      description:
        "Sign up and list your location with available power capacity.",
    },
    {
      icon: PlugZap,
      title: "Set Up",
      description:
        "We guide you on setting up a charger. Basic or fast — your choice.",
    },
    {
      icon: IndianRupee,
      title: "Earn",
      description:
        "Drivers find you, charge up, and you earn per session.",
    },
  ];

  if (isSubmitted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f8f7f4] py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-white to-emerald-100/50" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-400/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-emerald-300/20 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center max-w-lg mx-auto bg-white/60 backdrop-blur-2xl border border-white/50 p-10 rounded-[40px] shadow-[0_25px_80px_rgba(0,0,0,0.08)]"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-[#1e140f] mb-4">Place Registered Successfully!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for joining the ChargeAnna network. Your space application has been received and is under review. You'll be notified once it's live!
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-500 hover:bg-green-600 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl hover:-translate-y-1"
          >
            Go Back to Main Page
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <div className="bg-[#f8f7f4] min-h-screen">
      {/* HERO */}
      <section className="relative h-[500px] overflow-hidden">

        <img
          src="images/ev.jpg"
          alt="ChargeAnna"
          className="absolute inset-0 w-full h-full object-cover"
        />

        <div className="absolute inset-0 bg-black/60" />

        <div className="relative z-10 max-w-6xl mx-auto h-full flex items-center">

          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7 }}
            className="max-w-2xl"
          >

            <h1 className="text-5xl md:text-7xl font-black text-white leading-none">
              Turn Any Space Into a
              <br />
              Charging Station
            </h1>

            <p className="mt-8 text-xl text-gray-200 leading-relaxed max-w-xl">
              Your dhaba, home, or roadside shop can earn you money while
              helping EV drivers on their journey. Like Airbnb, but for
              chargers.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mt-8">
              <button 
                onClick={() => document.getElementById('register-form').scrollIntoView({ behavior: 'smooth' })}
                className="bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl"
              >
                List My Space
              </button>
              
              <button 
                onClick={() => window.open('https://wa.me/919876543210?text=Hello%20ChargeAnna%2C%20I%20want%20to%20register%20my%20space%20(Dhaba%2FHome%2FShop)%20as%20a%20charging%20station.%20Please%20help%20me%20onboard!', '_blank')}
                className="bg-[#25D366] hover:bg-[#1ebd5a] text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl flex items-center justify-center gap-2"
              >
                <MessageCircle size={24} />
                Register via WhatsApp
              </button>
            </div>

          </motion.div>

        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="py-24 px-6">

        <div className="max-w-6xl mx-auto">

          <h2 className="text-center text-5xl font-black text-[#1e140f]">
            How It Works
          </h2>

          <div className="mt-20 grid md:grid-cols-3 gap-10">

            {steps.map((step, index) => {
              const Icon = step.icon;

              return (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.15 }}
                  className="bg-white rounded-[24px] p-10 shadow-lg border border-[#ece8df] text-center"
                >

                  <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto text-green-600">
                    <Icon size={34} />
                  </div>

                  <h3 className="mt-8 text-3xl font-bold text-[#1e140f]">
                    {step.title}
                  </h3>

                  <p className="mt-5 text-gray-600 text-lg leading-relaxed">
                    {step.description}
                  </p>

                </motion.div>
              );
            })}

          </div>

        </div>

      </section>

      {/* FORM */}
      <section id="register-form" className="pb-28 px-6">

        <div className="max-w-3xl mx-auto">
          
          {/* PROFIT MARGIN EDUCATION BANNER */}
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-3xl p-6 mb-10 shadow-sm flex items-start gap-4">
            <div className="bg-white p-3 rounded-full shadow-sm text-green-600 shrink-0">
              <Calculator size={28} />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">Do the Math. Keep the Profit.</h3>
              <p className="text-gray-600 mt-2 leading-relaxed">
                Electricity costs you roughly <strong className="text-gray-900">₹7/unit</strong>. 
                Charge EV drivers <strong className="text-green-600">₹14/unit</strong> using our smart plug. 
                You earn a pure <strong className="text-gray-900 border-b border-green-300">2x margin (₹7 profit per unit)</strong> straight to your UPI. 
                No middleman fees.
              </p>
            </div>
          </div>

          <div className="bg-white rounded-[28px] shadow-xl border border-[#ece8df] p-10 md:p-14">

            <h2 className="text-4xl font-black text-[#1e140f]">
              Register Your Space
            </h2>

            <form className="mt-10 space-y-6" onSubmit={handleSubmit}>

            {/* Location Name */}
            <div>
              <label className="block text-lg font-medium text-[#1e140f] mb-3">
                Location Name
              </label>

              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Sharma's Dhaba"
                className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Address */}
            <div>
              <label className="block text-lg font-medium text-[#1e140f] mb-3">
                Address
              </label>

              <input
                type="text"
                required
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
                placeholder="Full address"
                className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Selects */}
            <div className="grid md:grid-cols-2 gap-5">

              <div>
                <label className="block text-lg font-medium text-[#1e140f] mb-3">
                  Space Type
                </label>

                <select 
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Dhaba</option>
                  <option>Home</option>
                  <option>Shop</option>
                  <option>Parking Space</option>
                </select>
              </div>

              <div>
                <label className="block text-lg font-medium text-[#1e140f] mb-3">
                  Power Available
                </label>

                <select 
                  value={formData.power}
                  onChange={(e) => setFormData({...formData, power: e.target.value})}
                  className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option>Single Phase (3.3 kW)</option>
                  <option>7.2 kW</option>
                  <option>11 kW</option>
                  <option>Fast Charging</option>
                </select>
              </div>

            </div>

            {/* Contact & Aadhaar */}
            <div className="grid md:grid-cols-2 gap-5">
              <div>
                <label className="block text-lg font-medium text-[#1e140f] mb-3">
                  Contact Number
                </label>
                <input
                  type="text"
                  required
                  value={formData.contact}
                  onChange={(e) => setFormData({...formData, contact: e.target.value})}
                  placeholder="+91 XXXXX XXXXX"
                  className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500"
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-[#1e140f] mb-3 flex items-center gap-2">
                  <FileCheck size={18} className="text-green-600" />
                  Aadhaar Number (KYC)
                </label>
                <input
                  type="text"
                  required
                  value={formData.aadhaar}
                  onChange={(e) => setFormData({...formData, aadhaar: e.target.value})}
                  placeholder="XXXX XXXX XXXX"
                  className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500 bg-green-50/30"
                />
              </div>
            </div>

            {/* Insurance Badge */}
            <div className="flex items-center gap-3 bg-blue-50 text-blue-800 p-4 rounded-xl mt-6 border border-blue-100">
              <ShieldCheck size={24} className="shrink-0 text-blue-600" />
              <p className="text-sm font-medium">
                Your space is protected! Every charging session is covered by our partner's ₹5 Lakh electrical incident insurance policy.
              </p>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-green-500 hover:bg-green-600 disabled:bg-green-300 text-white py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg"
            >
              {isLoading ? "Submitting..." : "Submit Application"}
            </button>
          </form>
        </div>
        </div>
      </section>
    </div>
  );
};

export default BecomeHost;
