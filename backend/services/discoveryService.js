const axios = require('axios');

// OpenChargeMap Public API
const OCM_API_URL = "https://api.openchargemap.io/v3/poi/";
const OCM_API_KEY = process.env.OCM_API_KEY || "your_ocm_key_here";

const fetchNearbyStations = async (lat, lng, distance = 50) => {
  try {
    const response = await axios.get(OCM_API_URL, {
      params: {
        output: 'json',
        latitude: lat,
        longitude: lng,
        distance: distance,
        distanceunit: 'KM',
        maxresults: 20,
        compact: true,
        verbose: false,
        key: OCM_API_KEY
      }
    });

    // Map to our internal Station format
    return response.data.map(poi => ({
      name: poi.AddressInfo.Title,
      address: poi.AddressInfo.AddressLine1 + ", " + poi.AddressInfo.Town,
      lat: poi.AddressInfo.Latitude,
      lng: poi.AddressInfo.Longitude,
      type: poi.Connections[0]?.ConnectionType?.Title.includes('DC') ? 'DC' : 'AC',
      status: 'available', // Mocked as OCM status can be complex
      price_per_unit: 15.0, // Default for demo
      connector_types: poi.Connections.map(c => c.ConnectionType?.Title)
    }));
  } catch (error) {
    console.error("Discovery Error:", error);
    return [];
  }
};

module.exports = { fetchNearbyStations };
