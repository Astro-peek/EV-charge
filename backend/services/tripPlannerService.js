const prisma = require('../lib/prisma');

/**
 * ChargeSaathi — Smart Highway Trip Planner
 * Calculates optimal charging stops between start and destination.
 * Uses Haversine formula for distance, factors in battery range.
 */

// Haversine formula: distance between 2 lat/lng points in KM
const haversine = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) * Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

/**
 * Plan a trip with optimal charging stops.
 * @param {number} startLat
 * @param {number} startLng
 * @param {number} endLat
 * @param {number} endLng
 * @param {number} vehicleRangeKm - max range of vehicle on full charge
 * @param {number} currentChargePct - current battery % (0-100)
 */
const planTrip = async (startLat, startLng, endLat, endLng, vehicleRangeKm = 200, currentChargePct = 80) => {
    const totalDistance = haversine(startLat, startLng, endLat, endLng);
    
    // Initial range calculation
    const initialEffectiveRange = vehicleRangeKm * (currentChargePct / 100) * 0.85;

    if (totalDistance <= initialEffectiveRange) {
        return {
            totalDistance: totalDistance.toFixed(1),
            stopsNeeded: 0,
            chargingStops: [],
            message: `✅ You can reach your destination directly! ${totalDistance.toFixed(0)} km, effective range: ${initialEffectiveRange.toFixed(0)} km.`
        };
    }

    // Fetch all available stations
    const allStations = await prisma.station.findMany({
        where: { status: 'available' }
    });

    const stops = [];
    let currentLat = startLat;
    let currentLng = startLng;
    let currentEffectiveRange = initialEffectiveRange;
    let remainingDistance = totalDistance;

    while (remainingDistance > currentEffectiveRange) {
        let bestStation = null;
        let bestScore = -1;
        const safeRange = currentEffectiveRange * 0.9; 

        for (const station of allStations) {
            if (!station.lat || !station.lng) continue;

            const distFromCurrent = haversine(currentLat, currentLng, station.lat, station.lng);
            const distFromDest = haversine(station.lat, station.lng, endLat, endLng);

            // Skip stations that don't move us forward or are too close
            if (distFromCurrent < 10) continue; 

            // Pick the station that is within our current battery range 
            // AND gets us the absolute closest to our final destination
            if (distFromCurrent <= safeRange) {
                const progress = totalDistance - distFromDest;
                if (progress > bestScore) {
                    bestScore = progress;
                    bestStation = { ...station, distFromCurrent: distFromCurrent.toFixed(1) };
                }
            }
        }

        // Safety break
        if (!bestStation || stops.length >= 10) {
            if (!bestStation && stops.length === 0) {
                 stops.push({ warning: "Initial range too low and no nearby stations found. Please charge before starting." });
            }
            break;
        }

        stops.push(bestStation);
        
        // --- THE FIX: RECHARGE ---
        // After reaching a stop, we assume the user charges to 100% (or at least 85% effective)
        currentLat = bestStation.lat;
        currentLng = bestStation.lng;
        currentEffectiveRange = vehicleRangeKm * 0.85; 
        remainingDistance = haversine(currentLat, currentLng, endLat, endLng);
    }

    return {
        totalDistance: totalDistance.toFixed(1),
        stopsNeeded: stops.length,
        chargingStops: stops,
        allStations: allStations,
        message: `🗺️ Trip planned with ${stops.length} charging stop(s).`
    };
};

module.exports = { planTrip };
