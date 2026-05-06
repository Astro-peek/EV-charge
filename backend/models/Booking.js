const mongoose = require('mongoose');

const BookingSchema = new mongoose.Schema({
    userId: { type: String, required: true }, // Firebase UID
    stationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Station', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, required: true },
    status: { type: String, enum: ['pending', 'active', 'completed', 'cancelled'], default: 'pending' },
    totalAmount: { type: Number },
    unitsConsumed: { type: Number, default: 0 },
    paymentId: { type: String },
    vehicleId: { type: String }
}, { timestamps: true });

module.exports = mongoose.model('Booking', BookingSchema);
