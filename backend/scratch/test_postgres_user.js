const { PrismaClient } = require('@prisma/client');

// Try with 'postgres' username and direct host
const directUrl = "postgresql://postgres:.7D%2Fj%23%40%2F%2Bs%40cUTN@db.xyujuwzrrmtflftvnfak.supabase.co:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

async function test() {
  try {
    console.log("Connecting to direct Supabase host with 'postgres' username...");
    const res = await prisma.$queryRaw`SELECT 1 as result`;
    console.log("Success!", res);
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
