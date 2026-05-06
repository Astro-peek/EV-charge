import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapPin, Search, Zap, CheckCircle2, Clock3 } from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { stationService, bookingService } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Card from "../components/common/Card";
import Button from "../components/common/Button";

/* FIX LEAFLET MARKER ICONS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const slots = [
  { time: "08:00 AM", available: true },
  { time: "09:30 AM", available: false },
  { time: "11:00 AM", available: true },
  { time: "12:30 PM", available: true },
  { time: "02:00 PM", available: false },
  { time: "03:30 PM", available: true },
];

const FindAndBook = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingDone, setBookingDone] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStations = async () => {
      try {
        // Prefer Supabase for real-time station data
        const { data, error } = await stationService.getStationsSupabase();
        if (data) setStations(data);
        else {
          // Fallback to Express API if Supabase table isn't ready
          const res = await stationService.getStations();
          setStations(res.data);
        }
      } catch (err) {
        console.error("Failed to fetch stations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const filteredStations = stations.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (s.address && s.address.toLowerCase().includes(search.toLowerCase()))
  );

  const handleBooking = async () => {
    if (!selectedStation || !selectedSlot) return alert("Select station & slot");
    if (!user) return alert("Please login to book a slot");

    try {
      setLoading(true);
      // In a real app, you'd calculate start/end time based on the slot
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); 

      const bookingData = {
        user_id: user.uid,
        station_id: selectedStation.id || selectedStation._id,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        total_amount: selectedStation.price_per_unit || 420
      };

      // Try Supabase first
      const { error } = await bookingService.createBooking(bookingData); // Can use either
      if (error) throw error;

      setBookingDone(true);
    } catch (err) {
      alert("Booking failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen pt-24 pb-12 px-6 bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* HEADER */}
        <div className="text-center mb-10">
          <h1 className="text-5xl font-black text-gray-900">Find & Book Charging ⚡</h1>
          <p className="text-gray-500 mt-4 text-lg">Discover real-time charging availability and reserve your slot instantly.</p>
        </div>

        {/* SEARCH */}
        <div className="max-w-xl mx-auto mb-10">
          <div className="bg-white border border-gray-200 rounded-2xl p-4 flex gap-3 shadow-sm focus-within:ring-2 focus-within:ring-green-500 transition">
            <Search className="text-gray-400" />
            <input
              type="text"
              placeholder="Search station or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full outline-none"
            />
          </div>
        </div>

        {/* MAIN GRID */}
        <div className="grid lg:grid-cols-2 gap-10">
          {/* LEFT: STATIONS */}
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {loading ? (
              <p className="text-center text-gray-500 py-10">Loading stations...</p>
            ) : filteredStations.length > 0 ? (
              filteredStations.map((station) => (
                <div
                  key={station.id || station._id}
                  onClick={() => {
                    setSelectedStation(station);
                    setSelectedSlot("");
                    setBookingDone(false);
                  }}
                  className={`p-6 rounded-2xl cursor-pointer transition border-2 ${
                    selectedStation?.id === station.id || selectedStation?._id === station._id
                      ? "border-green-500 bg-green-50"
                      : "bg-white border-transparent shadow-sm hover:shadow-md"
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">{station.name}</h2>
                      <p className="flex items-center gap-2 mt-2 text-gray-500 text-sm">
                        <MapPin size={16} className="text-green-500" />
                        {station.address || station.city}
                      </p>
                    </div>
                    <div className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-bold">
                      ₹{station.price_per_unit || station.pricePerUnit || 420}/hr
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 py-10">No stations found.</p>
            )}
          </div>

          {/* RIGHT: MAP */}
          <Card padding="p-0" className="h-[500px] overflow-hidden">
            <MapContainer
              center={[20.5937, 78.9629]} // Center of India
              zoom={5}
              className="h-full w-full"
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filteredStations.map((s) => (
                <Marker key={s.id || s._id} position={[s.lat || (s.location?.coordinates?.lat), s.lng || (s.location?.coordinates?.lng)]}>
                  <Popup>
                    <div className="p-1">
                      <h3 className="font-bold">{s.name}</h3>
                      <p className="text-xs">{s.address || s.city}</p>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </Card>
        </div>

        {/* SLOT BOOKING */}
        {selectedStation && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-16"
          >
            <Card>
              <h2 className="text-3xl font-black mb-8 text-gray-900">
                Select Slot - <span className="text-green-600">{selectedStation.name}</span>
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    disabled={!slot.available}
                    onClick={() => setSelectedSlot(slot.time)}
                    className={`p-6 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2 ${
                      !slot.available
                        ? "bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed"
                        : selectedSlot === slot.time
                        ? "border-green-500 bg-green-500 text-white scale-105 shadow-xl shadow-green-100"
                        : "bg-white border-gray-100 hover:border-green-200 hover:bg-green-50"
                    }`}
                  >
                    <Clock3 size={24} />
                    <span className="font-bold">{slot.time}</span>
                    {!slot.available && <span className="text-[10px] uppercase tracking-wider">Full</span>}
                  </button>
                ))}
              </div>

              {selectedSlot && (
                <div className="mt-10 p-8 rounded-3xl bg-gray-50 border border-gray-100 flex flex-col md:flex-row justify-between items-center gap-6">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Time Slot</p>
                      <h3 className="text-2xl font-black text-gray-900">{selectedSlot}</h3>
                    </div>
                    <div className="w-px h-10 bg-gray-200 hidden md:block"></div>
                    <div>
                      <p className="text-gray-400 text-sm uppercase tracking-widest font-bold">Estimated Cost</p>
                      <h3 className="text-2xl font-black text-green-600">₹{selectedStation.price_per_unit || 420}</h3>
                    </div>
                  </div>
                  <Button
                    onClick={handleBooking}
                    className="w-full md:w-auto h-16 px-12 text-lg shadow-xl"
                    disabled={loading || bookingDone}
                  >
                    {loading ? "Processing..." : bookingDone ? "Booking Confirmed" : "Confirm Booking"}
                  </Button>
                </div>
              )}

              {bookingDone && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="mt-8 p-6 bg-green-500 text-white rounded-2xl flex items-center justify-center gap-4 shadow-xl"
                >
                  <CheckCircle2 size={32} />
                  <div className="text-center">
                    <h4 className="text-xl font-bold">Booking Confirmed!</h4>
                    <p className="text-green-100">Check your dashboard for details.</p>
                  </div>
                </motion.div>
              )}
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default FindAndBook;