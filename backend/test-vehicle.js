// test-vehicle.js
// Run this file using: node test-vehicle.js

async function runTests() {
    console.log("=====================================");
    console.log("🚗 Testing VehicleID Protocol");
    console.log("=====================================\n");

    const PORT = process.env.PORT || 8000;
    const API_URL = `http://localhost:${PORT}`;

    try {
        // Step 1: Simulate scanning a QR Code
        console.log("Step 1: Simulating QR Code Scan (Registration: MH12AB1234)...");
        const scanResponse = await fetch(`${API_URL}/api/vehicles/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ regNumber: "MH12AB1234" })
        });
        
        if (!scanResponse.ok) throw new Error("Failed to scan vehicle");
        const vehicleProfile = await scanResponse.json();
        
        console.log("✅ Scan Successful! Vehicle Profile Found:");
        console.log(vehicleProfile);
        console.log("\n-------------------------------------\n");

        // Step 2: Use the returned connector type to filter stations
        console.log(`Step 2: Searching for nearby stations compatible with: ${vehicleProfile.connector_type}`);
        
        const lat = 19.0760;
        const lng = 72.8777;
        const encodedConnector = encodeURIComponent(vehicleProfile.connector_type);
        
        const discoveryResponse = await fetch(`${API_URL}/api/stations/discovery?lat=${lat}&lng=${lng}&connector_type=${encodedConnector}`);
        
        if (!discoveryResponse.ok) throw new Error("Failed to fetch stations");
        const stations = await discoveryResponse.json();
        
        console.log("✅ Discovery Successful! Internal Database returned:");
        console.log(`Found ${stations.internal.length} compatible station(s) in Intelliride DB.`);
        
        if (stations.internal.length > 0) {
            console.log(stations.internal);
        } else {
            console.log("No stations found. You can add a station with this connector type via POST /api/stations to see it here!");
        }

    } catch (error) {
        console.error("❌ Test Failed:", error.message);
        console.log("Make sure your backend server is running! (Run 'npm run dev' or 'node index.js')");
    }
}

runTests();
