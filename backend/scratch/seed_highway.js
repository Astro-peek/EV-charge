const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedHighway() {
  const stations = [
    { name: "Agra Expressway Fast Charge", lat: 27.1767, lng: 78.0081, address: "Fatehabad Road, Agra", price_per_unit: 18, status: "available" },
    { name: "Gwalior Bypass EV Point", lat: 26.2183, lng: 78.1828, address: "NH-44 Bypass, Gwalior", price_per_unit: 15, status: "available" },
    { name: "Jhansi Highway Hub", lat: 25.4484, lng: 78.5685, address: "Shivpuri Road, Jhansi", price_per_unit: 16, status: "available" },
    { name: "Guna Mid-Way Charge", lat: 24.6477, lng: 77.3072, address: "AB Road, Guna", price_per_unit: 17, status: "available" },
    { name: "Biaora EV Stop", lat: 23.9231, lng: 76.9150, address: "NH-52 Crossing, Biaora", price_per_unit: 15, status: "available" },
    { name: "Mathura Yamuna EV", lat: 27.4924, lng: 77.6737, address: "Yamuna Expressway, Mathura", price_per_unit: 19, status: "available" }
  ];

  for (const s of stations) {
    // Check if station exists by name
    const existing = await prisma.station.findFirst({
      where: { name: s.name }
    });

    if (existing) {
      await prisma.station.update({
        where: { id: existing.id },
        data: s
      });
    } else {
      await prisma.station.create({
        data: s
      });
    }
  }

  console.log("Seeded highway stations successfully!");
  process.exit(0);
}

seedHighway();
