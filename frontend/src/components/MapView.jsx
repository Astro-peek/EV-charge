import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import { userIcon, premiumStationIcon } from "../utils/mapIcons";

// Fix default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const MapRecenter = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.flyTo(center, 14, { duration: 1.2 });
    }
  }, [center, map]);
  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState(null); // null = not yet fetched
  const [locationStatus, setLocationStatus] = useState("loading"); // loading | success | denied | unavailable
  const watchIdRef = useRef(null);

  const fetchLocation = () => {
    if (!navigator.geolocation) {
      setLocationStatus("unavailable");
      setPosition([20.5937, 78.9629]); // India centroid fallback
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
        setPosition(coords);
        setLocationStatus("success");
        // Stop watching after we get a good fix (accuracy < 500m)
        if (pos.coords.accuracy < 500 && watchIdRef.current !== null) {
          navigator.geolocation.clearWatch(watchIdRef.current);
          watchIdRef.current = null;
        }
      },
      (err) => {
        console.warn("Geolocation error:", err.code, err.message);
        if (err.code === 1) {
          // PERMISSION_DENIED
          setLocationStatus("denied");
        } else {
          setLocationStatus("unavailable");
        }
        // Use India centroid so map still renders usefully
        setPosition((prev) => prev || [20.5937, 78.9629]);
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

  // Dummy EV stations nearby
  const stations = [
    { id: 1, name: "Bhopal EV Station", position: [23.2599, 77.4126] },
    { id: 2, name: "DB Mall Charger", position: [23.2335, 77.4323] },
    { id: 3, name: "AIIMS Charging Hub", position: [23.2075, 77.4399] },
  ];

  if (!position) {
    return (
      <div className="h-full w-full rounded-2xl bg-gray-50 flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-3 border-green-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
        <p className="text-xs text-gray-500 font-medium">Fetching your location...</p>
      </div>
    );
  }

  return (
    <div className="relative h-full w-full">
      <MapContainer center={position} zoom={14} className="h-full w-full rounded-2xl" zoomControl={false}>
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
        />
        <MapRecenter center={position} />

        {/* User Location */}
        <Marker position={position} icon={userIcon}>
          <Popup>
            <div className="p-2 min-w-[100px] text-center font-bold text-slate-800">📍 You are here</div>
          </Popup>
        </Marker>

        {/* EV Stations */}
        {stations.map((station) => (
          <Marker key={station.id} position={station.position} icon={premiumStationIcon}>
            <Tooltip direction="top" offset={[0, -35]} opacity={1} className="font-bold text-xs bg-white text-gray-900 border-none shadow-lg rounded-xl px-3 py-1.5">
              {station.name}
            </Tooltip>
            <Popup>
              <div className="min-w-[160px] p-1 text-center">
                <h3 className="font-bold text-slate-800 leading-tight">{station.name}</h3>
                <p className="text-xs text-slate-500 mt-1 mb-2">Fast DC Charging</p>
                <button
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-xl font-bold transition-all shadow-md active:scale-95"
                  onClick={() => navigate("/book-slot")}
                >
                  Book Slot ⚡
                </button>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Location status badge + retry button */}
      <div className="absolute bottom-3 left-3 z-[1000] flex items-center gap-2">
        {locationStatus === "denied" && (
          <button
            onClick={fetchLocation}
            className="flex items-center gap-1.5 bg-white text-xs font-bold text-red-500 border border-red-200 px-3 py-1.5 rounded-xl shadow-md hover:bg-red-50 transition"
          >
            🔒 Location blocked — Tap to retry
          </button>
        )}
        {locationStatus === "loading" && (
          <div className="flex items-center gap-1.5 bg-white text-xs font-bold text-green-600 border border-green-100 px-3 py-1.5 rounded-xl shadow-md">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Locating you...
          </div>
        )}
        {locationStatus === "success" && (
          <div className="flex items-center gap-1.5 bg-white text-xs font-bold text-green-600 border border-green-100 px-3 py-1.5 rounded-xl shadow-md">
            📍 Live location
          </div>
        )}
      </div>
    </div>
  );
};

export default MapView;