const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');

// Mock Bhashini API / Voice Search
// In production, this would send an audio blob to Bhashini and get translated intent.
// Here we simulate parsing a Bhojpuri/Hindi command to find a station.
router.post('/voice-search', async (req, res) => {
    const { audioUrl, textFallback, location } = req.body;
    
    // Simulating Bhashini NLP Translation
    console.log(`🎙️ Received Audio/Text: "${textFallback}"`);
    console.log(`🧠 Processing via Bhashini Indic NLP...`);
    
    // Assume the intent parsed is "Find cheapest 15A socket near me"
    try {
        const query = {
            where: {
                type: 'p2p',
                connector_types: { has: '15A Socket' },
            },
            orderBy: {
                price_per_unit: 'asc' // Cheapest first
            },
            take: 3
        };

        const stations = await prisma.station.findMany(query);
        
        // Simulating the Text-to-Speech response in Bhojpuri/Hindi
        const responseText = "Aas pass sabse sasta charge point mil gaya hai.";
        
        res.json({
            success: true,
            intent: "find_cheap_charger",
            translatedText: responseText,
            audioResponseUrl: "mock_bhojpuri_audio.mp3",
            results: stations
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Log daily income
router.post('/income', async (req, res) => {
    const { driver_id, amount } = req.body;
    try {
        const log = await prisma.incomeLog.create({
            data: {
                driver_id,
                amount: parseFloat(amount),
                date: new Date()
            }
        });
        res.json({ success: true, log });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Get financial ratio (Income vs Charge Cost)
router.get('/dashboard/:driverId', async (req, res) => {
    const { driverId } = req.params;
    try {
        // Fetch total income
        const incomes = await prisma.incomeLog.findMany({
            where: { driver_id: driverId }
        });
        const totalIncome = incomes.reduce((sum, log) => sum + log.amount, 0);

        // Fetch total charging cost (Assuming user_id matches driver_id for simplicity)
        const bookings = await prisma.booking.findMany({
            where: { user_id: driverId, status: 'completed' }
        });
        const totalExpense = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);

        res.json({
            totalIncome,
            totalExpense,
            ratio: totalExpense > 0 ? (totalIncome / totalExpense).toFixed(2) : 'N/A'
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Simulate Battery Degradation ML Model
router.post('/battery-cycle', async (req, res) => {
    const { vehicle_id } = req.body;
    try {
        let health = await prisma.batteryHealth.findFirst({
            where: { vehicle_id }
        });

        if (!health) {
            health = await prisma.batteryHealth.create({
                data: { vehicle_id, charge_cycles: 0, degradation_percent: 0.0 }
            });
        }

        // ML Simulation: Each cycle degrades battery by 0.05% based on basic temp/voltage modeling
        const newCycles = health.charge_cycles + 1;
        const newDegradation = Math.min(newCycles * 0.05, 100);

        const updated = await prisma.batteryHealth.update({
            where: { id: health.id },
            data: { 
                charge_cycles: newCycles, 
                degradation_percent: newDegradation,
                last_assessed_at: new Date()
            }
        });

        const status = newDegradation > 20 ? 'WARNING: Battery replacement needed soon' : 'HEALTHY';

        res.json({ health: updated, status });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
