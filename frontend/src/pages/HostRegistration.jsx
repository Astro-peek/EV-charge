

import { motion } from "framer-motion";

import {
  ArrowRight,
  Camera,
  CheckCircle2,
  Clock3,
  IndianRupee,
  MapPin,
  PlugZap,
  ShieldCheck,
  Zap,
} from "lucide-react";

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const HostRegistration = () => {
  const navigate = useNavigate();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    city: "",
    chargerType: "",
    price: "",
    availability: "",
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simulate API call for registration
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[#f5fff8] py-20 px-6">
        <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-white to-emerald-100/50" />
        <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-400/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />
        <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-emerald-300/20 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" />

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="relative z-10 text-center max-w-lg mx-auto bg-white/40 backdrop-blur-2xl border border-white/50 p-10 rounded-[40px] shadow-[0_25px_80px_rgba(0,0,0,0.08)]"
        >
          <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6 text-green-600 shadow-inner">
            <CheckCircle2 size={48} />
          </div>
          <h2 className="text-3xl font-black text-gray-900 mb-4">Place Registered Successfully!</h2>
          <p className="text-gray-600 mb-8 leading-relaxed">
            Thank you for joining the ChargeNest network. Your charger application has been received and is under review. You'll be notified once it's live!
          </p>
          <button
            onClick={() => navigate('/')}
            className="w-full bg-green-600 hover:bg-green-700 text-white rounded-2xl py-4 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl hover:shadow-green-600/30 hover:-translate-y-1"
          >
            Go Back to Main Page
            <ArrowRight size={18} />
          </button>
        </motion.div>
      </section>
    );
  }

  return (
    <section className="relative min-h-screen overflow-hidden bg-[#f5fff8] py-20 px-6">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-green-100/50 via-white to-emerald-100/50" />

      <div className="absolute top-0 left-0 w-[400px] h-[400px] bg-green-400/20 blur-3xl rounded-full -translate-x-1/2 -translate-y-1/2" />

      <div className="absolute bottom-0 right-0 w-[350px] h-[350px] bg-emerald-300/20 blur-3xl rounded-full translate-x-1/3 translate-y-1/3" />

      <div className="relative z-10 max-w-7xl mx-auto grid lg:grid-cols-2 gap-10 items-start">

        {/* LEFT SIDE */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/30 border border-white/40 backdrop-blur-xl text-green-700 text-sm font-medium">
            <Zap size={16} />
            Become a ChargeNest Host
          </div>

          <h1 className="mt-6 text-5xl md:text-6xl font-black text-gray-900 leading-tight">
            Register Your
            <br />
            EV Charger
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-xl leading-relaxed">
            Start earning by sharing your charger with nearby EV drivers.
            Manage pricing, bookings, and availability from one smart dashboard.
          </p>

          {/* Benefits */}
          <div className="mt-10 space-y-4">

            {[
              {
                icon: IndianRupee,
                title: "Flexible Earnings",
                desc: "Set your own pricing and availability.",
              },
              {
                icon: Clock3,
                title: "Instant Bookings",
                desc: "Receive booking requests in real-time.",
              },
              {
                icon: ShieldCheck,
                title: "Secure Platform",
                desc: "Safe host management and payments.",
              },
            ].map((item, index) => {
              const Icon = item.icon;

              return (
                <div
                  key={index}
                  className="flex items-start gap-4 rounded-2xl bg-white/30 backdrop-blur-2xl border border-white/40 p-5 shadow-lg"
                >

                  <div className="w-12 h-12 rounded-xl bg-green-100 text-green-600 flex items-center justify-center">
                    <Icon size={22} />
                  </div>

                  <div>
                    <h3 className="font-bold text-gray-900">
                      {item.title}
                    </h3>

                    <p className="text-gray-600 text-sm mt-1">
                      {item.desc}
                    </p>
                  </div>

                </div>
              );
            })}

          </div>

        </motion.div>

        {/* FORM */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          className="rounded-[40px] border border-white/40 bg-white/25 backdrop-blur-2xl shadow-[0_25px_80px_rgba(0,0,0,0.12)] p-8 md:p-10"
        >

          <div>
            <h2 className="text-3xl font-black text-gray-900">
              Host Registration
            </h2>

            <p className="mt-2 text-gray-600">
              Fill in your charger details to join the network.
            </p>
          </div>

          <form className="mt-8 space-y-5" onSubmit={handleSubmit}>

            {/* Full Name */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Full Name
              </label>

              <input
                type="text"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm font-medium text-gray-700">
                Phone Number
              </label>

              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Enter your phone number"
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* City */}
            <div>

              <label className="text-sm font-medium text-gray-700">
                City / Location
              </label>

              <div className="relative mt-2">

                <MapPin
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                />

                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="Enter your city"
                  className="w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl pl-12 pr-5 py-4 outline-none focus:ring-2 focus:ring-green-500"
                />

              </div>

            </div>

            {/* Charger Type */}
            <div>

              <label className="text-sm font-medium text-gray-700">
                Charger Type
              </label>

              <select
                name="chargerType"
                value={formData.chargerType}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select charger type</option>
                <option>AC Charger</option>
                <option>DC Fast Charger</option>
                <option>Type 2</option>
                <option>CCS2</option>
              </select>

            </div>

            {/* Price */}
            <div>

              <label className="text-sm font-medium text-gray-700">
                Price Per Hour
              </label>

              <input
                type="text"
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="₹ Enter pricing"
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500"
              />

            </div>

            {/* Availability */}
            <div>

              <label className="text-sm font-medium text-gray-700">
                Availability
              </label>

              <select
                name="availability"
                value={formData.availability}
                onChange={handleChange}
                className="mt-2 w-full rounded-2xl border border-white/40 bg-white/40 backdrop-blur-xl px-5 py-4 outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="">Select availability</option>
                <option>24/7</option>
                <option>Weekdays</option>
                <option>Weekends</option>
                <option>Custom Timing</option>
              </select>

            </div>

            {/* Upload */}
            <div>

              <label className="text-sm font-medium text-gray-700">
                Charger Photo
              </label>

              <div className="mt-2 rounded-2xl border-2 border-dashed border-green-200 bg-white/30 backdrop-blur-xl p-8 text-center hover:bg-white/40 transition-all cursor-pointer">

                <div className="w-14 h-14 rounded-2xl bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                  <Camera size={24} />
                </div>

                <p className="mt-4 font-medium text-gray-800">
                  Upload charger image
                </p>

                <p className="text-sm text-gray-500 mt-1">
                  PNG, JPG up to 10MB
                </p>

              </div>

            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-4 bg-green-600 hover:bg-green-700 text-white rounded-2xl py-5 font-semibold flex items-center justify-center gap-2 transition-all duration-300 shadow-xl hover:scale-[1.02]"
            >
              Submit Registration
              <ArrowRight size={18} />
            </button>

          </form>

        </motion.div>

      </div>

    </section>
  );
};

export default HostRegistration;

