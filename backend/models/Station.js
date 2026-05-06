const mongoose = require('mongoose');

const StationSchema = new mongoose.Schema({
    name: { type: String, required: true },
    location: {
        address: String,
        coordinates: {
            lat: Number,
            lng: Number
        }
    },
    type: { type: String, enum: ['AC', 'DC', 'Both'], default: 'AC' },
    power: { type: String, default: '15kW' },
    status: { type: String, enum: ['available', 'occupied', 'offline'], default: 'available' },
    pricePerUnit: { type: Number, required: true },
    connectorTypes: [String],
    hostId: { type: String }, // Firebase UID
    images: [String]
}, { timestamps: true });

module.exports = mongoose.model('Station', StationSchema);
