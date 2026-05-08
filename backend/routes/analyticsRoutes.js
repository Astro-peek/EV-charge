const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

/**
 * GET /api/analytics/wait-time/:stationId
 * Returns predicted wait times by hour of day based on historical booking data.
 */
router.get('/wait-time/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;

        // Get last 30 days of bookings for this station
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

        const bookings = await prisma.booking.findMany({
            where: {
                station_id: stationId,
                start_time: { gte: thirtyDaysAgo },
                status: { in: ['active', 'completed'] }
            }
        });

        // Build hourly occupancy heatmap (0-23)
        const hourlyCount = new Array(24).fill(0);
        bookings.forEach(b => {
            const hour = new Date(b.start_time).getHours();
            hourlyCount[hour]++;
        });

        const currentHour = new Date().getHours();
        const maxCount = Math.max(...hourlyCount, 1);
        
        // Classify current wait time
        const currentLoad = hourlyCount[currentHour] / maxCount;
        let status = 'low';
        let waitMinutes = 5;
        let label = 'Available Now';

        if (currentLoad > 0.7) {
            status = 'high';
            waitMinutes = 25;
            label = 'Usually Busy';
        } else if (currentLoad > 0.4) {
            status = 'medium';
            waitMinutes = 12;
            label = 'Moderate Traffic';
        }

        // Find the next peak and quiet hour
        const nextPeakHour = hourlyCount.indexOf(Math.max(...hourlyCount));
        const nextQuietHour = hourlyCount.indexOf(Math.min(...hourlyCount));

        res.json({
            stationId,
            currentStatus: status,
            estimatedWaitMinutes: waitMinutes,
            label,
            hourlyData: hourlyCount.map((count, hour) => ({
                hour,
                count,
                load: Math.round((count / maxCount) * 100)
            })),
            tips: {
                nextPeakHour,
                nextQuietHour,
                totalBookingsAnalyzed: bookings.length
            }
        });
    } catch (err) {
        console.error('Analytics error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/analytics/station-stats/:stationId
 * Returns revenue and booking stats for a host.
 */
router.get('/station-stats/:stationId', async (req, res) => {
    try {
        const { stationId } = req.params;

        const allBookings = await prisma.booking.findMany({
            where: { station_id: stationId }
        });

        const completed = allBookings.filter(b => b.status === 'completed' || b.status === 'active');
        const totalRevenue = completed.reduce((sum, b) => sum + (b.total_amount || 0), 0);
        const today = new Date().toDateString();
        const todayBookings = allBookings.filter(b => new Date(b.start_time).toDateString() === today);

        res.json({
            totalBookings: allBookings.length,
            completedBookings: completed.length,
            totalRevenue: totalRevenue.toFixed(2),
            todayBookings: todayBookings.length,
            avgSessionValue: completed.length ? (totalRevenue / completed.length).toFixed(2) : 0
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
