const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function test() {
    try {
        const user = await prisma.user.findFirst();
        const station = await prisma.station.findFirst();
        
        console.log("Found User:", user?.id);
        console.log("Found Station:", station?.id);

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + 1 * 60 * 60 * 1000); 

        const bookingData = {
            user_id: user?.id,
            station_id: station?.id,
            start_time: startTime,
            end_time: endTime,
            status: 'pending',
            total_amount: 14.0,
            payment_method: 'onsite' // This is what FindAndBook sends
        };

        const res = await axios.post('http://localhost:8000/api/bookings', bookingData);
        console.log("Booking created via API:", res.data);
    } catch (err) {
        console.error("API Error:", err.response?.data || err.message);
    }
}
test();
