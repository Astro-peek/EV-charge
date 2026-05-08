const express = require('express');
const router = express.Router();
const { planTrip } = require('../services/tripPlannerService');
const prisma = require('../lib/prisma');

/**
 * POST /api/trips/plan
 * Body: { startLat, startLng, endLat, endLng, vehicleRangeKm, currentChargePct }
 */
router.post('/plan', async (req, res) => {
    const { startLat, startLng, endLat, endLng, vehicleRangeKm, currentChargePct } = req.body;

    if (!startLat || !startLng || !endLat || !endLng) {
        return res.status(400).json({ error: 'startLat, startLng, endLat, endLng are all required.' });
    }

    try {
        const result = await planTrip(
            parseFloat(startLat),
            parseFloat(startLng),
            parseFloat(endLat),
            parseFloat(endLng),
            vehicleRangeKm ? parseFloat(vehicleRangeKm) : 200,
            currentChargePct ? parseFloat(currentChargePct) : 80
        );
        res.json(result);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * POST /api/trips/reroute
 * Body: { currentLat, currentLng, endLat, endLng, excludeStationId, vehicleRangeKm }
 * Re-plans from current position excluding a specific (offline) station.
 */
router.post('/reroute', async (req, res) => {
    const { currentLat, currentLng, endLat, endLng, excludeStationId, vehicleRangeKm } = req.body;

    try {
        // Mark the station as offline temporarily
        if (excludeStationId) {
            await prisma.station.update({
                where: { id: excludeStationId },
                data: { status: 'offline' }
            });
        }

        // Re-plan the trip from current position
        const result = await planTrip(
            parseFloat(currentLat),
            parseFloat(currentLng),
            parseFloat(endLat),
            parseFloat(endLng),
            vehicleRangeKm ? parseFloat(vehicleRangeKm) : 350,
            100 // Assume recharged at last stop
        );

        res.json({ ...result, rerouted: true, excludedStationId: excludeStationId });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
