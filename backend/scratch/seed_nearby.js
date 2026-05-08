const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seedNearby() {
  const stations = [
    { name: "Palwal Highway Junction", lat: 28.1477, lng: 77.3256, address: "NH-44, Palwal", price_per_unit: 14, status: "available" },
    { name: "Kosi Kalan EV Point", lat: 27.7915, lng: 77.4332, address: "Mathura Road, Kosi Kalan", price_per_unit: 15, status: "available" }
  ];

  for (const s of stations) {
    const existing = await prisma.station.findFirst({ where: { name: s.name } });
    if (!existing) await prisma.station.create({ data: s });
  }

  console.log("Seeded nearby stations successfully!");
  process.exit(0);
}

seedNearby();
