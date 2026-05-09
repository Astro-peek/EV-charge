const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
    try {
        const user = await prisma.user.findFirst();
        const station = await prisma.station.findFirst();
        
        console.log("User:", user?.id);
        console.log("Station:", station?.id);
        
        if (user && station) {
            const booking = await prisma.booking.create({
                data: {
                    user_id: user.id,
                    station_id: station.id,
                    start_time: new Date(),
                    end_time: new Date(Date.now() + 3600000),
                    status: 'pending',
                    total_amount: 14.0
                }
            });
            console.log("Created booking:", booking.id);
        }
    } catch (err) {
        console.error("Error:", err);
    }
}
check();
