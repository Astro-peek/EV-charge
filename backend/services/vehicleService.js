/**
 * VehicleID Protocol Service
 * Mocks the VAHAN 4.0 API for fetching Vehicle Charging Profiles (VCP)
 */

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
    // In a real app, this would call VAHAN 4.0 API
    const normalizedReg = registrationNumber.toUpperCase().replace(/\s/g, '');
    
    // Return mock data or a default profile if not found
    return VEHICLE_DATABASE[normalizedReg] || {
        model: "Generic EV",
        connector_type: "15A Socket",
        battery_capacity: "Unknown",
        max_voltage: "Unknown",
        type: "Unknown",
        note: "Vehicle not found in VAHAN mock, using default 15A profile."
    };
};

module.exports = { getVehicleProfile };
