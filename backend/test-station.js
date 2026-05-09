const axios = require('axios');

async function test() {
    try {
        const res = await axios.post('http://localhost:8000/api/stations', {
            name: "Test Dhaba",
            address: "Test Address",
            type: "Private", // trying Private instead of Dhaba
            power: "Single Phase",
            status: "available",
            price_per_unit: 14.0,
            connector_types: ["15A Socket"],
            host_id: "00000000-0000-0000-0000-000000000000"
        });
        console.log(res.data);
    } catch (err) {
        console.error("Error:", err.response?.data || err.message);
    }
}
test();
