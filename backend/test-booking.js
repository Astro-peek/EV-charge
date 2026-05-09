const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:8000/api/bookings', {
            user_id: "00000000-0000-0000-0000-000000000000",
            station_id: "00000000-0000-0000-0000-000000000000",
            start_time: new Date(),
            end_time: new Date(),
            status: "pending",
            total_amount: 14.0
        });
        console.log(res.data);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}
test();
