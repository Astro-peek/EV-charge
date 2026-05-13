const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 8000;

// Middleware
app.use(cors());
app.use(express.json());

// No manual DB connection needed for Prisma (auto-connects)
console.log('⚡ Prisma ORM initialized with PostgreSQL');

// Initialize MQTT IoT Listener
require('./services/mqttService');


// Routes
const stationRoutes = require('./routes/stationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const vehicleRoutes = require('./routes/vehicleRoutes');
const tripRoutes = require('./routes/tripRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const queueRoutes = require('./routes/queueRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const chargeNestRoutes = require('./routes/chargeNestRoutes');
const chatbotRoutes = require('./routes/chatbotRoutes');
const reviewRoutes = require('./routes/reviewRoutes');

app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/queue', queueRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/chargenest', chargeNestRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/reviews', reviewRoutes);

// Basic Routes
app.get('/', (req, res) => {
    res.json({ message: 'EV Charge OS API (MERN) is running', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const { orchestrateQuery } = require('./services/aiService');

// AI Agent Orchestration Route
app.post('/api/agent/orchestrate', async (req, res) => {
    const { query, lang } = req.body;
    const result = await orchestrateQuery(query, lang || 'en');
    res.json(result);
});


if (process.env.NODE_ENV !== 'test' && !process.env.VERCEL) {
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;

