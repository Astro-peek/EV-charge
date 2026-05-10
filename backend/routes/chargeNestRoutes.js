const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { sendCommandToPlug } = require('../services/mqttService');
const { createPaymentLink } = require('../services/paymentService');

// POST /api/chargenest/start-session
router.post('/start-session', async (req, res) => {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { station: true }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.status === 'charging') return res.status(400).json({ error: 'Session already in progress' });

        // Turn ON the smart plug
        sendCommandToPlug(booking.station_id, 'ON', bookingId);

        // Update booking status
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: 'charging',
                start_time: new Date() // Optional: override start time to actual start
            }
        });

        res.json({ message: 'Charging session started', booking: updatedBooking });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to start session' });
    }
});

// POST /api/chargenest/end-session
router.post('/end-session', async (req, res) => {
    const { bookingId } = req.body;
    if (!bookingId) return res.status(400).json({ error: 'bookingId is required' });

    try {
        const booking = await prisma.booking.findUnique({
            where: { id: bookingId },
            include: { 
                station: true,
                users: true 
            }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found' });
        if (booking.status !== 'charging') return res.status(400).json({ error: 'Session is not currently active' });

        // Turn OFF the smart plug
        sendCommandToPlug(booking.station_id, 'OFF', bookingId);

        // Calculate bill based on units consumed
        // Note: units_consumed is updated asynchronously by mqttService.js listening to energy pulses.
        const units = booking.units_consumed || 0;
        const pricePerUnit = booking.station.price_per_unit || 10; // Default to 10 if not set
        const totalAmount = units * pricePerUnit;

        let paymentLinkUrl = null;
        let paymentLinkId = null;

        if (totalAmount > 0) {
            // Generate Razorpay Payment Link
            const phone = booking.users?.phone || '+919999999999';
            const email = booking.users?.email || 'user@example.com';
            
            try {
                const paymentLink = await createPaymentLink(
                    totalAmount, 
                    bookingId, 
                    phone, 
                    email, 
                    `ChargeNest Session at ${booking.station.name}`
                );
                paymentLinkUrl = paymentLink.short_url;
                paymentLinkId = paymentLink.id;
            } catch (paymentErr) {
                console.error('Payment link generation failed:', paymentErr);
            }
        }

        // Update booking status and amount
        const updatedBooking = await prisma.booking.update({
            where: { id: bookingId },
            data: { 
                status: totalAmount > 0 ? 'payment_pending' : 'completed',
                end_time: new Date(),
                total_amount: totalAmount,
                payment_id: paymentLinkId // Store link ID temporarily in payment_id field
            }
        });

        res.json({ 
            message: 'Charging session ended', 
            booking: updatedBooking,
            bill: {
                unitsConsumed: units,
                pricePerUnit: pricePerUnit,
                totalAmount: totalAmount
            },
            paymentLink: paymentLinkUrl
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to end session' });
    }
});

module.exports = router;
