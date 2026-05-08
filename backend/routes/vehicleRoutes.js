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

module.exports = router;
