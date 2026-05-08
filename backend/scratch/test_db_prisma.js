const { PrismaClient } = require('@prisma/client');

// Use direct connection URL
const directUrl = "postgresql://postgres.xyujuwzrrmtflftvnfak:.7D%2Fj%23%40%2F%2Bs%40cUTN@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: directUrl
    }
  }
});

async function test() {
  try {
    console.log("Connecting to direct Supabase port 5432 via Prisma...");
    // We can't really "connect" without a query
    const res = await prisma.$queryRaw`SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'`;
    console.log("Tables:", res.map(r => r.tablename));
  } catch (err) {
    console.error("Connection failed:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

test();
