const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const res = await prisma.$queryRaw`SELECT pg_get_constraintdef(oid) FROM pg_constraint WHERE conname = 'stations_type_check'`;
        console.log(res);
    } catch (err) {
        console.error("Error:", err);
    }
}
check();
