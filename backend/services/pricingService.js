const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calculate real-time pricing for EV charging stations
 * Based on station power, time of day, and demand
 */
class PricingService {
  
  /**
   * Get real-time price for a specific station
   * @param {string} stationId - Station ID
   * @param {number} durationHours - Charging duration in hours (default: 2)
   * @returns {Promise<Object>} Pricing details
   */
  async getStationPrice(stationId, durationHours = 2) {
    try {
      const station = await prisma.station.findUnique({
        where: { id: stationId }
      });

      if (!station) {
        throw new Error('Station not found');
      }

      const basePricePerUnit = station.price_per_unit || 15; // Default ₹15 per unit
      const powerKW = this.extractPowerKW(station.power);
      
      // Calculate dynamic pricing factors
      const timeMultiplier = this.getTimeMultiplier();
      const demandMultiplier = await this.getDemandMultiplier(stationId);
      const peakHourSurcharge = this.getPeakHourSurcharge();
      
      // Calculate final price
      const unitsPerHour = powerKW; // Approximate units consumed per hour
      const baseHourlyRate = basePricePerUnit * unitsPerHour;
      const adjustedHourlyRate = baseHourlyRate * timeMultiplier * demandMultiplier;
      const finalHourlyRate = adjustedHourlyRate + peakHourSurcharge;
      
      const totalPrice = Math.round(finalHourlyRate * durationHours);
      
      return {
        stationId,
        stationName: station.name,
        powerKW,
        basePricePerUnit,
        durationHours,
        hourlyRate: Math.round(finalHourlyRate),
        totalPrice,
        breakdown: {
          baseHourlyRate: Math.round(baseHourlyRate),
          timeMultiplier: timeMultiplier.toFixed(2),
          demandMultiplier: demandMultiplier.toFixed(2),
          peakHourSurcharge,
          unitsPerHour
        },
        isPeakHour: peakHourSurcharge > 0,
        estimatedChargeKWh: Math.round(powerKW * durationHours)
      };
      
    } catch (error) {
      console.error('Pricing service error:', error);
      throw error;
    }
  }

  /**
   * Get pricing for multiple stations
   * @param {Array<string>} stationIds - Array of station IDs
   * @param {number} durationHours - Charging duration in hours
   * @returns {Promise<Array>} Array of pricing details
   */
  async getMultipleStationPrices(stationIds, durationHours = 2) {
    const pricingPromises = stationIds.map(stationId => 
      this.getStationPrice(stationId, durationHours).catch(error => ({
        stationId,
        error: error.message
      }))
    );
    
    return Promise.all(pricingPromises);
  }

  /**
   * Extract power in kW from power string
   * @param {string} powerString - Power string like "15kW" or "Single Phase (3.3 kW)"
   * @returns {number} Power in kW
   */
  extractPowerKW(powerString) {
    if (!powerString) return 15; // Default 15kW
    
    // Extract number from string
    const match = powerString.match(/(\d+\.?\d*)\s*kW/i);
    if (match) {
      return parseFloat(match[1]);
    }
    
    // Fallback for different formats
    const numberMatch = powerString.match(/(\d+\.?\d*)/);
    return numberMatch ? parseFloat(numberMatch[1]) : 15;
  }

  /**
   * Get time-based pricing multiplier
   * Peak hours: 6-10 PM, 7-10 AM
   * @returns {number} Multiplier (1.0-1.5)
   */
  getTimeMultiplier() {
    const now = new Date();
    const hour = now.getHours();
    
    // Peak hours: 7-10 AM and 6-10 PM
    if ((hour >= 7 && hour <= 10) || (hour >= 18 && hour <= 22)) {
      return 1.3; // 30% surcharge during peak hours
    }
    
    // Off-peak: 11 PM - 6 AM
    if (hour >= 23 || hour <= 6) {
      return 0.8; // 20% discount during off-peak
    }
    
    return 1.0; // Normal pricing
  }

  /**
   * Get demand-based pricing multiplier
   * @param {string} stationId - Station ID
   * @returns {Promise<number>} Multiplier (1.0-1.2)
   */
  async getDemandMultiplier(stationId) {
    try {
      // Check current bookings at this station
      const currentBookings = await prisma.booking.count({
        where: {
          station_id: stationId,
          status: { not: 'cancelled' },
          start_time: { lte: new Date() },
          end_time: { gte: new Date() }
        }
      });

      // Higher demand if station is busy
      if (currentBookings >= 3) {
        return 1.2; // 20% surcharge for high demand
      } else if (currentBookings >= 1) {
        return 1.1; // 10% surcharge for medium demand
      }
      
      return 1.0; // Normal demand
    } catch (error) {
      console.error('Demand multiplier error:', error);
      return 1.0;
    }
  }

  /**
   * Get peak hour surcharge amount
   * @returns {number} Surcharge in rupees
   */
  getPeakHourSurcharge() {
    const now = new Date();
    const hour = now.getHours();
    
    // Additional surcharge during peak hours
    if ((hour >= 7 && hour <= 10) || (hour >= 18 && hour <= 22)) {
      return 10; // ₹10 additional surcharge during peak hours
    }
    
    return 0;
  }

  /**
   * Get average pricing for nearby stations
   * @param {Object} userLocation - {lat, lng}
   * @param {number} radiusKm - Search radius in km
   * @param {number} durationHours - Charging duration
   * @returns {Promise<Array>} Array of station pricing
   */
  async getNearbyStationPricing(userLocation, radiusKm = 10, durationHours = 2) {
    try {
      // Get nearby stations (simplified - in real app would use proper distance calculation)
      const stations = await prisma.station.findMany({
        take: 5, // Limit to 5 nearest stations for demo
        where: {
          lat: { not: null },
          lng: { not: null }
        }
      });

      const stationIds = stations.map(station => station.id);
      return await this.getMultipleStationPrices(stationIds, durationHours);
      
    } catch (error) {
      console.error('Nearby pricing error:', error);
      throw error;
    }
  }
}

module.exports = new PricingService();
