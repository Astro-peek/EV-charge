const mqtt = require('mqtt');
const prisma = require('../lib/prisma');

/**
 * IoT MQTT Service
 * Listens for energy consumption data from Smart Plugs
 */

const MQTT_BROKER = process.env.MQTT_BROKER || 'mqtt://broker.hivemq.com';
const client = mqtt.connect(MQTT_BROKER);

client.on('connect', () => {
    console.log('📡 Connected to MQTT Broker for IoT Metering');
    // Subscribe to all station energy topics
    client.subscribe('ev/station/+/energy');
});

client.on('message', async (topic, message) => {
    // Topic format: ev/station/{station_id}/energy
    const parts = topic.split('/');
    const stationId = parts[2];
    const energyData = JSON.parse(message.toString()); // { units: 1.5, bookingId: "..." }

    console.log(`🔌 Energy Pulse from Station ${stationId}: ${energyData.units} units`);

    try {
        if (energyData.bookingId) {
            // Update the active booking with cumulative units
            await prisma.booking.update({
                where: { id: energyData.bookingId },
                data: {
                    units_consumed: {
                        increment: energyData.units
                    }
                }
            });
        }
    } catch (err) {
        console.error('MQTT Update Error:', err.message);
    }
});

module.exports = client;
