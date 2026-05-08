const express = require('express');
const router = express.Router();
const { createOrder, verifyPayment } = require('../services/paymentService');
const prisma = require('../lib/prisma');

// Create a new Razorpay order for a booking
router.post('/create-order', async (req, res) => {
    const { amount, bookingId } = req.body;
    try {
        const order = await createOrder(amount, bookingId);
        res.json(order);
    } catch (err) {
        console.error("Razorpay Order Creation Error:", err);
        res.status(500).json({ error: err.message });
    }
});

// Verify payment and update booking status
router.post('/verify', async (req, res) => {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, bookingId } = req.body;

    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);

    if (isValid) {
        try {
            // Fetch booking to calculate GST
            const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
            const totalAmount = booking?.total_amount || 0;
            const baseAmount = totalAmount / 1.18; // 18% GST
            const gstAmount = totalAmount - baseAmount;

            const updatedBooking = await prisma.booking.update({
                where: { id: bookingId },
                data: { 
                    status: 'active',
                    payment_id: razorpay_payment_id,
                    // Store GST breakdown in units_consumed field temporarily (or add custom field)
                    units_consumed: parseFloat(gstAmount.toFixed(2))
                }
            });
            res.json({ 
                status: 'success', 
                booking: updatedBooking,
                invoice: {
                    baseAmount: baseAmount.toFixed(2),
                    gst: gstAmount.toFixed(2),
                    total: totalAmount.toFixed(2)
                }
            });
        } catch (err) {
            res.status(500).json({ error: "Payment verified but database update failed" });
        }
    } else {
        res.status(400).json({ status: 'failure', message: 'Invalid signature' });
    }
});

module.exports = router;
