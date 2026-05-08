const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedIndia() {
  const stations = [
    // NORTH
    { name: "Chandigarh Supercharge", lat: 30.7333, lng: 76.7794, address: "Sector 17, Chandigarh", price_per_unit: 14, power: "50kW", type: "CCS2", status: "available" },
    { name: "Lucknow Gomti EV", lat: 26.8467, lng: 80.9462, address: "Gomti Nagar, Lucknow", price_per_unit: 16, power: "30kW", type: "CCS2", status: "available" },
    { name: "Jaipur Pink City Charge", lat: 26.9124, lng: 75.7873, address: "C-Scheme, Jaipur", price_per_unit: 15, power: "25kW", type: "Type 2", status: "available" },
    
    // SOUTH
    { name: "Bangalore MG Road EV", lat: 12.9716, lng: 77.5946, address: "MG Road, Bangalore", price_per_unit: 18, power: "60kW", type: "CCS2", status: "available" },
    { name: "Hyderabad Hitech Charge", lat: 17.4483, lng: 78.3915, address: "Hitech City, Hyderabad", price_per_unit: 17, power: "50kW", type: "CCS2", status: "available" },
    { name: "Chennai Marina Hub", lat: 13.0475, lng: 80.2824, address: "Marina Beach, Chennai", price_per_unit: 16, power: "30kW", type: "Type 2", status: "available" },
    { name: "Kochi Metro Charge", lat: 9.9312, lng: 76.2673, address: "MG Road, Kochi", price_per_unit: 15, power: "25kW", type: "CCS2", status: "available" },

    // WEST
    { name: "Pune IT Park EV", lat: 18.5204, lng: 73.8567, address: "Hinjewadi, Pune", price_per_unit: 16, power: "50kW", type: "CCS2", status: "available" },
    { name: "Ahmedabad Riverfront", lat: 23.0225, lng: 72.5714, address: "Sabarmati, Ahmedabad", price_per_unit: 14, power: "30kW", type: "Type 2", status: "available" },
    { name: "Surat Diamond Charge", lat: 21.1702, lng: 72.8311, address: "Adajan, Surat", price_per_unit: 15, power: "25kW", type: "CCS2", status: "available" },

    // EAST
    { name: "Kolkata Salt Lake EV", lat: 22.5726, lng: 88.3639, address: "Sector V, Kolkata", price_per_unit: 17, power: "30kW", type: "CCS2", status: "available" },
    { name: "Bhubaneswar Smart Charge", lat: 20.2961, lng: 85.8245, address: "Janpath, Bhubaneswar", price_per_unit: 14, power: "25kW", type: "Type 2", status: "available" },
    { name: "Patna Junction EV", lat: 25.5941, lng: 85.1376, address: "Fraser Road, Patna", price_per_unit: 15, power: "25kW", type: "CCS2", status: "available" },

    // CENTRAL (More in MP)
    { name: "Jabalpur Marble Hub", lat: 23.1815, lng: 79.9864, address: "Civic Center, Jabalpur", price_per_unit: 15, power: "30kW", type: "CCS2", status: "available" },
    { name: "Gwalior Fort Point", lat: 26.2183, lng: 78.1828, address: "Gwalior Fort", price_per_unit: 16, power: "25kW", type: "Type 2", status: "available" },
    { name: "Ujjain Mahakal EV 2", lat: 23.1765, lng: 75.7885, address: "Near Temple, Ujjain", price_per_unit: 14, power: "25kW", type: "CCS2", status: "available" }
  ];

  for (const s of stations) {
    const existing = await prisma.station.findFirst({ where: { name: s.name } });
    if (existing) {
      await prisma.station.update({ where: { id: existing.id }, data: s });
    } else {
      await prisma.station.create({ data: s });
    }
  }

  console.log("Seeded India-wide stations successfully!");
  process.exit(0);
}

seedIndia();
