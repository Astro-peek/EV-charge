const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStations() {
  const stations = await prisma.station.findMany();
  console.log(`Total stations: ${stations.length}`);
  stations.forEach(s => console.log(`${s.name}: ${s.lat}, ${s.lng}`));
  process.exit(0);
}

checkStations();
