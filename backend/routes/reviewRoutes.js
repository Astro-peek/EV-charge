const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// POST /api/reviews — submit a rating + feedback for a completed booking
router.post('/', async (req, res) => {
    try {
        const { booking_id, station_id, user_id, rating, feedback } = req.body;

        if (!booking_id || !station_id || !user_id || !rating) {
            return res.status(400).json({ message: 'booking_id, station_id, user_id, and rating are required.' });
        }
        if (rating < 1 || rating > 5) {
            return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
        }

        // Ensure booking is completed and belongs to this user
        const booking = await prisma.booking.findUnique({ where: { id: booking_id } });
        if (!booking) return res.status(404).json({ message: 'Booking not found.' });
        if (booking.user_id !== user_id) return res.status(403).json({ message: 'Not your booking.' });
        if (booking.status !== 'completed') return res.status(400).json({ message: 'You can only review completed rides.' });

        // Upsert so the user cannot double-submit
        const review = await prisma.review.upsert({
            where: { booking_id },
            update: { rating, feedback: feedback || null },
            create: { booking_id, station_id, user_id, rating, feedback: feedback || null },
        });

        res.status(201).json(review);
    } catch (err) {
        console.error('Review POST error:', err);
        res.status(500).json({ message: err.message });
    }
});

// GET /api/reviews/station/:stationId — all reviews for a station (for host)
router.get('/station/:stationId', async (req, res) => {
    try {
        const reviews = await prisma.review.findMany({
            where: { station_id: req.params.stationId },
            orderBy: { createdAt: 'desc' },
        });

        const avgRating = reviews.length
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
            : null;

        res.json({ reviews, avgRating, total: reviews.length });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// GET /api/reviews/booking/:bookingId — check if a review exists for a booking
router.get('/booking/:bookingId', async (req, res) => {
    try {
        const review = await prisma.review.findUnique({
            where: { booking_id: req.params.bookingId },
        });
        res.json(review || null);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
