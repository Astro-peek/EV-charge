import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from "react-leaflet";
import { useEffect, useState } from "react";
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
      map.flyTo(center, 13, { duration: 1.5 });
    }
  }, [center, map]);
  return null;
};

const MapView = () => {
  const navigate = useNavigate();
  const [position, setPosition] = useState([23.2599, 77.4126]); // Bhopal default

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      },
      () => {
        console.log("Location permission denied");
      }
    );
  }, []);

  // ✅ Dummy EV stations (you can later fetch from API)
  const stations = [
    {
      id: 1,
      name: "Bhopal EV Station",
      position: [23.2599, 77.4126],
    },
    {
      id: 2,
      name: "DB Mall Charger",
      position: [23.2335, 77.4323],
    },
    {
      id: 3,
      name: "AIIMS Charging Hub",
      position: [23.2075, 77.4399],
    },
  ];

  return (
    <MapContainer center={position} zoom={13} className="h-full w-full rounded-2xl">
      
      <TileLayer
        url="https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png"
      />
      <MapRecenter center={position} />

      {/* ✅ User Location */}
      <Marker position={position} icon={userIcon}>
        <Popup>
          <div className="p-2 min-w-[100px] text-center font-bold text-slate-800">📍 You are here</div>
        </Popup>
      </Marker>

      {/* ✅ EV Stations */}
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
  );
};

export default MapView;