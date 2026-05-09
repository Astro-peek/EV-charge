const express = require('express');
const router = express.Router();
const prisma = require('../lib/prisma');
const { translateToEnglish } = require('../services/voiceService');

// Bhashini API / Voice Search integration
router.post('/voice-search', async (req, res) => {
    try {
        const { audioUrl, textFallback, location, language = 'hi' } = req.body;
        
        if (!textFallback && !audioUrl) {
            return res.status(400).json({ error: "Missing audio or text input for voice search." });
        }

        console.log(`🎙️ Received Request (Lang: ${language}): "${textFallback || audioUrl}"`);
        
        // Translate regional text to English using our service
        const englishIntent = await translateToEnglish(textFallback, language);
        console.log(`🧠 Translated Intent: "${englishIntent}"`);
        
        // Basic Intent Resolution based on keywords (In real production, this would use an NLP Engine or LLM)
        let responseText = "Aas pass charge point mil gaya hai.";
        let query = { take: 3 };

        if (englishIntent.toLowerCase().includes('cheapest') || englishIntent.toLowerCase().includes('cheap')) {
            query = {
                where: { type: 'p2p', connector_types: { has: '15A Socket' } },
                orderBy: { price_per_unit: 'asc' },
                take: 3
            };
            responseText = language === 'Bhojpuri' 
                ? "Aha khatir sabse sasta charge point mil gail ba." 
                : "Aas pass sabse sasta charge point mil gaya hai.";
        } else {
            // Default query for nearest available
            query = {
                where: { status: 'available' },
                take: 3
            };
            responseText = language === 'Bhojpuri'
                ? "Kareeb me charge point mil gail ba."
                : "Aapke paas charge point mil gaya hai.";
        }

        const stations = await prisma.station.findMany(query);
        
        res.json({
            success: true,
            intent: englishIntent,
            translatedText: responseText,
            audioResponseUrl: "mock_bhojpuri_audio.mp3",
            results: stations
        });
    } catch (err) {
        console.error("Voice Search Error:", err);
        res.status(500).json({ error: "Internal server error during voice processing." });
    }
});

// Log daily income
router.post('/income', async (req, res) => {
    try {
        const { driver_id, amount } = req.body;
        
        if (!driver_id || amount === undefined || isNaN(amount)) {
            return res.status(400).json({ error: "Invalid driver ID or amount." });
        }

        const log = await prisma.incomeLog.create({
            data: {
                driver_id,
                amount: parseFloat(amount),
                date: new Date()
            }
        });
        res.json({ success: true, log });
    } catch (err) {
        console.error("Income Log Error:", err);
        res.status(500).json({ error: "Failed to log income." });
    }
});

// Get financial ratio (Income vs Charge Cost)
router.get('/dashboard/:driverId', async (req, res) => {
    try {
        const { driverId } = req.params;
        if (!driverId) {
             return res.status(400).json({ error: "Driver ID is required." });
        }

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
        console.error("Dashboard Fetch Error:", err);
        res.status(500).json({ error: "Failed to retrieve dashboard metrics." });
    }
});

// Simulate Battery Degradation ML Model
router.post('/battery-cycle', async (req, res) => {
    try {
        const { vehicle_id } = req.body;
        if (!vehicle_id) {
             return res.status(400).json({ error: "Vehicle ID is required." });
        }

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

        let status = 'HEALTHY';
        if (newDegradation > 20) status = 'WARNING: Battery replacement needed soon';
        if (newDegradation > 40) status = 'CRITICAL: Replace immediately';

        res.json({ health: updated, status });
    } catch (err) {
        console.error("Battery Cycle Error:", err);
        res.status(500).json({ error: "Failed to process battery cycle." });
    }
});

module.exports = router;
