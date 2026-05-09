import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState } from "react";
import L from "leaflet";

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

const MapView = () => {
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
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {/* ✅ User Location */}
      <Marker position={position}>
        <Popup>📍 You are here</Popup>
      </Marker>

      {/* ✅ EV Stations */}
      {stations.map((station) => (
        <Marker key={station.id} position={station.position}>
          <Popup>
            <div>
              <h3 className="font-bold">{station.name}</h3>
              <button
                className="mt-2 bg-green-500 text-white px-3 py-1 rounded"
                onClick={() => alert("Go to booking page")}
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