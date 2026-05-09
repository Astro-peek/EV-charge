const express = require('express');
const router = express.Router();
const { getVehicleProfile } = require('../services/vehicleService');

// Get Vehicle Profile by Registration Number (VehicleID Protocol)
router.get('/:regNumber', async (req, res) => {
    try {
        const profile = await getVehicleProfile(req.params.regNumber);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: "Error fetching vehicle profile" });
    }
});

// Scan QR Code (VehicleID Protocol)
router.post('/scan', async (req, res) => {
    try {
        const { regNumber } = req.body;
        if (!regNumber) {
            return res.status(400).json({ message: "Registration number (regNumber) is required" });
        }
        const profile = await getVehicleProfile(regNumber);
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: "Error processing QR scan and fetching vehicle profile", error: err.message });
    }
});

module.exports = router;
