import { useState } from "react";

import { motion } from "framer-motion";

import {
  CalendarDays,
  Clock3,
  Car,
  BatteryCharging,
  MapPin,
  CreditCard,
  CheckCircle2,
  Zap,
} from "lucide-react";

const stations = [
  "ChargePoint Hub - Bangalore",
  "EV Plug Station - Hyderabad",
  "FastCharge Zone - Chennai",
  "GreenVolt Station - Mumbai",
];

const vehicles = [
  "Nexon EV",
  "MG ZS EV",
  "BYD Atto 3",
  "Tiago EV",
];

const slots = [
  "08:00 AM",
  "09:30 AM",
  "11:00 AM",
  "12:30 PM",
  "02:00 PM",
  "03:30 PM",
  "05:00 PM",
  "06:30 PM",
];

const BookSlot = () => {

  const [selectedStation, setSelectedStation] =
    useState("");

  const [selectedVehicle, setSelectedVehicle] =
    useState("");

  const [selectedSlot, setSelectedSlot] =
    useState("");

  const [bookingDone, setBookingDone] =
    useState(false);

  const handleBooking = () => {

    if (
      !selectedStation ||
      !selectedVehicle ||
      !selectedSlot
    ) {
      return alert(
        "Please complete all details"
      );
    }

    setBookingDone(true);

  };

  return (

    <div className="min-h-screen bg-gradient-to-br from-[#f4fff8] via-white to-green-100 pt-28 pb-2 px-6 overflow-hidden">

      <div className="max-w-7xl mx-auto">

        {/* HERO */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center"
        >

          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-green-100 text-green-700 font-medium">
            ⚡ Smart EV Slot Reservation
          </div>

          <h1 className="mt-6 text-5xl md:text-7xl font-black text-gray-900 leading-tight">
            Book Your
            <span className="text-green-500">
              {" "}Charging Slot
            </span>
          </h1>

          <p className="mt-6 text-lg text-gray-600 max-w-2xl mx-auto">
            Reserve fast EV charging slots in advance with
            live availability, smart scheduling, and secure booking.
          </p>

        </motion.div>

        {/* MAIN */}
        <div className="mt-16 grid lg:grid-cols-2 gap-10">

          {/* LEFT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8"
          >

            <h2 className="text-3xl font-black text-gray-900">
              Booking Details
            </h2>

            <p className="text-gray-500 mt-2">
              Choose your station, vehicle & charging time.
            </p>

            {/* STATION */}
            <div className="mt-8">

              <label className="text-sm font-semibold text-gray-600">
                Charging Station
              </label>

              <div className="grid gap-4 mt-4">

                {stations.map((station) => (

                  <div
                    key={station}
                    onClick={() =>
                      setSelectedStation(station)
                    }
                    className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                      selectedStation === station
                        ? "bg-green-500 text-white border-green-500 shadow-xl scale-[1.02]"
                        : "bg-white border-gray-200 hover:bg-green-50"
                    }`}
                  >

                    <div className="flex items-center gap-3">

                      <MapPin />

                      <p className="font-semibold">
                        {station}
                      </p>

                    </div>

                  </div>

                ))}

              </div>

            </div>

            {/* VEHICLE */}
            <div className="mt-10">

              <label className="text-sm font-semibold text-gray-600">
                Select Vehicle
              </label>

              <div className="grid grid-cols-2 gap-4 mt-4">

                {vehicles.map((vehicle) => (

                  <div
                    key={vehicle}
                    onClick={() =>
                      setSelectedVehicle(vehicle)
                    }
                    className={`cursor-pointer rounded-2xl border p-5 transition-all duration-300 ${
                      selectedVehicle === vehicle
                        ? "bg-green-500 text-white border-green-500 shadow-xl scale-105"
                        : "bg-white border-gray-200 hover:bg-green-50"
                    }`}
                  >

                    <Car className="mb-2" />

                    <p className="font-semibold">
                      {vehicle}
                    </p>

                  </div>

                ))}

              </div>

            </div>

            {/* SLOT */}
            <div className="mt-10">

              <label className="text-sm font-semibold text-gray-600">
                Available Time Slots
              </label>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">

                {slots.map((slot) => (

                  <button
                    key={slot}
                    onClick={() =>
                      setSelectedSlot(slot)
                    }
                    className={`rounded-2xl py-4 font-semibold transition-all duration-300 ${
                      selectedSlot === slot
                        ? "bg-green-500 text-white shadow-lg scale-105"
                        : "bg-white border border-gray-200 hover:bg-green-50"
                    }`}
                  >
                    {slot}
                  </button>

                ))}

              </div>

            </div>

            {/* BUTTON */}
            <button
              onClick={handleBooking}
              className="mt-10 w-full bg-green-500 hover:bg-green-600 text-white py-5 rounded-2xl text-lg font-bold transition-all duration-300 hover:scale-[1.02] shadow-xl"
            >
              Confirm Booking ⚡
            </button>

          </motion.div>

          {/* RIGHT PANEL */}
          <motion.div
            initial={{ opacity: 0, x: 40 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >

            <div className="sticky top-28 bg-white/80 backdrop-blur-2xl rounded-[32px] border border-white/40 shadow-[0_20px_60px_rgba(0,0,0,0.08)] p-8">

              <h2 className="text-3xl font-black text-gray-900">
                Booking Summary
              </h2>

              <div className="mt-10 space-y-6">

                {/* STATION */}
                <div className="bg-green-50 rounded-3xl p-5 flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-md">
                    <MapPin />
                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      Station
                    </p>

                    <h3 className="font-bold text-lg">
                      {selectedStation ||
                        "Select Station"}
                    </h3>

                  </div>

                </div>

                {/* VEHICLE */}
                <div className="bg-green-50 rounded-3xl p-5 flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-md">
                    <Car />
                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      Vehicle
                    </p>

                    <h3 className="font-bold text-lg">
                      {selectedVehicle ||
                        "Select Vehicle"}
                    </h3>

                  </div>

                </div>

                {/* SLOT */}
                <div className="bg-green-50 rounded-3xl p-5 flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-green-600 shadow-md">
                    <Clock3 />
                  </div>

                  <div>

                    <p className="text-gray-500 text-sm">
                      Charging Slot
                    </p>

                    <h3 className="font-bold text-lg">
                      {selectedSlot ||
                        "Select Slot"}
                    </h3>

                  </div>

                </div>

                {/* ESTIMATED */}
                <div className="bg-green-500 text-white rounded-3xl p-6">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-green-100">
                        Estimated Charging
                      </p>

                      <h2 className="text-4xl font-black mt-2">
                        ₹420
                      </h2>

                    </div>

                    <Zap size={42} />

                  </div>

                </div>

              </div>

              {/* SUCCESS */}
              {bookingDone && (

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 20,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  className="mt-8 bg-green-100 border border-green-200 rounded-3xl p-6 text-center"
                >

                  <CheckCircle2
                    className="mx-auto text-green-600"
                    size={60}
                  />

                  <h3 className="text-2xl font-black text-green-700 mt-4">
                    Booking Confirmed!
                  </h3>

                  <p className="text-green-600 mt-2">
                    Your EV charging slot has been reserved successfully.
                  </p>

                </motion.div>

              )}

            </div>

          </motion.div>

        </div>

      </div>

    </div>

  );

};

export default BookSlot;