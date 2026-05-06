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

// Routes
const stationRoutes = require('./routes/stationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');

app.use('/api/stations', stationRoutes);
app.use('/api/bookings', bookingRoutes);

// Basic Routes
app.get('/', (req, res) => {
    res.json({ message: 'EV Charge OS API (MERN) is running', status: 'ok' });
});

app.get('/health', (req, res) => {
    res.json({ status: 'healthy' });
});

const { orchestrateQuery } = require('./services/aiService');
const { fetchNearbyStations } = require('./services/discoveryService');

// AI Agent Orchestration Route
app.post('/api/agent/orchestrate', async (req, res) => {
    const { query } = req.body;
    const result = await orchestrateQuery(query);
    res.json(result);
});

// Discovery Route (Real-time fetching from OpenChargeMap)
app.get('/api/stations/discovery', async (req, res) => {
    const { lat, lng } = req.query;
    if (!lat || !lng) return res.status(400).json({ error: "Lat/Lng required" });
    
    const stations = await fetchNearbyStations(lat, lng);
    res.json(stations);
});

app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
