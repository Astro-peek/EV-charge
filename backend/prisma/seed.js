const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up old data...");
  await prisma.booking.deleteMany({});
  await prisma.station.deleteMany({});

  const stations = [
    {
      name: "Connaught Place Fast Charger",
      address: "Inner Circle, CP, New Delhi",
      lat: 28.6315,
      lng: 77.2167,
      type: "DC",
      price_per_unit: 18.5,
      connector_types: ["CCS2", "CHAdeMO"],
      status: "available"
    },
    {
      name: "Gateway of India P2P",
      address: "Apollo Bandar, Mumbai",
      lat: 18.9220,
      lng: 72.8347,
      type: "AC",
      price_per_unit: 12.0,
      connector_types: ["Type 2"],
      status: "available"
    },
    {
      name: "Indiranagar EV Hub",
      address: "100 Ft Road, Bangalore",
      lat: 12.9716,
      lng: 77.6412,
      type: "Both",
      price_per_unit: 15.0,
      connector_types: ["CCS2", "15A Socket"],
      status: "available"
    },
    {
      name: "DB City Mall Charging",
      address: "Arera Hills, Bhopal",
      lat: 23.2333,
      lng: 77.4333,
      type: "DC",
      price_per_unit: 16.0,
      connector_types: ["CCS2"],
      status: "available"
    },
    {
      name: "Vijay Nagar EV Station",
      address: "Indore, MP",
      lat: 22.7533,
      lng: 75.8937,
      type: "Both",
      price_per_unit: 14.5,
      connector_types: ["CCS2", "Type 2"],
      status: "available"
    },
    {
      name: "Dewas Industrial Hub",
      address: "AB Road, Dewas",
      lat: 22.9676,
      lng: 76.0534,
      type: "DC",
      price_per_unit: 15.5,
      connector_types: ["CCS2"],
      status: "available"
    },
    {
      name: "Mahakal Temple Parking",
      address: "Ujjain, MP",
      lat: 23.1765,
      lng: 75.7885,
      type: "AC",
      price_per_unit: 10.0,
      connector_types: ["Type 2"],
      status: "available"
    },
    {
      name: "Sehore Highway Charge",
      address: "Bhopal-Indore Road, Sehore",
      lat: 23.2032,
      lng: 77.0844,
      type: "DC",
      price_per_unit: 17.0,
      connector_types: ["CCS2"],
      status: "available"
    },
    {
      name: "Vidisha Sanchi Gateway",
      address: "Vidisha, MP",
      lat: 23.5239,
      lng: 77.8133,
      type: "AC",
      price_per_unit: 11.5,
      connector_types: ["Type 2"],
      status: "available"
    }
  ];

  console.log("🌱 Seeding stations...");
  for (const s of stations) {
    await prisma.station.create({
      data: s
    });
  }
  console.log("✅ Seeding complete!");
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
