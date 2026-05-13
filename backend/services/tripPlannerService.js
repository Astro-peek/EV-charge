const prisma = require('../lib/prisma');

/**
 * ChargeSaathi — Production-Grade Smart Highway Trip Planner
 * Correctly plans charging stops accounting for current battery level.
 * Uses Haversine formula for distance calculation.
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
 * Checks if a station is generally "on the way" between start and destination.
 * Uses a corridor approach — the station must not deviate too far off-route.
 */
const isOnRoute = (stationLat, stationLng, startLat, startLng, endLat, endLng) => {
    const directDist = haversine(startLat, startLng, endLat, endLng);
    const viaStation = haversine(startLat, startLng, stationLat, stationLng) 
                     + haversine(stationLat, stationLng, endLat, endLng);
    
    // Allow up to 40% detour — this is crucial for rural India routes
    return viaStation <= directDist * 1.4;
};

/**
 * Plan a trip with optimal charging stops.
 * @param {number} startLat
 * @param {number} startLng  
 * @param {number} endLat
 * @param {number} endLng
 * @param {number} vehicleRangeKm - max range on full charge
 * @param {number} currentChargePct - current battery % (0-100)
 */
const planTrip = async (startLat, startLng, endLat, endLng, vehicleRangeKm = 350, currentChargePct = 80) => {
    const totalDistance = haversine(startLat, startLng, endLat, endLng);
    
    // Keep 15% reserve battery — never plan to arrive on empty
    const RESERVE_FACTOR = 0.85;
    
    // Current range in km based on battery percentage
    const initialEffectiveRange = vehicleRangeKm * (currentChargePct / 100) * RESERVE_FACTOR;
    // Range available after a full charge at a stop
    const fullChargeRange = vehicleRangeKm * RESERVE_FACTOR;

    // Fetch ALL stations with valid coordinates from the database
    const allStations = await prisma.station.findMany({
        where: { status: 'available' }
    });

    const validStations = allStations.filter(s => s.lat && s.lng);

    // If we can reach directly, no stops needed
    if (totalDistance <= initialEffectiveRange) {
        return {
            totalDistance: totalDistance.toFixed(1),
            stopsNeeded: 0,
            chargingStops: [],
            allStations: validStations,
            message: `✅ Direct route possible! ${totalDistance.toFixed(0)} km, current range: ${initialEffectiveRange.toFixed(0)} km.`
        };
    }

    const stops = [];
    let currentLat = startLat;
    let currentLng = startLng;
    let currentRange = initialEffectiveRange; // km remaining in battery

    let safetyBreak = 0;

    while (haversine(currentLat, currentLng, endLat, endLng) > currentRange) {
        safetyBreak++;
        if (safetyBreak > 15) break; // Prevent infinite loops

        let bestStation = null;
        let bestScore = -Infinity;

        for (const station of validStations) {
            // Skip stations already in our stop list
            if (stops.some(s => s.id === station.id)) continue;

            const distFromCurrent = haversine(currentLat, currentLng, station.lat, station.lng);
            
            // CRITICAL: Station must be reachable with current battery
            if (distFromCurrent > currentRange) continue;

            // Station must be in the general direction of our destination
            if (!isOnRoute(station.lat, station.lng, currentLat, currentLng, endLat, endLng)) continue;

            const distFromDest = haversine(station.lat, station.lng, endLat, endLng);
            
            // Score: Maximize progress toward destination.
            // Prefer stations that are close to the limit of our range (efficient use)
            // and that bring us closest to destination.
            const progressMade = haversine(currentLat, currentLng, endLat, endLng) - distFromDest;
            const efficiencyBonus = distFromCurrent / currentRange; // prefer stations that use more of our range
            
            const score = progressMade + (efficiencyBonus * 50);

            if (score > bestScore) {
                bestScore = score;
                bestStation = { 
                    ...station, 
                    distFromCurrent: distFromCurrent.toFixed(1) 
                };
            }
        }

        if (!bestStation) {
            // No station found within range — find absolute closest station as emergency
            let closestStation = null;
            let closestDist = Infinity;

            for (const station of validStations) {
                if (stops.some(s => s.id === station.id)) continue;
                const d = haversine(currentLat, currentLng, station.lat, station.lng);
                if (d < closestDist) {
                    closestDist = d;
                    closestStation = station;
                }
            }

            if (closestStation && closestDist <= currentRange) {
                // Found a nearby station even if not perfectly on route
                bestStation = { ...closestStation, distFromCurrent: closestDist.toFixed(1) };
            } else {
                // Truly no reachable station
                stops.push({ 
                    warning: `Battery too low to reach any station. Nearest station is ${closestDist ? closestDist.toFixed(0) + 'km' : 'unknown distance'} away. Please charge before starting.` 
                });
                break;
            }
        }

        stops.push(bestStation);

        // After charging at this stop, battery is full
        currentLat = bestStation.lat;
        currentLng = bestStation.lng;
        currentRange = fullChargeRange;
    }

    const finalLegDist = haversine(currentLat, currentLng, endLat, endLng);
    const finalRangeRemaining = Math.max(0, currentRange - finalLegDist);
    const expectedArrivalChargePct = Math.round((finalRangeRemaining / vehicleRangeKm) * 100);

    return {
        totalDistance: totalDistance.toFixed(1),
        stopsNeeded: stops.filter(s => !s.warning).length,
        chargingStops: stops,
        allStations: validStations,
        expectedArrivalChargePct: expectedArrivalChargePct,
        message: `🗺️ Trip planned with ${stops.filter(s => !s.warning).length} charging stop(s).`
    };
};

module.exports = { planTrip };
