import { useState, useEffect } from "react";

const HostDashboard = () => {
  const [host, setHost] = useState(null);
  const [chargers, setChargers] = useState([]);

  useEffect(() => {
    const savedHost = JSON.parse(localStorage.getItem("host"));
    const savedChargers = JSON.parse(localStorage.getItem("chargers")) || [];

    setHost(savedHost);
    setChargers(savedChargers);
  }, []);

  const addCharger = () => {
    const newCharger = {
      id: Date.now(),
      name: "Home Charger",
      status: "Available",
    };

    const updated = [...chargers, newCharger];

    setChargers(updated);
    localStorage.setItem("chargers", JSON.stringify(updated));
  };

  if (!host) {
    return <p className="text-center mt-20">No host found</p>;
  }

  return (
    <div className="pt-24 px-6 bg-gray-50 min-h-screen">

      <div className="max-w-6xl mx-auto">

        <h1 className="text-3xl font-bold mb-6">
          Welcome, {host.name} 👋
        </h1>

        <p className="text-gray-600 mb-8">
          Location: {host.location} | ₹{host.price}/kWh
        </p>

        <button
          onClick={addCharger}
          className="bg-primary text-white px-6 py-3 rounded-xl mb-6"
        >
          + Add Charger
        </button>

        <div className="grid md:grid-cols-3 gap-6">
          {chargers.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-2xl shadow">
              <h3 className="font-semibold">{c.name}</h3>
              <p className="text-green-600">{c.status}</p>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

export default HostDashboard;