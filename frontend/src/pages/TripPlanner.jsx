import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  ArrowLeftRight,
  Car,
  Zap,
  BatteryCharging,
  Clock3,
  Route as RouteIcon,
  Navigation,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from "lucide-react";
import { useLocation } from "react-router-dom";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline,
  useMap,
  Tooltip
} from "react-leaflet";
import L from "leaflet";
import { userIcon, premiumStationIcon, unselectedStationIcon } from "../utils/mapIcons";
import "leaflet/dist/leaflet.css";
import "./TripPlanner.css";
import api, { tripService } from "../utils/api";

// Map Recenter Component
const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) map.setView(center, map.getZoom());
  }, [center]);
  return null;
};

const TripPlanner = () => {
  const location = useLocation();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [vehicle, setVehicle] = useState("Nexon EV");
  const [battery, setBattery] = useState(80);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [routeCoordinates, setRouteCoordinates] = useState([]);
  const [userLocation, setUserLocation] = useState(null);
  const [rerouteAlert, setRerouteAlert] = useState(null);
  const [endCoords, setEndCoords] = useState(null);
  const [locationStatus, setLocationStatus] = useState("loading"); // loading | success | denied | unavailable
  const watchIdRef = useRef(null);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setUserLocation([20.5937, 78.9629]); // India centroid fallback
      return;
    }

    setLocationStatus("loading");

    // Clear any existing watch
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
    }

    // Use watchPosition — it keeps trying for a better fix automatically
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = [pos.coords.latitude, pos.coords.longitude];
        setUserLocation(coords);
        setLocationStatus("success");
        setFrom((prev) => prev === "" || prev === "My Current Location" ? "My Current Location" : prev);
        // Stop watching after we get a good fix (accuracy < 500m)
        if (pos.coords.accuracy < 500 && watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      (err) => {
        console.warn("Geolocation error in TripPlanner:", err.code, err.message);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationStatus("denied");
        } else {
          setLocationStatus("unavailable");
        }
        // Use India centroid so map still renders usefully
        setUserLocation((prev) => prev || [20.5937, 78.9629]);
        if (watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0,
      }
    );
  };

  useEffect(() => {
    fetchLocation();
    return () => {
      // Cleanup watch on unmount
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (location.state) {
      setFrom(location.state.from || "");
      setTo(location.state.to || "");
    }
  }, [location]);

  const handleSwap = () => {
    setFrom(to);
    setTo(from);
  };

  const handlePlan = async () => {
    if (!from || !to) return alert("Please enter both locations");
    setLoading(true);
    try {
      const cityCoords = {
        // Major Metro Cities
        "delhi": [28.6139, 77.2090], "new delhi": [28.6139, 77.2090],
        "mumbai": [19.0760, 72.8777], "bombay": [19.0760, 72.8777],
        "bangalore": [12.9716, 77.5946], "bengaluru": [12.9716, 77.5946],
        "hyderabad": [17.3850, 78.4867],
        "chennai": [13.0827, 80.2707], "madras": [13.0827, 80.2707],
        "kolkata": [22.5726, 88.3639], "calcutta": [22.5726, 88.3639],
        "pune": [18.5204, 73.8567], "poona": [18.5204, 73.8567],
        "ahmedabad": [23.0225, 72.5714],
        "surat": [21.1702, 72.8311],

        // Madhya Pradesh
        "bhopal": [23.2599, 77.4126],
        "indore": [22.7196, 75.8577],
        "jabalpur": [23.1815, 79.9864],
        "gwalior": [26.2183, 78.1828],
        "ujjain": [23.1793, 75.7849],
        "sagar": [23.8388, 78.7378],
        "rewa": [24.5362, 81.3037],
        "satna": [24.6005, 80.8322],
        "khajuraho": [24.8518, 79.9199],
        "orchha": [25.3518, 78.6400],
        "hoshangabad": [22.7519, 77.7265],
        "itarsi": [22.6150, 77.7650],
        "damoh": [23.8333, 79.4333],
        "chhatarpur": [24.9173, 79.5940],
        "tikamgarh": [24.7426, 78.8302],
        "vidisha": [23.5251, 77.8143],
        "raisen": [23.3300, 77.7900],
        "mandsaur": [24.0773, 75.0680],
        "ratlam": [23.3315, 75.0367],
        "morena": [26.4967, 77.9969],
        "bhind": [26.5593, 78.7870],
        "shivpuri": [25.4279, 77.6643],
        "dewas": [22.9676, 76.0512],
        "chhindwara": [22.0573, 78.9389],
        "betul": [21.9016, 77.8972],
        "khandwa": [21.8270, 76.3520],
        "burhanpur": [21.3037, 76.2297],
        "katni": [23.8303, 80.3963],
        "panna": [24.7179, 80.1858],
        "banda": [25.4780, 80.3370],

        // Uttar Pradesh
        "lucknow": [26.8467, 80.9462],
        "kanpur": [26.4499, 80.3319],
        "agra": [27.1767, 78.0081],
        "varanasi": [25.3176, 82.9739], "banaras": [25.3176, 82.9739],
        "allahabad": [25.4358, 81.8463], "prayagraj": [25.4358, 81.8463],
        "meerut": [28.9845, 77.7064],
        "ghaziabad": [28.6692, 77.4538],
        "noida": [28.5355, 77.3910],
        "mathura": [27.4924, 77.6737],
        "vrindavan": [27.5794, 77.6961],
        "ayodhya": [26.7922, 82.1998],
        "faizabad": [26.7922, 82.1998],
        "gorakhpur": [26.7605, 83.3731],
        "moradabad": [28.8386, 78.7733],
        "aligarh": [27.8974, 78.0880],
        "bareilly": [28.3670, 79.4304],
        "jhansi": [25.4484, 78.5685],
        "ghazipur": [25.5780, 83.5764],
        "rampur": [28.7892, 79.0048],
        "muzaffarnagar": [29.4726, 77.7085],
        "firozabad": [27.1591, 78.3957],
        "saharanpur": [29.9641, 77.5461],
        "sultanpur": [26.2617, 82.0710],

        // Rajasthan
        "jaipur": [26.9124, 75.7873],
        "jodhpur": [26.2389, 73.0243],
        "udaipur": [24.5854, 73.7125],
        "kota": [25.2138, 75.8648],
        "bikaner": [28.0229, 73.3119],
        "ajmer": [26.4499, 74.6399],
        "bharatpur": [27.2152, 77.4938],
        "alwar": [27.5530, 76.6346],
        "sikar": [27.6094, 75.1399],
        "pushkar": [26.4898, 74.5511],
        "mount abu": [24.5926, 72.7156],
        "chittorgarh": [24.8887, 74.6269],

        // Maharashtra
        "nagpur": [21.1458, 79.0882],
        "nashik": [19.9975, 73.7898],
        "aurangabad": [19.8762, 75.3433],
        "solapur": [17.6599, 75.9064],
        "kolhapur": [16.7050, 74.2433],
        "amravati": [20.9374, 77.7796],
        "nanded": [19.1383, 77.3210],
        "jalgaon": [21.0077, 75.5626],
        "akola": [20.7002, 77.0082],
        "latur": [18.4088, 76.5604],

        // Gujarat
        "vadodara": [22.3072, 73.1812], "baroda": [22.3072, 73.1812],
        "rajkot": [22.3039, 70.8022],
        "bhavnagar": [21.7645, 72.1519],
        "jamnagar": [22.4707, 70.0577],
        "anand": [22.5645, 72.9289],
        "gandhinagar": [23.2156, 72.6369],
        "dwarka": [22.2394, 68.9678],
        "somnath": [20.8879, 70.4015],

        // Punjab & Haryana
        "amritsar": [31.6340, 74.8723],
        "ludhiana": [30.9010, 75.8573],
        "jalandhar": [31.3260, 75.5762],
        "chandigarh": [30.7333, 76.7794],
        "patiala": [30.3398, 76.3869],
        "bathinda": [30.2110, 74.9455],
        "gurugram": [28.4595, 77.0266], "gurgaon": [28.4595, 77.0266],
        "faridabad": [28.4089, 77.3178],
        "panipat": [29.3909, 76.9635],
        "ambala": [30.3782, 76.7767],
        "kurukshetra": [29.9695, 76.8783],

        // Bihar & Jharkhand
        "patna": [25.5941, 85.1376],
        "gaya": [24.7955, 85.0002],
        "muzaffarpur": [26.1197, 85.3910],
        "ranchi": [23.3441, 85.3096],
        "jamshedpur": [22.8046, 86.2029],
        "dhanbad": [23.7957, 86.4304],
        "bokaro": [23.6693, 86.1511],

        // Odisha
        "bhubaneswar": [20.2961, 85.8245],
        "cuttack": [20.4625, 85.8828],
        "puri": [19.8135, 85.8312],
        "rourkela": [22.2604, 84.8536],

        // Chhattisgarh
        "raipur": [21.2514, 81.6296],
        "bilaspur": [22.0797, 82.1391],
        "durg": [21.1904, 81.2849],
        "jagdalpur": [19.0699, 82.0182],

        // Himachal Pradesh & Uttarakhand
        "shimla": [31.1048, 77.1734],
        "manali": [32.2396, 77.1887],
        "dharamshala": [32.2190, 76.3234],
        "dehradun": [30.3165, 78.0322],
        "haridwar": [29.9457, 78.1642],
        "rishikesh": [30.0869, 78.2676],
        "nainital": [29.3803, 79.4636],
        "mussoorie": [30.4598, 78.0664],

        // South India
        "mysuru": [12.2958, 76.6394], "mysore": [12.2958, 76.6394],
        "mangaluru": [12.9141, 74.8560], "mangalore": [12.9141, 74.8560],
        "hubli": [15.3647, 75.1240], "dharwad": [15.4589, 75.0078],
        "belgaum": [15.8497, 74.4977], "belagavi": [15.8497, 74.4977],
        "coimbatore": [11.0168, 76.9558],
        "madurai": [9.9252, 78.1198],
        "tiruchirappalli": [10.7905, 78.7047], "trichy": [10.7905, 78.7047],
        "tirupati": [13.6288, 79.4192],
        "vijayawada": [16.5062, 80.6480],
        "visakhapatnam": [17.6868, 83.2185], "vizag": [17.6868, 83.2185],
        "warangal": [17.9784, 79.5941],
        "thiruvananthapuram": [8.5241, 76.9366], "trivandrum": [8.5241, 76.9366],
        "kochi": [9.9312, 76.2673], "cochin": [9.9312, 76.2673],
        "kozhikode": [11.2588, 75.7804], "calicut": [11.2588, 75.7804],

        // Northeast
        "guwahati": [26.1445, 91.7362],
        "shillong": [25.5788, 91.8933],
        "imphal": [24.8170, 93.9368],
        "agartala": [23.8315, 91.2868],
        "itanagar": [27.0844, 93.6053],
        "aizawl": [23.7307, 92.7173],
        "kohima": [25.6751, 94.1086],
        "gangtok": [27.3389, 88.6065],

        // Jammu & Kashmir
        "srinagar": [34.0837, 74.7973],
        "jammu": [32.7266, 74.8570],
        "leh": [34.1526, 77.5771],
      };

      let start = userLocation ? [...userLocation] : null;
      if (!start || (from && from.toLowerCase() !== "my current location")) {
        const fromKey = from.toLowerCase().trim();
        const startCity = cityCoords[fromKey];
        if (startCity) {
          start = startCity;
        } else {
          try {
            const resStart = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(from + ", India")}&limit=1`);
            const dataStart = await resStart.json();
            if (dataStart && dataStart.length > 0) {
              start = [parseFloat(dataStart[0].lat), parseFloat(dataStart[0].lon)];
            } else {
              throw new Error(`Could not geocode start: "${from}"`);
            }
          } catch (e) {
            alert(`Could not find location: "${from}". Please try a different name.`);
            setLoading(false);
            return;
          }
        }
      }
      
      let end = null;
      const toKey = to.toLowerCase().trim();
      const endCity = cityCoords[toKey];
      if (endCity) {
        end = endCity;
      } else {
        try {
          const resEnd = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(to + ", India")}&limit=1`);
          const dataEnd = await resEnd.json();
          if (dataEnd && dataEnd.length > 0) {
            end = [parseFloat(dataEnd[0].lat), parseFloat(dataEnd[0].lon)];
          } else {
            throw new Error(`Could not geocode destination: "${to}"`);
          }
        } catch (e) {
          alert(`Could not find destination: "${to}". Please try a different name.`);
          setLoading(false);
          return;
        }
      }

      // 2. Fetch Plan from Backend
      const res = await api.post("/trips/plan", {
        startLat: start[0],
        startLng: start[1],
        endLat: end[0],
        endLng: end[1],
        vehicleRangeKm: selectedVehicle.rangeKm,
        currentChargePct: parseInt(battery)
      });

      setResult(res.data);
      setEndCoords(end);
      
      // 3. Fetch Road-accurate coordinates from OSRM
      const chargingStops = res.data.chargingStops || [];
      const validStops = chargingStops.filter(s => s && s.lat && s.lng);
      const points = [start, ...validStops.map(s => [s.lat, s.lng]), end];
      const waypoints = points.filter(p => p && p[0] && p[1]).map(p => `${p[1]},${p[0]}`).join(';');
      const osrmRes = await fetch(`https://router.project-osrm.org/route/v1/driving/${waypoints}?overview=full&geometries=geojson`);
      const osrmData = await osrmRes.json();
      
      if (osrmData.routes && osrmData.routes[0]) {
        const roadCoords = osrmData.routes[0].geometry.coordinates.map(c => [c[1], c[0]]);
        setRouteCoordinates(roadCoords);
      } else {
        setRouteCoordinates(points);
      }

      // 4. Start polling stations for offline detection (Dynamic Rerouting)
      const pollInterval = setInterval(async () => {
        if (!res.data.chargingStops || res.data.chargingStops.length === 0) { clearInterval(pollInterval); return; }
        try {
          for (const stop of res.data.chargingStops) {
            if (!stop.id) continue;
            const statusRes = await fetch(`${import.meta.env.VITE_API_BASE_URL}/stations/${stop.id}`);
            const stationData = await statusRes.json();
            if (stationData.status === "offline") {
              clearInterval(pollInterval);
              setRerouteAlert(`⚠️ "${stop.name}" went offline. Rerouting...`);
              setTimeout(() => setRerouteAlert(null), 5000);
              // Trigger reroute from start
              const rerouteRes = await tripService.reroute({
                currentLat: start[0], currentLng: start[1],
                endLat: end[0], endLng: end[1],
                excludeStationId: stop.id, vehicleRangeKm: 350
              });
              setResult(rerouteRes.data);
              break;
            }
          }
        } catch (e) { /* silent fail on poll */ }
      }, 60000);

    } catch (err) {
      console.error("Trip planning failed:", err);
      alert("Planning failed. Try cities like Bhopal, Indore, Delhi, or Mumbai.");
    } finally {
      setLoading(false);
    }
  };

  const vehicles = [
    // Tata Motors
    { brand: "Tata", name: "Nexon EV", range: "453km", rangeKm: 453 },
    { brand: "Tata", name: "Punch EV", range: "315km", rangeKm: 315 },
    { brand: "Tata", name: "Tiago EV", range: "250km", rangeKm: 250 },
    { brand: "Tata", name: "Tigor EV", range: "315km", rangeKm: 315 },
    { brand: "Tata", name: "Curvv EV", range: "502km", rangeKm: 502 },
    { brand: "Tata", name: "Harrier EV", range: "500km", rangeKm: 500 },
    
    // Mahindra
    { brand: "Mahindra", name: "XUV400", range: "456km", rangeKm: 456 },
    { brand: "Mahindra", name: "BE 6", range: "450km", rangeKm: 450 },
    { brand: "Mahindra", name: "XEV 9e", range: "500km", rangeKm: 500 },
    { brand: "Mahindra", name: "XEV 9S", range: "500km", rangeKm: 500 },
    
    // MG Motor
    { brand: "MG", name: "Comet EV", range: "230km", rangeKm: 230 },
    { brand: "MG", name: "Windsor EV", range: "331km", rangeKm: 331 },
    { brand: "MG", name: "ZS EV", range: "461km", rangeKm: 461 },
    { brand: "MG", name: "Cyberster", range: "500km", rangeKm: 500 },
    { brand: "MG", name: "M9", range: "540km", rangeKm: 540 },
    
    // Hyundai
    { brand: "Hyundai", name: "Creta EV", range: "450km", rangeKm: 450 },
    { brand: "Hyundai", name: "Ioniq 5", range: "631km", rangeKm: 631 },
    
    // Kia
    { brand: "Kia", name: "EV6", range: "708km", rangeKm: 708 },
    { brand: "Kia", name: "EV9", range: "541km", rangeKm: 541 },
    { brand: "Kia", name: "Carens EV", range: "450km", rangeKm: 450 },
    
    // Maruti Suzuki
    { brand: "Maruti", name: "e Vitara", range: "500km", rangeKm: 500 },
    
    // BYD
    { brand: "BYD", name: "Atto 3", range: "521km", rangeKm: 521 },
    { brand: "BYD", name: "e6", range: "520km", rangeKm: 520 },
    { brand: "BYD", name: "Seal", range: "650km", rangeKm: 650 },
    { brand: "BYD", name: "eMAX 7", range: "530km", rangeKm: 530 },
    
    // Mercedes-Benz
    { brand: "Mercedes", name: "EQB", range: "423km", rangeKm: 423 },
    { brand: "Mercedes", name: "EQE SUV", range: "550km", rangeKm: 550 },
    { brand: "Mercedes", name: "EQS", range: "857km", rangeKm: 857 },
    { brand: "Mercedes", name: "G580 EQ", range: "450km", rangeKm: 450 },
    
    // BMW
    { brand: "BMW", name: "i4", range: "590km", rangeKm: 590 },
    { brand: "BMW", name: "i5", range: "516km", rangeKm: 516 },
    { brand: "BMW", name: "i7", range: "625km", rangeKm: 625 },
    { brand: "BMW", name: "iX", range: "425km", rangeKm: 425 },
    
    // Audi
    { brand: "Audi", name: "Q8 e-tron", range: "582km", rangeKm: 582 },
    { brand: "Audi", name: "e-tron GT", range: "500km", rangeKm: 500 },
    
    // Volvo
    { brand: "Volvo", name: "XC40 Recharge", range: "418km", rangeKm: 418 },
    { brand: "Volvo", name: "C40 Recharge", range: "530km", rangeKm: 530 },
    
    // Porsche
    { brand: "Porsche", name: "Taycan", range: "484km", rangeKm: 484 },
    
    // Tesla
    { brand: "Tesla", name: "Model Y", range: "533km", rangeKm: 533 },
    
    // VinFast
    { brand: "VinFast", name: "VF 6", range: "400km", rangeKm: 400 },
    { brand: "VinFast", name: "VF 7", range: "450km", rangeKm: 450 },
    
    // Citroen
    { brand: "Citroen", name: "eC3", range: "320km", rangeKm: 320 },
    
    // Rolls-Royce
    { brand: "Rolls-Royce", name: "Spectre", range: "530km", rangeKm: 530 },
  ];

  const brands = [...new Set(vehicles.map(v => v.brand))];
  const selectedVehicle = vehicles.find(v => v.name === vehicle) || vehicles[0];

  return (
    <div className="min-h-screen bg-slate-50 pt-6 pb-20 overflow-x-hidden">
      {/* REROUTE ALERT TOAST */}
      <AnimatePresence>
        {rerouteAlert && (
          <motion.div
            initial={{ opacity: 0, y: -60 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -60 }}
            className="fixed top-20 left-1/2 -translate-x-1/2 z-[9999] bg-amber-500 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 font-bold"
          >
            <AlertCircle size={20} />
            {rerouteAlert}
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-w-7xl mx-auto px-4 md:px-6">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-12">
          <div>
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tighter">
              CHRG<span className="text-green-500">PLANNER</span>
            </h1>
            <p className="text-slate-500 font-medium mt-2">Smart highway navigation for electric vehicles</p>
          </div>
          <div className="mt-4 md:mt-0 flex gap-3">
            <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 flex items-center gap-2 shadow-sm">
              <ShieldCheck className="text-green-500" size={18} />
              <span className="text-sm font-bold text-slate-700">Safe Route Enabled</span>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-start">
          
          {/* LEFT: INPUT PANEL */}
          <div className="lg:col-span-4 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] p-8 shadow-xl shadow-slate-200/50 border border-slate-100"
            >
              <h2 className="text-2xl font-black text-slate-900 mb-6">Trip Details</h2>
              
              <div className="space-y-4 relative">
                {/* START */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                    <MapPin size={18} />
                  </div>
                  <input
                    type="text"
                    value={from}
                    onChange={(e) => setFrom(e.target.value)}
                    placeholder="Starting point"
                    className="w-full pl-16 pr-4 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>

                <div className="flex justify-center -my-3 relative z-10">
                  <button 
                    onClick={handleSwap}
                    className="w-10 h-10 bg-white border border-slate-200 rounded-full flex items-center justify-center text-slate-400 hover:text-green-500 hover:rotate-180 transition-all shadow-md"
                  >
                    <ArrowLeftRight size={18} />
                  </button>
                </div>

                {/* END */}
                <div className="relative">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 w-8 h-8 bg-blue-50 rounded-xl flex items-center justify-center text-blue-500">
                    <Navigation size={18} />
                  </div>
                  <input
                    type="text"
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="Destination"
                    className="w-full pl-16 pr-4 py-5 bg-slate-50 border-none rounded-2xl font-bold text-slate-700 focus:ring-2 focus:ring-green-500 outline-none transition-all"
                  />
                </div>
              </div>

              {/* VEHICLE SELECTOR */}
              <div className="mt-8">
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4">Select Vehicle</p>
                <div className="max-h-[300px] overflow-y-auto pr-2 space-y-6 custom-scrollbar">
                  {brands.map(brand => (
                    <div key={brand}>
                      <h3 className="text-xs font-black text-slate-400 uppercase tracking-wider mb-2 sticky top-0 bg-white py-1">{brand}</h3>
                      <div className="grid grid-cols-1 gap-2">
                        {vehicles.filter(v => v.brand === brand).map((v) => (
                          <button
                            key={v.name}
                            onClick={() => setVehicle(v.name)}
                            className={`p-4 rounded-2xl border-2 text-left transition-all flex items-center gap-4 ${
                              vehicle === v.name 
                                ? "border-green-500 bg-green-50" 
                                : "border-slate-50 bg-slate-50 hover:border-slate-200"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${vehicle === v.name ? "bg-green-500 text-white" : "bg-white text-slate-400 shadow-sm"}`}>
                              <Car size={20} />
                            </div>
                            <div className="flex-1">
                              <p className={`font-black text-sm ${vehicle === v.name ? "text-slate-900" : "text-slate-600"}`}>{v.name}</p>
                              <p className="text-[10px] text-slate-400 font-bold">Range: {v.range}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* BATTERY SLIDER */}
              <div className="mt-8">
                <div className="flex justify-between items-end mb-4">
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Initial Battery</p>
                  <span className="text-2xl font-black text-green-600">{battery}%</span>
                </div>
                <div className="relative h-6 flex items-center">
                   <div className="absolute w-full h-2 bg-slate-100 rounded-full"></div>
                   <div className="absolute h-2 bg-green-500 rounded-full" style={{ width: `${battery}%` }}></div>
                   <input
                     type="range"
                     min="10" max="100"
                     value={battery}
                     onChange={(e) => setBattery(e.target.value)}
                     className="absolute w-full appearance-none bg-transparent cursor-pointer z-20 accent-green-600"
                   />
                </div>
              </div>

              <button
                onClick={handlePlan}
                disabled={loading}
                className="mt-10 w-full py-5 bg-slate-900 text-white rounded-2xl font-black text-lg shadow-2xl shadow-slate-900/20 hover:bg-black transition-all flex items-center justify-center gap-3 disabled:opacity-50"
              >
                {loading ? (
                  <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <>Calculate Route <ChevronRight size={20} /></>
                )}
              </button>
            </motion.div>
          </div>

          {/* RIGHT: MAP & RESULTS */}
          <div className="lg:col-span-8 space-y-6">
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="bg-white rounded-[32px] overflow-hidden shadow-xl shadow-slate-200/50 border border-slate-100 relative h-[380px] sm:h-[480px] lg:h-[600px]"
            >
               <div className="absolute top-6 left-6 z-[1000] flex flex-wrap gap-2">
                 <div className="bg-white/90 backdrop-blur-md px-4 py-2 rounded-2xl shadow-lg border border-slate-100 flex items-center gap-2">
                   <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                   <span className="text-xs font-black text-slate-900 uppercase">Live Map</span>
                 </div>

                 {locationStatus === "denied" && (
                   <button
                     onClick={fetchLocation}
                     className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-xs font-bold text-red-500 border border-red-200 px-3 py-2 rounded-2xl shadow-lg hover:bg-red-50 transition"
                   >
                     🔒 Location blocked — Tap to retry
                   </button>
                 )}
                 {locationStatus === "loading" && (
                   <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-xs font-bold text-green-600 border border-green-100 px-3 py-2 rounded-2xl shadow-lg">
                     <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                     Locating...
                   </div>
                 )}
                 {locationStatus === "success" && (
                   <div className="flex items-center gap-1.5 bg-white/90 backdrop-blur-md text-xs font-bold text-green-600 border border-green-100 px-3 py-2 rounded-2xl shadow-lg">
                     📍 Live location
                   </div>
                 )}
               </div>

              <MapContainer
                center={userLocation || [20.5937, 78.9629]}
                zoom={userLocation ? 12 : 5}
                className="w-full h-full z-0"
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                <MapRecenter center={routeCoordinates.length > 0 ? routeCoordinates[0] : userLocation} />

                {/* USER LOCATION */}
                {userLocation && userLocation[0] && userLocation[1] && (
                  <Marker position={userLocation} icon={userIcon}>
                    <Popup className="custom-popup">
                      <p className="font-black">You are here</p>
                    </Popup>
                  </Marker>
                )}

                {/* START POINT (If not my location) */}
                {routeCoordinates.length > 0 && routeCoordinates[0] && from.toLowerCase() !== "my current location" && (
                  <Marker position={routeCoordinates[0]}>
                    <Popup><p className="font-black">Start: {from}</p></Popup>
                  </Marker>
                )}

                {/* Unselected Network Stations */}
                {result?.allStations?.filter(s => s && s.lat && s.lng && !(result?.chargingStops || []).some(stop => stop.id === s.id)).map((station, i) => (
                  <Marker key={`network-${i}`} position={[station.lat, station.lng]} icon={unselectedStationIcon}>
                    <Tooltip direction="top" offset={[0, -35]} opacity={1} className="font-bold text-xs bg-white text-gray-900 border-none shadow-lg rounded-xl px-3 py-1.5">
                      {station.name || station.location}
                    </Tooltip>
                    <Popup className="premium-popup">
                      <div className="p-2 min-w-[100px]">
                        <h4 className="font-black text-slate-900 text-sm leading-tight">{station.name || station.location}</h4>
                        <p className="text-xs text-slate-500 mt-1">Available Station</p>
                      </div>
                    </Popup>
                  </Marker>
                ))}

                {/* Calculated Route Charging Stops */}
                {result?.chargingStops?.map((stop, i) => {
                  if (!stop || stop.warning || !stop.lat || !stop.lng) return null;
                  return (
                    <Marker key={`stop-${i}`} position={[stop.lat, stop.lng]} icon={premiumStationIcon}>
                      <Tooltip direction="top" offset={[0, -35]} opacity={1} className="font-bold text-xs bg-white text-gray-900 border-none shadow-lg rounded-xl px-3 py-1.5">
                        {stop.name || stop.location}
                      </Tooltip>
                      <Popup className="premium-popup">
                        <div className="p-3 min-w-[180px]">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center text-white">
                              <Zap size={16} />
                            </div>
                            <h4 className="font-black text-slate-900 text-sm leading-tight">{stop.name || stop.location}</h4>
                          </div>
                          
                          <div className="space-y-2 border-t border-slate-100 pt-3">
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-slate-400 uppercase">Distance</span>
                              <span className="font-black text-slate-700">{stop.distFromCurrent || "0"} km</span>
                            </div>
                            <div className="flex justify-between items-center text-[10px]">
                              <span className="font-bold text-slate-400 uppercase">Type</span>
                              <span className="font-black text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">{stop.type || "DC Fast"}</span>
                            </div>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-3 italic line-clamp-1">{stop.address}</p>
                        </div>
                      </Popup>
                    </Marker>
                  );
                })}

                {/* DESTINATION */}
                {routeCoordinates.length > 1 && routeCoordinates[routeCoordinates.length - 1] && (
                  <Marker position={routeCoordinates[routeCoordinates.length - 1]}>
                    <Popup><p className="font-black">Destination: {to}</p></Popup>
                  </Marker>
                )}

                {/* ROUTE POLYLINE */}
                {routeCoordinates.length > 1 && (
                  <Polyline
                    positions={routeCoordinates}
                    pathOptions={{
                      color: "#22c55e",
                      weight: 8,
                      opacity: 0.8,
                      lineJoin: 'round'
                    }}
                  />
                )}
              </MapContainer>
            </motion.div>

            {/* RESULTS SECTION */}
            <AnimatePresence>
              {result && (
                <motion.div
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 30 }}
                  className="bg-slate-900 rounded-[32px] p-8 text-white shadow-2xl"
                >
                  <div className="flex items-center justify-between mb-8">
                    <h3 className="text-2xl font-black">Trip Overview</h3>
                    <div className="bg-green-500/20 text-green-400 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest border border-green-500/30">
                      Optimized Route
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { icon: RouteIcon, label: "Total Distance", value: `${result.totalDistance} km` },
                      { icon: BatteryCharging, label: "Charge Needed", value: `${result.stopsNeeded} Stops` },
                      { icon: Clock3, label: "Est. Duration", value: `${(result.totalDistance / 60).toFixed(1)} hrs` },
                      { icon: Zap, label: "Arrival Charge", value: `${result.expectedArrivalChargePct || 0}%` },
                    ].map((stat, i) => (
                      <div key={i} className="bg-white/5 rounded-2xl p-5 border border-white/10">
                        <stat.icon className="text-green-500 mb-3" size={24} />
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        <p className="text-xl font-black mt-1">{stat.value}</p>
                      </div>
                    ))}
                  </div>

                  {result?.chargingStops?.length > 0 ? (
                    <div className="mt-8 pt-8 border-t border-white/10">
                      <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-6">Charging Schedule</h4>
                      <div className="space-y-4">
                        {result.chargingStops.map((stop, i) => (
                          <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl ${stop.warning ? "bg-red-500/20 border border-red-500/30" : "bg-white/5"}`}>
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${stop.warning ? "bg-red-500 text-white" : "bg-green-500 text-slate-900"}`}>
                              {stop.warning ? <AlertCircle size={20} /> : <Zap size={20} />}
                            </div>
                            <div className="flex-1">
                              {stop.warning ? (
                                <p className="font-bold text-red-400">{stop.warning}</p>
                              ) : (
                                <>
                                  <p className="font-black">{stop.name || stop.location}</p>
                                  <p className="text-xs text-slate-400">Available station along route</p>
                                </>
                              )}
                            </div>
                            {!stop.warning && (
                              <div className="text-right">
                                <p className="text-xs font-bold text-green-500 uppercase">Stop {i + 1}</p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-8 pt-8 border-t border-white/10 flex items-center gap-3 text-green-400 bg-green-400/10 p-4 rounded-2xl">
                      <AlertCircle size={20} />
                      <p className="text-sm font-bold">Direct route possible! No charging stops required.</p>
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TripPlanner;