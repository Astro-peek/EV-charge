const { Client } = require('pg');
const connectionString = "postgresql://postgres.xyujuwzrrmtflftvnfak:.7D%2Fj%23%40%2F%2Bs%40cUTN@aws-1-ap-southeast-2.pooler.supabase.com:5432/postgres";

const client = new Client({ connectionString });

async function test() {
  try {
    console.log("Connecting to direct Supabase port 5432...");
    await client.connect();
    console.log("Success! Querying tables...");
    const res = await client.query("SELECT tablename FROM pg_catalog.pg_tables WHERE schemaname = 'public'");
    console.log("Tables:", res.rows.map(r => r.tablename));
    await client.end();
  } catch (err) {
    console.error("Connection failed:", err.message);
    process.exit(1);
  }
}

test();
