const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

/**
 * GET /api/queue/:stationId
 * Returns live, active bookings for a station (the "queue").
 */
router.get('/:stationId', async (req, res) => {
    try {
        const now = new Date();
        const twoHoursFromNow = new Date(now.getTime() + 2 * 60 * 60 * 1000);

        const queue = await prisma.booking.findMany({
            where: {
                station_id: req.params.stationId,
                status: { in: ['active', 'pending'] },
                start_time: { lte: twoHoursFromNow }
            },
            include: { users: { select: { email: true, raw_user_meta_data: true } } },
            orderBy: { start_time: 'asc' }
        });

        // Calculate remaining minutes for active bookings
        const enriched = queue.map(booking => {
            const endTime = new Date(booking.end_time);
            const remainingMs = endTime - now;
            const remainingMinutes = Math.max(0, Math.floor(remainingMs / 60000));
            const isActive = booking.status === 'active' && new Date(booking.start_time) <= now;

            return {
                ...booking,
                remainingMinutes,
                isCurrentlyCharging: isActive,
                userName: booking.users?.raw_user_meta_data?.full_name || booking.users?.email || 'Guest'
            };
        });

        res.json({
            stationId: req.params.stationId,
            queueLength: enriched.length,
            currentlyCharging: enriched.filter(b => b.isCurrentlyCharging).length,
            queue: enriched
        });
    } catch (err) {
        console.error('Queue fetch error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * PATCH /api/queue/complete/:bookingId
 * Host marks a booking as completed, freeing the slot.
 */
router.patch('/complete/:bookingId', async (req, res) => {
    try {
        const updated = await prisma.booking.update({
            where: { id: req.params.bookingId },
            data: { status: 'completed' }
        });
        res.json({ success: true, booking: updated });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/queue/occupancy/:stationId
 * Quick occupancy check for the FindAndBook page.
 */
router.get('/occupancy/:stationId', async (req, res) => {
    try {
        const now = new Date();
        const active = await prisma.booking.count({
            where: {
                station_id: req.params.stationId,
                status: 'active',
                start_time: { lte: now },
                end_time: { gte: now }
            }
        });
        res.json({ stationId: req.params.stationId, activeCount: active });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
