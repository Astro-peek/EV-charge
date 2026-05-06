const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get all stations
router.get('/', async (req, res) => {
    try {
        const stations = await prisma.station.findMany();
        res.json(stations);
    } catch (err) {
        res.status(500).json({ message: err.message });
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

module.exports = router;
