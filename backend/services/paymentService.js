const Razorpay = require('razorpay');
const crypto = require('crypto');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_placeholder',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret',
});

/**
 * Create a Razorpay payment order for a booking.
 * @param {number} amountInRupees
 * @param {string} bookingId
 */
const createOrder = async (amountInRupees, bookingId) => {
    const options = {
        amount: Math.round(amountInRupees * 100), // Razorpay works in paise
        currency: 'INR',
        receipt: bookingId,
        notes: { bookingId }
    };
    const order = await razorpay.orders.create(options);
    return order;
};

/**
 * Verify the Razorpay payment signature (webhook/callback verification).
 * @param {string} razorpay_order_id
 * @param {string} razorpay_payment_id
 * @param {string} razorpay_signature
 */
const verifyPayment = (razorpay_order_id, razorpay_payment_id, razorpay_signature) => {
    const body = razorpay_order_id + '|' + razorpay_payment_id;
    const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET || 'placeholder_secret')
        .update(body.toString())
        .digest('hex');
    return expectedSignature === razorpay_signature;
};

/**
 * Create a Razorpay payment link for a booking (UPI focused).
 * @param {number} amountInRupees
 * @param {string} bookingId
 * @param {string} userPhone
 * @param {string} userEmail
 * @param {string} description
 */
const createPaymentLink = async (amountInRupees, bookingId, userPhone, userEmail, description = 'ChargeNest P2P EV Charging Session') => {
    const options = {
        amount: Math.round(amountInRupees * 100),
        currency: 'INR',
        accept_partial: false,
        reference_id: bookingId,
        description: description,
        customer: {
            contact: userPhone || '+919999999999', // Ensure valid phone format or dummy
            email: userEmail || 'user@example.com'
        },
        notify: {
            sms: true,
            email: true
        },
        reminder_enable: true,
        notes: {
            bookingId: bookingId
        }
    };
    
    try {
        const paymentLink = await razorpay.paymentLink.create(options);
        return paymentLink;
    } catch (error) {
        console.error("Razorpay Payment Link Creation Error:", error);
        throw error;
    }
};

module.exports = { createOrder, verifyPayment, createPaymentLink };
