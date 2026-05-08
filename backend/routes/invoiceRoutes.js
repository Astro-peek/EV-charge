const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const PDFDocument = require('pdfkit');

const GST_RATE = 0.18;

/**
 * GET /api/invoices/:bookingId
 * Generates a GST-compliant PDF invoice for a booking.
 */
router.get('/:bookingId', async (req, res) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.bookingId },
            include: {
                station: true,
                users: { select: { email: true, raw_user_meta_data: true } }
            }
        });

        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const baseAmount = (booking.total_amount || 0) / (1 + GST_RATE);
        const gstAmount = (booking.total_amount || 0) - baseAmount;
        const userName = booking.users?.raw_user_meta_data?.full_name || booking.users?.email || 'Guest';
        const invoiceDate = new Date(booking.createdAt || booking.start_time);

        // Create PDF
        const doc = new PDFDocument({ margin: 50, size: 'A4' });

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename=invoice-${booking.id.slice(0, 8)}.pdf`);
        doc.pipe(res);

        // ---- HEADER ----
        doc.rect(0, 0, 595, 120).fill('#0f172a');
        doc.fillColor('#22c55e').fontSize(28).font('Helvetica-Bold').text('IntelliRide', 50, 35);
        doc.fillColor('#94a3b8').fontSize(10).font('Helvetica').text('Smart EV Charging Platform', 50, 68);
        doc.fillColor('#ffffff').fontSize(10).text('GSTIN: 23AABCI1234A1ZX  |  support@intelliride.in', 50, 85);

        // ---- INVOICE TITLE ----
        doc.fillColor('#0f172a').fontSize(20).font('Helvetica-Bold').text('TAX INVOICE', 50, 145);
        doc.fillColor('#64748b').fontSize(10).font('Helvetica')
           .text(`Invoice #: INV-${booking.id.slice(0, 8).toUpperCase()}`, 50, 172)
           .text(`Date: ${invoiceDate.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}`, 50, 188);

        // ---- BILLED TO ----
        doc.roundedRect(50, 220, 230, 80, 8).fill('#f8fafc');
        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('BILLED TO', 65, 235);
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(userName, 65, 252);
        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(booking.users?.email || '', 65, 270);

        // ---- STATION INFO ----
        doc.roundedRect(295, 220, 250, 80, 8).fill('#f0fdf4');
        doc.fillColor('#64748b').fontSize(9).font('Helvetica-Bold').text('CHARGING STATION', 310, 235);
        doc.fillColor('#0f172a').fontSize(11).font('Helvetica-Bold').text(booking.station?.name || 'Station', 310, 252);
        doc.fillColor('#64748b').fontSize(9).font('Helvetica').text(booking.station?.address || '', 310, 270, { width: 220 });

        // ---- TABLE HEADER ----
        doc.rect(50, 325, 495, 32).fill('#0f172a');
        doc.fillColor('#ffffff').fontSize(10).font('Helvetica-Bold')
           .text('Description', 65, 337)
           .text('Duration', 280, 337)
           .text('Amount', 440, 337);

        // ---- TABLE ROW ----
        doc.rect(50, 357, 495, 40).fill('#f8fafc');
        const startTime = new Date(booking.start_time);
        const endTime = new Date(booking.end_time);
        const durationHrs = ((endTime - startTime) / 3600000).toFixed(1);

        doc.fillColor('#0f172a').fontSize(10).font('Helvetica')
           .text('EV Charging Session', 65, 370)
           .text(`${durationHrs} hrs`, 280, 370)
           .text(`₹${baseAmount.toFixed(2)}`, 440, 370);

        // ---- TOTALS ----
        const totalsY = 420;
        doc.moveTo(380, totalsY).lineTo(545, totalsY).strokeColor('#e2e8f0').lineWidth(1).stroke();

        doc.fillColor('#64748b').fontSize(10).font('Helvetica')
           .text('Subtotal (Base)', 380, totalsY + 8)
           .text(`₹${baseAmount.toFixed(2)}`, 460, totalsY + 8, { width: 80, align: 'right' });

        doc.fillColor('#64748b').fontSize(10)
           .text('CGST (9%)', 380, totalsY + 28)
           .text(`₹${(gstAmount / 2).toFixed(2)}`, 460, totalsY + 28, { width: 80, align: 'right' });

        doc.fillColor('#64748b').fontSize(10)
           .text('SGST (9%)', 380, totalsY + 48)
           .text(`₹${(gstAmount / 2).toFixed(2)}`, 460, totalsY + 48, { width: 80, align: 'right' });

        doc.moveTo(380, totalsY + 68).lineTo(545, totalsY + 68).strokeColor('#22c55e').lineWidth(2).stroke();

        doc.fillColor('#0f172a').fontSize(13).font('Helvetica-Bold')
           .text('TOTAL', 380, totalsY + 78)
           .text(`₹${(booking.total_amount || 0).toFixed(2)}`, 380, totalsY + 78, { width: 160, align: 'right' });

        // ---- PAYMENT INFO ----
        if (booking.payment_id) {
            doc.fillColor('#16a34a').fontSize(9).font('Helvetica')
               .text(`✓ Paid via Razorpay | TxnID: ${booking.payment_id}`, 50, totalsY + 115);
        }

        // ---- FOOTER ----
        doc.moveTo(50, 720).lineTo(545, 720).strokeColor('#e2e8f0').lineWidth(1).stroke();
        doc.fillColor('#94a3b8').fontSize(8).font('Helvetica')
           .text('This is a computer-generated invoice and does not require a signature.', 50, 730, { align: 'center', width: 495 })
           .text('IntelliRide | CIN: U74999MP2024PTC123456 | www.intelliride.in', 50, 745, { align: 'center', width: 495 });

        doc.end();
    } catch (err) {
        console.error('Invoice generation error:', err);
        res.status(500).json({ error: err.message });
    }
});

/**
 * GET /api/invoices/booking/:bookingId/preview
 * Returns invoice metadata (for the UI to show a summary before download).
 */
router.get('/booking/:bookingId/preview', async (req, res) => {
    try {
        const booking = await prisma.booking.findUnique({
            where: { id: req.params.bookingId },
            include: { station: true }
        });
        if (!booking) return res.status(404).json({ error: 'Booking not found' });

        const baseAmount = (booking.total_amount || 0) / (1 + GST_RATE);
        const gstAmount = (booking.total_amount || 0) - baseAmount;

        res.json({
            invoiceId: `INV-${booking.id.slice(0, 8).toUpperCase()}`,
            stationName: booking.station?.name,
            date: booking.start_time,
            baseAmount: baseAmount.toFixed(2),
            gst: gstAmount.toFixed(2),
            total: (booking.total_amount || 0).toFixed(2),
            paymentId: booking.payment_id
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
