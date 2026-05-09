/**
 * VehicleID Protocol Service
 * Mocks the VAHAN 4.0 API for fetching Vehicle Charging Profiles (VCP)
 */
const prisma = require('../lib/prisma');

const VEHICLE_DATABASE = {
    "MH12AB1234": {
        model: "Tata Nexon EV",
        connector_type: "CCS2",
        battery_capacity: "30.2 kWh",
        max_voltage: "320V",
        type: "4W"
    },
    "DL3CDE5678": {
        model: "MG ZS EV",
        connector_type: "CCS2",
        battery_capacity: "50.3 kWh",
        max_voltage: "400V",
        type: "4W"
    },
    "KA01EF9012": {
        model: "Ola S1 Pro",
        connector_type: "5A/15A Socket",
        battery_capacity: "4 kWh",
        max_voltage: "72V",
        type: "2W"
    },
    "UP16GH3456": {
        model: "Mahindra Treo",
        connector_type: "15A Socket",
        battery_capacity: "7.37 kWh",
        max_voltage: "48V",
        type: "3W"
    }
};

const getVehicleProfile = async (registrationNumber) => {
    const normalizedReg = registrationNumber.toUpperCase().replace(/\s/g, '');
    
    // 1. Check local database first
    const existingProfile = await prisma.vehicleProfile.findUnique({
        where: { reg_number: normalizedReg }
    });

    if (existingProfile) {
        return existingProfile;
    }

    // 2. Mock calling VAHAN 4.0 API
    const vahanData = VEHICLE_DATABASE[normalizedReg] || {
        model: "Generic EV",
        connector_type: "15A Socket",
        battery_capacity: "Unknown",
        max_voltage: "Unknown",
        type: "Unknown"
    };

    // 3. Save to database for future lookups
    const newProfile = await prisma.vehicleProfile.create({
        data: {
            reg_number: normalizedReg,
            model: vahanData.model,
            connector_type: vahanData.connector_type,
            battery_capacity: vahanData.battery_capacity,
            max_voltage: vahanData.max_voltage,
            type: vahanData.type
        }
    });

    return newProfile;
};

module.exports = { getVehicleProfile };
