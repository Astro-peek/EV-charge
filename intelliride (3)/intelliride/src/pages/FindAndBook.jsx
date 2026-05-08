import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  MapPin, Search, Zap, CheckCircle2, Clock3, 
  Filter, Navigation, Info, ArrowLeft, 
  Star, Battery, ShieldCheck, CreditCard,
  Wifi, Coffee, Car, Phone
} from "lucide-react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { stationService, bookingService, paymentService, analyticsService, queueService } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import Button from "../components/common/Button";

/* FIX LEAFLET MARKER ICONS */
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Helper component to handle map panning
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const FindAndBook = () => {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [stations, setStations] = useState([]);
  const [selectedStation, setSelectedStation] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState("");
  const [bookingStep, setBookingStep] = useState(1); // 1: Browse, 2: Detail, 3: Book, 4: Payment, 5: Processing, 6: Success
  const [loading, setLoading] = useState(true);
  const [userLocation, setUserLocation] = useState(null);
  const [filterType, setFilterType] = useState("all"); // all, ac, dc
  const [routeData, setRouteData] = useState(null); // { coordinates, distance, duration }
  const [paymentMethod, setPaymentMethod] = useState(""); // razorpay, onsite
  const [selectedDuration, setSelectedDuration] = useState(1); // Hours
  const [waitTimes, setWaitTimes] = useState({}); // stationId -> waitData
  const [occupancy, setOccupancy] = useState({}); // stationId -> count

  const listRef = useRef(null);

  // Custom User Marker Icon
  const userIcon = new L.Icon({
    iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  const stationIcon = (isSelected) => new L.Icon({
    iconUrl: isSelected 
      ? 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png'
      : 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: isSelected ? [35, 51] : [25, 41],
    iconAnchor: isSelected ? [17, 51] : [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => setUserLocation([pos.coords.latitude, pos.coords.longitude]),
        (err) => console.warn("Geolocation denied", err)
      );
    }

    const fetchStations = async () => {
      try {
        const res = await stationService.getStations();
        // Enrich data with premium details if missing
        const enriched = res.data.map((s, idx) => ({
          ...s,
          rating: (4 + Math.random()).toFixed(1),
          reviews: Math.floor(Math.random() * 200) + 50,
          image: idx % 2 === 0 ? "/assets/station1.png" : "/assets/station2.png",
          amenities: ["Wifi", "Coffee", "Parking", "Washroom"].slice(0, 2 + Math.floor(Math.random() * 3)),
          power: s.power || (idx % 2 === 0 ? "60kW DC" : "22kW AC"),
          connector_types: s.connector_types?.length ? s.connector_types : ["CCS2", "Type 2"],
          price_per_unit: s.price_per_unit || 12.50 // Fallback price
        }));
        setStations(enriched);

        // Fetch wait times + occupancy for all stations in background
        enriched.forEach(async (s) => {
          try {
            const [wtRes, occRes] = await Promise.all([
              analyticsService.getWaitTime(s.id).catch(() => null),
              queueService.getOccupancy(s.id).catch(() => null)
            ]);
            if (wtRes) setWaitTimes(prev => ({ ...prev, [s.id]: wtRes.data }));
            if (occRes) setOccupancy(prev => ({ ...prev, [s.id]: occRes.data.activeCount }));
          } catch (e) { /* silent */ }
        });
      } catch (err) {
        console.error("Failed to fetch stations:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchStations();
  }, []);

  const filteredStations = stations.filter((s) => {
    const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
      (s.address && s.address.toLowerCase().includes(search.toLowerCase()));
    const matchesFilter = filterType === "all" || s.type?.toLowerCase() === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleBooking = async () => {
    if (!user) return alert("Please login to book a slot");
    
    const totalAmount = selectedStation.price_per_unit * selectedDuration;
    if (isNaN(totalAmount) || totalAmount <= 0) {
      return alert("Invalid booking amount. Please try again.");
    }

    setLoading(true);
    setBookingStep(5); // Processing...

    try {
      // 1. Create a Pending Booking first
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + selectedDuration * 60 * 60 * 1000); 
      const bookingData = {
        user_id: user.id,
        station_id: selectedStation.id,
        start_time: startTime,
        end_time: endTime,
        status: 'pending',
        total_amount: totalAmount,
        payment_method: paymentMethod
      };
      
      const bookingRes = await bookingService.createBooking(bookingData);
      const bookingId = bookingRes.data.id;

      if (paymentMethod === 'razorpay') {
        if (!window.Razorpay) {
          throw new Error("Razorpay SDK not loaded.");
        }

        // 2. Create Razorpay Order in Backend
        const orderRes = await paymentService.createOrder(totalAmount, bookingId);
        const order = orderRes.data;

        // 3. Open Razorpay Checkout
        const options = {
          key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_pIqEExSskEEnzW", 
          amount: order.amount,
          currency: order.currency,
          name: "IntelliRide EV",
          description: `Booking at ${selectedStation.name}`,
          order_id: order.id,
          handler: async function (response) {
            try {
              // 4. Verify Payment in Backend
              const verifyRes = await paymentService.verifyPayment({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
                bookingId: bookingId
              });

              if (verifyRes.data.status === 'success') {
                setBookingStep(6); // Success!
              } else {
                throw new Error("Payment verification failed.");
              }
            } catch (err) {
              alert("Payment verification failed: " + err.message);
              setBookingStep(4);
            }
          },
          prefill: {
            name: user?.name || "User",
            email: user?.email || "customer@example.com",
          },
          theme: { color: "#10b981" },
          modal: {
            ondismiss: function() {
              setLoading(false);
              setBookingStep(4);
            }
          }
        };

        const rzp = new window.Razorpay(options);
        rzp.open();
      } else {
        // Onsite Payment - Just finish
        setBookingStep(6);
      }
    } catch (err) {
      console.error("Booking process error:", err);
      const errorMsg = err.response?.data?.error || err.response?.data?.message || err.message;
      alert("Booking failed: " + errorMsg);
      setBookingStep(4);
    } finally {
      setLoading(false);
    }
  };

  const handleDirections = async () => {
    if (!userLocation || !selectedStation) return alert("Location not available");
    
    // 1. External Link (Google Maps)
    const url = `https://www.google.com/maps/dir/?api=1&origin=${userLocation[0]},${userLocation[1]}&destination=${selectedStation.lat},${selectedStation.lng}&travelmode=driving`;
    window.open(url, '_blank');

    // 2. In-app Polyline (OSRM API)
    try {
      setLoading(true);
      const res = await fetch(`https://router.project-osrm.org/route/v1/driving/${userLocation[1]},${userLocation[0]};${selectedStation.lng},${selectedStation.lat}?overview=full&geometries=geojson`);
      const data = await res.json();
      if (data.routes && data.routes[0]) {
        const coords = data.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRouteData({
          coordinates: coords,
          distance: (data.routes[0].distance / 1000).toFixed(1),
          duration: Math.round(data.routes[0].duration / 60)
        });
      }
    } catch (err) {
      console.error("Routing error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-white overflow-hidden">
      {/* LEFT SIDEBAR: LIST & SEARCH */}
      <div className="w-full lg:w-[450px] flex flex-col border-r border-gray-100 z-10 bg-white shadow-2xl shadow-gray-200/50">
        <div className="p-6 pt-24 border-b border-gray-50 bg-white/80 backdrop-blur-md sticky top-0 z-20">
          <h1 className="text-3xl font-black text-gray-900 tracking-tight flex items-center gap-2">
            Find <Zap className="text-green-500" fill="currentColor" /> Charge
          </h1>
          <p className="text-gray-400 text-sm mt-1 mb-6">Discover premium charging hubs near you.</p>
          
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-green-500 transition-colors" size={18} />
            <input
              type="text"
              placeholder="Search by location or hub name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-12 pr-4 h-14 bg-gray-50 border border-gray-100 rounded-2xl outline-none focus:ring-4 focus:ring-green-500/10 focus:border-green-500 focus:bg-white transition-all text-gray-900 font-medium"
            />
          </div>

          <div className="flex gap-2 mt-4 overflow-x-auto no-scrollbar pb-1">
            {["all", "dc", "ac"].map((t) => (
              <button
                key={t}
                onClick={() => setFilterType(t)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all border ${
                  filterType === t 
                    ? "bg-gray-900 text-white border-gray-900 shadow-lg shadow-gray-200" 
                    : "bg-white text-gray-500 border-gray-200 hover:border-gray-300"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 bg-gray-50/50" ref={listRef}>
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64">
              <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-400 mt-4 font-medium animate-pulse">Scanning the grid...</p>
            </div>
          ) : filteredStations.length > 0 ? (
            filteredStations.map((station) => (
              <motion.div
                layout
                key={station.id}
                onClick={() => {
                  setSelectedStation(station);
                  setBookingStep(2);
                }}
                className={`group relative p-4 rounded-3xl cursor-pointer transition-all border-2 overflow-hidden ${
                  selectedStation?.id === station.id
                    ? "border-green-500 bg-white shadow-xl shadow-green-500/10 scale-[1.02]"
                    : "bg-white border-white shadow-sm hover:shadow-md hover:scale-[1.01]"
                }`}
              >
                <div className="flex gap-4">
                  <div className="w-24 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                    <img src={station.image} alt={station.name} className="w-full h-full object-cover transition-transform group-hover:scale-110 duration-500" />
                    <div className="absolute top-1 left-1 bg-white/90 backdrop-blur-sm px-1.5 py-0.5 rounded-lg flex items-center gap-1 text-[10px] font-black text-gray-900 shadow-sm">
                      <Star size={10} className="text-yellow-500" fill="currentColor" /> {station.rating}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h2 className="text-lg font-black text-gray-900 truncate group-hover:text-green-600 transition-colors">{station.name}</h2>
                    </div>
                    <p className="flex items-center gap-1 text-gray-400 text-xs truncate mb-2">
                      <MapPin size={12} className="text-green-500" /> {station.address}
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      <span className="px-2 py-1 bg-green-50 text-green-700 rounded-lg text-[10px] font-bold border border-green-100">
                        {station.power}
                      </span>
                      <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                        station.status === "available" ? "bg-blue-50 text-blue-700 border-blue-100" : "bg-red-50 text-red-700 border-red-100"
                      }`}>
                        {station.status === "available" ? "🟢 OPEN" : "🔴 BUSY"}
                      </span>
                      {waitTimes[station.id] && (
                        <span className={`px-2 py-1 rounded-lg text-[10px] font-bold border ${
                          waitTimes[station.id].currentStatus === "high" 
                            ? "bg-red-50 text-red-700 border-red-100"
                            : waitTimes[station.id].currentStatus === "medium"
                            ? "bg-amber-50 text-amber-700 border-amber-100"
                            : "bg-green-50 text-green-700 border-green-100"
                        }`}>
                          ⏱ ~{waitTimes[station.id].estimatedWaitMinutes} min wait
                        </span>
                      )}
                      {occupancy[station.id] > 0 && (
                        <span className="px-2 py-1 bg-purple-50 text-purple-700 rounded-lg text-[10px] font-bold border border-purple-100">
                          👥 {occupancy[station.id]} charging
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-4 flex justify-between items-center pt-3 border-t border-gray-50">
                  <div className="flex items-center gap-3">
                    <div className="flex -space-x-2">
                       {station.amenities.map((a, i) => (
                         <div key={i} className="w-6 h-6 rounded-full bg-white border border-gray-100 flex items-center justify-center text-gray-400 shadow-sm">
                            {a === "Wifi" ? <Wifi size={10} /> : a === "Coffee" ? <Coffee size={10} /> : <Info size={10} />}
                         </div>
                       ))}
                    </div>
                    <span className="text-[10px] font-bold text-gray-300 uppercase tracking-widest">{station.reviews} reviews</span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-gray-400 font-medium">Starting at</span>
                    <p className="text-lg font-black text-gray-900 leading-none">₹{station.price_per_unit}<span className="text-xs text-gray-400">/hr</span></p>
                  </div>
                </div>
              </motion.div>
            ))
          ) : (
            <div className="text-center py-20 px-10">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-gray-400 font-bold">No stations found in this area.</p>
              <button onClick={() => setSearch("")} className="text-green-600 text-sm font-bold mt-2">Clear search</button>
            </div>
          )}
        </div>
      </div>

      {/* RIGHT SIDE: MAP & DETAIL OVERLAY */}
      <div className="flex-1 relative">
        <MapContainer
          center={userLocation || [28.6139, 77.2090]}
          zoom={13}
          className="h-full w-full grayscale-[0.2] contrast-[1.1]"
          zoomControl={false}
        >
          <TileLayer 
            url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" 
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          />
          <MapRecenter center={selectedStation ? [selectedStation.lat, selectedStation.lng] : userLocation} />
          
          {userLocation && (
            <Marker position={userLocation} icon={userIcon}>
              <Popup className="premium-popup">You are here 📍</Popup>
            </Marker>
          )}

          {filteredStations.map((s) => (
            <Marker 
              key={s.id} 
              position={[s.lat, s.lng]} 
              icon={stationIcon(selectedStation?.id === s.id)}
              eventHandlers={{
                click: () => {
                  setSelectedStation(s);
                  setBookingStep(2);
                },
              }}
            >
              <Popup className="premium-popup">
                <div className="p-2 min-w-[120px]">
                  <h3 className="font-black text-gray-900 leading-tight">{s.name}</h3>
                  <p className="text-[10px] text-green-600 font-bold mt-1">₹{s.price_per_unit}/hr</p>
                </div>
              </Popup>
            </Marker>
          ))}

          {routeData && (
            <Polyline 
              positions={routeData.coordinates} 
              color="#22c55e" 
              weight={6} 
              opacity={0.8}
              dashArray="1, 10"
              lineCap="round"
            />
          )}
        </MapContainer>

        {/* DETAIL OVERLAY */}
        <AnimatePresence>
          {selectedStation && bookingStep >= 2 && (
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="absolute right-0 top-[80px] bottom-0 w-full md:w-[500px] bg-white z-30 shadow-2xl flex flex-col border-l border-gray-100"
            >
              {/* DETAIL HEADER */}
              <div className="relative h-64 overflow-hidden bg-gray-900">
                <img src={selectedStation.image} className="w-full h-full object-cover opacity-80" alt="" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                <button 
                  onClick={() => {
                    if (bookingStep === 2) setSelectedStation(null);
                    else if (bookingStep > 2) setBookingStep(bookingStep - 1);
                  }}
                  className="absolute top-6 left-6 w-12 h-12 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center text-white hover:bg-white hover:text-gray-900 transition-all border border-white/20"
                >
                  <ArrowLeft size={24} />
                </button>
                <div className="absolute bottom-12 left-6 right-6">
                  <div className="flex gap-2">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                      {selectedStation.type} Fast Charge
                    </span>
                  </div>
                </div>
              </div>

              {/* DETAIL CONTENT */}
              <div className="flex-1 overflow-y-auto p-8 pt-10 bg-white rounded-t-[40px] -mt-12 relative z-10">
                <div className="mb-8">
                  <div className="flex justify-between items-start gap-4">
                    <h2 className="text-3xl font-black text-gray-900 leading-tight tracking-tighter">{selectedStation.name}</h2>
                    <span className="flex items-center gap-1 px-3 py-1.5 bg-yellow-50 text-yellow-700 rounded-2xl text-xs font-black border border-yellow-100 shadow-sm flex-shrink-0">
                      ⭐ {selectedStation.rating}
                    </span>
                  </div>
                  <p className="text-gray-400 text-sm mt-1 flex items-center gap-1 font-medium">
                    <MapPin size={14} className="text-green-500" /> {selectedStation.address}
                  </p>
                </div>

                {bookingStep === 2 ? (
                  <div className="space-y-8">
                    <div className="flex justify-between items-start">
                       <div>
                         <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-1">Location</p>
                         <h3 className="text-gray-900 font-medium">{selectedStation.address}</h3>
                       </div>
                       <button className="w-14 h-14 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center hover:bg-green-100 transition-colors">
                          <Navigation size={24} />
                       </button>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                       <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100">
                          <Battery className="text-green-500 mb-2" />
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Speed</p>
                          <h4 className="text-lg font-black text-gray-900">{selectedStation.power}</h4>
                       </div>
                       <div className="p-4 rounded-3xl bg-gray-50 border border-gray-100">
                          <ShieldCheck className="text-blue-500 mb-2" />
                          <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest">Verified</p>
                          <h4 className="text-lg font-black text-gray-900">ChargeHub+</h4>
                       </div>
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Connectors Available</h4>
                      <div className="flex gap-3">
                        {selectedStation.connector_types.map((c, i) => (
                          <div key={i} className="flex-1 p-4 rounded-2xl border-2 border-gray-100 flex flex-col items-center gap-2">
                             <Zap size={20} className="text-gray-300" />
                             <span className="text-xs font-black text-gray-700">{c}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div>
                       <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Amenities at Hub</h4>
                       <div className="flex gap-4">
                          {selectedStation.amenities.map((a, i) => (
                            <div key={i} className="flex flex-col items-center gap-2">
                               <div className="w-14 h-14 bg-gray-50 rounded-2xl flex items-center justify-center text-gray-400 border border-gray-100">
                                  {a === "Wifi" ? <Wifi size={24} /> : a === "Coffee" ? <Coffee size={24} /> : <Car size={24} />}
                               </div>
                               <span className="text-[10px] font-bold text-gray-400 uppercase">{a}</span>
                            </div>
                          ))}
                       </div>
                    </div>
                  </div>
                ) : bookingStep === 3 ? (
                  <div className="space-y-8">
                     <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">Select Charging Window</h3>
                        <div className="grid grid-cols-2 gap-4">
                           {["08:00 AM", "10:30 AM", "01:00 PM", "03:30 PM", "06:00 PM", "08:30 PM"].map((t) => (
                             <button
                               key={t}
                               onClick={() => setSelectedSlot(t)}
                               className={`p-6 rounded-3xl border-2 transition-all font-bold ${
                                 selectedSlot === t 
                                   ? "border-green-500 bg-green-500 text-white shadow-xl shadow-green-200" 
                                   : "border-gray-50 bg-gray-50 text-gray-600 hover:border-gray-200"
                               }`}
                             >
                               {t}
                             </button>
                           ))}
                        </div>
                     </div>

                     <div>
                        <h3 className="text-2xl font-black text-gray-900 mb-4">Duration (Hours)</h3>
                        <div className="flex gap-4">
                           {[1, 2, 3, 4].map((h) => (
                             <button
                               key={h}
                               onClick={() => setSelectedDuration(h)}
                               className={`flex-1 p-4 rounded-2xl border-2 transition-all font-bold ${
                                 selectedDuration === h 
                                   ? "border-green-500 bg-green-500 text-white" 
                                   : "border-gray-50 bg-gray-50 text-gray-600 hover:border-gray-200"
                               }`}
                             >
                               {h}h
                             </button>
                           ))}
                        </div>
                     </div>

                     <div className="p-6 rounded-3xl bg-green-900 text-white shadow-2xl">
                        <div className="flex justify-between items-center mb-4">
                           <p className="text-green-300 text-sm font-bold uppercase tracking-widest">Pricing Policy</p>
                           <CreditCard size={20} />
                        </div>
                        <div className="flex justify-between items-end">
                           <div>
                              <p className="text-xs opacity-70">Estimated Total ({selectedDuration}h)</p>
                              <h4 className="text-3xl font-black italic">₹{(selectedStation.price_per_unit * selectedDuration).toFixed(2)}</h4>
                           </div>
                           <p className="text-[10px] text-right opacity-60">Inclusive of 18% GST<br/>Energy charges apply extra</p>
                        </div>
                     </div>
                  </div>
                ) : bookingStep === 4 ? (
                  <div className="space-y-8">
                    <h3 className="text-2xl font-black text-gray-900">Payment Method</h3>
                    <div className="space-y-4">
                      <button
                        onClick={() => setPaymentMethod("razorpay")}
                        className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${
                          paymentMethod === "razorpay" 
                            ? "border-blue-500 bg-blue-50" 
                            : "border-gray-50 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center text-white">
                            <CreditCard size={24} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-gray-900">Razorpay</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Cards, UPI, Netbanking</p>
                          </div>
                        </div>
                        {paymentMethod === "razorpay" && <CheckCircle2 className="text-blue-500" />}
                      </button>

                      <button
                        onClick={() => setPaymentMethod("onsite")}
                        className={`w-full p-6 rounded-3xl border-2 transition-all flex items-center justify-between ${
                          paymentMethod === "onsite" 
                            ? "border-green-500 bg-green-50" 
                            : "border-gray-50 bg-gray-50 hover:border-gray-200"
                        }`}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center text-white">
                            <MapPin size={24} />
                          </div>
                          <div className="text-left">
                            <p className="font-black text-gray-900">Pay on Site</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Pay at the station</p>
                          </div>
                        </div>
                        {paymentMethod === "onsite" && <CheckCircle2 className="text-green-500" />}
                      </button>
                    </div>
                  </div>
                ) : bookingStep === 5 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <div className="w-20 h-20 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-6"></div>
                    <h3 className="text-2xl font-black text-gray-900 italic tracking-tighter">Processing Payment...</h3>
                    <p className="text-gray-400 text-sm mt-2 font-medium">Please do not close or refresh this page.</p>
                  </div>
                ) : (
                  <div className="h-full flex flex-col items-center justify-center text-center py-10">
                    <div className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white mb-6 shadow-2xl shadow-green-200 border-4 border-white">
                      <CheckCircle2 size={48} />
                    </div>
                    <h3 className="text-4xl font-black text-gray-900 mb-2 italic tracking-tighter">Success!</h3>
                    <p className="text-gray-400 font-medium max-w-[300px] leading-relaxed">Your slot at <span className="text-gray-900 font-black">{selectedStation.name}</span> has been confirmed.</p>
                    <div className="mt-8 p-6 bg-gray-50 rounded-3xl border border-dashed border-gray-200 w-full max-w-[350px]">
                      <div className="flex justify-between text-sm mb-4">
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Order ID</span>
                        <span className="font-black text-gray-900">CH-882910</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-400 font-bold uppercase tracking-widest text-[10px]">Scheduled</span>
                        <span className="font-black text-gray-900">{selectedSlot} Today</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* DETAIL FOOTER: ACTION BUTTON */}
              <div className="p-8 border-t border-gray-50 bg-white sticky bottom-0">
                {bookingStep === 2 ? (
                  <Button 
                    className="w-full h-16 rounded-2xl text-lg font-black italic tracking-tight shadow-2xl shadow-green-500/20"
                    onClick={() => setBookingStep(3)}
                  >
                    Proceed to Booking
                  </Button>
                ) : bookingStep === 3 ? (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setBookingStep(2)}
                      className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <Button 
                      className="flex-1 h-16 rounded-2xl text-lg font-black italic tracking-tight shadow-2xl shadow-green-500/20"
                      disabled={!selectedSlot}
                      onClick={() => setBookingStep(4)}
                    >
                      Select Payment
                    </Button>
                  </div>
                ) : bookingStep === 4 ? (
                  <div className="flex gap-4">
                    <button 
                      onClick={() => setBookingStep(3)}
                      className="w-16 h-16 bg-gray-50 text-gray-400 rounded-2xl flex items-center justify-center hover:bg-gray-100 transition-colors"
                    >
                      <ArrowLeft size={24} />
                    </button>
                    <Button 
                      className={`flex-1 h-16 rounded-2xl text-lg font-black italic tracking-tight shadow-2xl ${
                        paymentMethod === 'razorpay' ? 'shadow-blue-500/20' : 'shadow-green-500/20'
                      }`}
                      disabled={!paymentMethod || loading}
                      onClick={handleBooking}
                    >
                      {paymentMethod === 'razorpay' ? "Pay Now via Razorpay" : "Confirm Booking"}
                    </Button>
                  </div>
                ) : bookingStep === 5 ? (
                  <div className="h-16 flex items-center justify-center bg-gray-50 rounded-2xl text-gray-400 font-bold italic tracking-widest">
                    WAITING FOR GATEWAY...
                  </div>
                ) : (
                  <div className="flex gap-4">
                    <Button 
                      variant="outline"
                      className="flex-1 h-16 rounded-2xl text-lg font-bold"
                      onClick={() => {
                        setSelectedStation(null);
                        setBookingStep(1);
                      }}
                    >
                      Close
                    </Button>
                    <Button 
                      className="flex-1 h-16 rounded-2xl text-lg font-black italic shadow-xl shadow-green-500/20"
                      onClick={handleDirections}
                    >
                      Directions {routeData?.distance ? `(${routeData.distance} km)` : ""}
                    </Button>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAP CONTROLS */}
        <div className="absolute top-24 right-6 flex flex-col gap-2 z-20">
           <button 
             onClick={() => setUserLocation(userLocation)} 
             className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
           >
              <Navigation size={20} />
           </button>
           <button 
             className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-gray-600 hover:text-green-600 transition-colors"
           >
              <Filter size={20} />
           </button>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #d1d5db; }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
        .premium-popup .leaflet-popup-content-wrapper { border-radius: 20px; padding: 0; overflow: hidden; border: 1px solid #f3f4f6; box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1); }
        .premium-popup .leaflet-popup-content { margin: 0; }
        .premium-popup .leaflet-popup-tip { box-shadow: none; border: 1px solid #f3f4f6; }
      `}} />
    </div>
  );
};

export default FindAndBook;