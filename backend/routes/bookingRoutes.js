const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Get all bookings (optionally filter by user)
router.get('/', async (req, res) => {
    try {
        const { userId } = req.query;
        const query = userId ? { where: { user_id: userId } } : {};
        const bookings = await prisma.booking.findMany({
            ...query,
            include: { station: true }
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Create a booking
router.post('/', async (req, res) => {
    try {
        const newBooking = await prisma.booking.create({
            data: {
                user_id: req.body.user_id,
                station_id: req.body.station_id,
                start_time: new Date(req.body.start_time),
                end_time: new Date(req.body.end_time),
                status: req.body.status || 'pending',
                total_amount: req.body.total_amount,
                units_consumed: req.body.units_consumed || 0,
                payment_id: req.body.payment_id,
                vehicle_id: req.body.vehicle_id
            }
        });
        res.status(201).json(newBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Update booking status
router.patch('/:id/status', async (req, res) => {
    try {
        const updatedBooking = await prisma.booking.update({
            where: { id: req.params.id },
            data: { status: req.body.status }
        });
        res.json(updatedBooking);
    } catch (err) {
        res.status(400).json({ message: err.message });
    }
});

// Get all bookings for a host's stations
router.get('/host/:hostId', async (req, res) => {
    try {
        const hostStations = await prisma.station.findMany({
            where: { host_id: req.params.hostId },
            select: { id: true }
        });
        const stationIds = hostStations.map(s => s.id);
        const bookings = await prisma.booking.findMany({
            where: { station_id: { in: stationIds } },
            include: { station: true },
            orderBy: { start_time: 'desc' },
            take: 50
        });
        res.json(bookings);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
