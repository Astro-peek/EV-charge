import { motion } from "framer-motion";
import {
  ClipboardList,
  PlugZap,
  IndianRupee,
} from "lucide-react";

const BecomeHost = () => {
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

            <button className="mt-8 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-2xl text-lg font-semibold transition-all duration-300 shadow-xl">
              List My Space
            </button>

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
      <section className="pb-28 px-6">

        <div className="max-w-3xl mx-auto bg-white rounded-[28px] shadow-xl border border-[#ece8df] p-10 md:p-14">

          <h2 className="text-4xl font-black text-[#1e140f]">
            Register Your Space
          </h2>

          <form className="mt-10 space-y-6">

            {/* Location Name */}
            <div>
              <label className="block text-lg font-medium text-[#1e140f] mb-3">
                Location Name
              </label>

              <input
                type="text"
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

                <select className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500">
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

                <select className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500">
                  <option>Single Phase (3.3 kW)</option>
                  <option>7.2 kW</option>
                  <option>11 kW</option>
                  <option>Fast Charging</option>
                </select>
              </div>

            </div>

            {/* Contact */}
            <div>
              <label className="block text-lg font-medium text-[#1e140f] mb-3">
                Contact Number
              </label>

              <input
                type="text"
                placeholder="+91 XXXXX XXXXX"
                className="w-full border border-[#ddd7cf] rounded-2xl px-5 py-4 text-lg outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-2xl text-xl font-bold transition-all duration-300 shadow-lg"
            >
              Submit Application
            </button>

          </form>

        </div>

      </section>
    </div>
  );
};

export default BecomeHost;
