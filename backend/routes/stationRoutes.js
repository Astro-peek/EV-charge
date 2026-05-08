const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { fetchNearbyStations } = require('../services/discoveryService');

// Get all stations (with optional filtering)
router.get('/', async (req, res) => {
    const { type, status } = req.query;
    try {
        const stations = await prisma.station.findMany({
            where: {
                ...(type && { type }),
                ...(status && { status })
            }
        });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Discovery: Fetch nearby stations (Internal + External)
router.get('/discovery', async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Lat/Lng required" });

    try {
        const internal = await prisma.station.findMany({
            where: {
                lat: { gte: parseFloat(lat) - 1, lte: parseFloat(lat) + 1 },
                lng: { gte: parseFloat(lng) - 1, lte: parseFloat(lng) + 1 }
            }
        });
        const external = await fetchNearbyStations(lat, lng);
        res.json({ internal, external });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a station
router.post('/', async (req, res) => {
    try {
        const newStation = await prisma.station.create({
            data: req.body
        });
        res.status(201).json(newStation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get station by ID
router.get('/:id', async (req, res) => {
    try {
        const station = await prisma.station.findUnique({
            where: { id: req.params.id }
        });
        if (!station) return res.status(404).json({ message: 'Station not found' });
        res.json(station);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Update a station
router.put('/:id', async (req, res) => {
    try {
        const updatedStation = await prisma.station.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(updatedStation);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Delete a station
router.delete('/:id', async (req, res) => {
    try {
        await prisma.station.delete({ where: { id: req.params.id } });
        res.json({ message: 'Station deleted successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Get stations owned by a specific host
router.get('/my', async (req, res) => {
    const { hostId } = req.query;
    if (!hostId) return res.status(400).json({ error: 'hostId required' });
    try {
        const stations = await prisma.station.findMany({
            where: { host_id: hostId },
            include: { bookings: { take: 5, orderBy: { start_time: 'desc' } } }
        });
        res.json(stations);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Toggle station status (host control)
router.patch('/:id/status', async (req, res) => {
    try {
        const { status } = req.body;
        if (!['available', 'occupied', 'offline'].includes(status)) {
            return res.status(400).json({ error: 'Invalid status. Must be: available, occupied, or offline' });
        }
        const updated = await prisma.station.update({
            where: { id: req.params.id },
            data: { status }
        });
        res.json(updated);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

module.exports = router;
