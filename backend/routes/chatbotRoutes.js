const express = require('express');
const router = express.Router();
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { PrismaClient } = require('@prisma/client');
const { createOrder } = require('../services/paymentService');
const pricingService = require('../services/pricingService');

const prisma = new PrismaClient();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Chat with Gemini
router.post('/chat', async (req, res) => {
  try {
    const { message, language = 'en' } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Language-specific greetings and responses
    const greetings = {
      en: { greeting: "Hello! 👋", assistant: "EV Charging Assistant", emoji: "🔋" },
      hi: { greeting: "नमस्ते! 👋", assistant: "ईवी चार्जिंग सहायक", emoji: "🔋" },
      bn: { greeting: "হ্যালো! 👋", assistant: "ইভি চার্জিং সহায়ক", emoji: "🔋" },
      ta: { greeting: "வணக்கம்! 👋", assistant: "இவி சார்ஜிங் உதவியாளர்", emoji: "🔋" },
      te: { greeting: "హలో! 👋", assistant: "ఇవి ఛార్జింగ్ అసిస్టెంట్", emoji: "🔋" },
      mr: { greeting: "नमस्कार! 👋", assistant: "ईव्ही चार्जिंग सहायक", emoji: "🔋" },
      gu: { greeting: "નમસ્તે! 👋", assistant: "ઈવી ચાર્જિંગ સહાયક", emoji: "🔋" },
      kn: { greeting: "ನಮಸ್ಕಾರ! 👋", assistant: "ಇವಿ ಚಾರ್ಜಿಂಗ್ ಸಹಾಯಕ", emoji: "🔋" },
      ml: { greeting: "നമസ്കാരം! 👋", assistant: "ഇവി ചാർജിംഗ് അസിസ്റ്റന്റ്", emoji: "🔋" },
      pa: { greeting: "ਸਤ ਸ੍ਰੀ ਅਕਾਲ! 👋", assistant: "ਈਵੀ ਚਾਰਜਿੰਗ ਸਹਾਇਤਾ", emoji: "🔋" }
    };

    const lang = greetings[language] || greetings.en;

    // Try different model names for free tier
    let response;
    try {
      const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
      
      const languageInstructions = {
        en: "Respond in English. Be friendly and helpful.",
        hi: "हिंदी में जवाब दें। मैत्रीपूर्ण और सहायक रहें।",
        bn: "বাংলায় উত্তর দিন। বন্ধুত্বপূর্ণ এবং সহায়ক হোন।",
        ta: "தமிழில் பதிலளிக்கவும். நட்பான மற்றும் உதவியாக இருங்கள்.",
        te: "తెలుగులో స్పందించండి. స్నేహపూర్వకంగా మరియు సహాయకంగా ఉండండి.",
        mr: "मराठीत उत्तर द्या. मैत्रीपूर्ण आणि मदतीचे राहा.",
        gu: "ગુજરાતીમાં જવાબ આપો. મૈત્રીપૂર્ણ અને સહાયક રહો.",
        kn: "ಕನ್ನಡದಲ್ಲಿ ಪ್ರತಿಕ್ರಿಯಿಸಿ. ಸ್ನೇಹಿಯರಾಗಿ ಮತ್ತು ಸಹಾಯಕರಾಗಿರಿ.",
        ml: "മലയാളത്തിൽ മറുപടി നൽകുക. സൗഹൃദപരവും സഹായകവുമായിരിക്കുക.",
        pa: "ਪੰਜਾਬੀ ਵਿੱਚ ਜਵਾਬ ਦਿਓ। ਦੋਸਤਾਨਾ ਅਤੇ ਮਦਦਗਾਰ ਰਹੋ।"
      };

      const prompt = `System Instructions:
Language: ${languageInstructions[language] || languageInstructions.en}

Role: You are ${lang.assistant} ${lang.emoji}, the official AI assistant for ChargeNest.

CRITICAL LANGUAGE INSTRUCTION: Automatically detect the language of the 'User message' and reply strictly in that SAME language. If the user typed in Hindi, reply in Hindi. If the user typed in Spanish, reply in Spanish. The user's system language preference is ${language}. If the user's message is too short or ambiguous to detect the language, default to providing the response in ${languageInstructions[language] ? language : 'English'}.

Determine the user's intent:
1. If the user wants to book a charging slot, reserve a spot, find a station, or needs urgent charging, set "intent" to "booking".
2. Otherwise, set "intent" to "chat".

CRITICAL: Respond ONLY with a valid JSON object in this exact format:
{
  "intent": "booking" or "chat",
  "response": "Your natural language response here (in the detected language). If intent is booking, say 'I found an available slot for you! Here are the details: 👇'."
}

User message: ${message}`;

      const result = await model.generateContent(prompt);
      const textResponse = result.response.text();
      let parsedResponse;
      try {
        const jsonMatch = textResponse.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedResponse = JSON.parse(jsonMatch[0]);
        } else {
          parsedResponse = { intent: 'chat', response: textResponse };
        }
      } catch (e) {
        parsedResponse = { intent: 'chat', response: textResponse };
      }
      
      response = parsedResponse.response;
      
      if (parsedResponse.intent === 'booking') {
        const { userLocation } = req.body;
        if (userLocation) {
          const nearestStations = await findNearestStations(userLocation.lat, userLocation.lng);
          if (nearestStations.length > 0) {
            let availableSlot = null;
            let selectedStation = null;
            for (const station of nearestStations) {
              const slot = await findAvailableSlot(station.id);
              if (slot) {
                availableSlot = slot;
                selectedStation = station;
                break;
              }
            }
            if (availableSlot) {
                const booking = await createUrgentBooking(selectedStation.id, availableSlot);
                const razorpayOrder = await createOrder(availableSlot.price, booking.id);
                const paymentData = {
                  key: process.env.RAZORPAY_KEY_ID,
                  amount: razorpayOrder.amount,
                  currency: razorpayOrder.currency,
                  order_id: razorpayOrder.id,
                  name: "EV Charging Booking",
                  description: `Booking at ${selectedStation.name}`,
                  prefill: { name: "Customer", email: "customer@example.com", contact: "9999999999" },
                  notes: { booking_id: booking.id, station_id: selectedStation.id },
                  theme: { color: "#3399cc" }
                };
                
                // Add booking data directly to the /chat response!
                return res.json({
                  response: response + `\n\n🔌 **Urgent Slot Found!**\n\n📍 **Station**: ${selectedStation.name}\n📍 **Address**: ${selectedStation.address}\n⏰ **Time**: ${new Date(availableSlot.startTime).toLocaleString()}\n⚡ **Power**: ${selectedStation.power}kW\n💰 **Price**: ₹${availableSlot.price}\n\nClick below to proceed to payment:`,
                  language,
                  isBooking: true,
                  station: selectedStation,
                  slot: availableSlot,
                  paymentData
                });
            } else {
              response += "\n\nSorry, I couldn't find any available slots right now. Please try again later.";
            }
          } else {
             response += "\n\nSorry, I couldn't find any stations near your location.";
          }
        } else {
          response += "\n\nTo book a slot, I need access to your location. Please share your location first.";
        }
      }
    } catch (geminiError) {
      console.error('Gemini API Error Detail:', {
        message: geminiError.message,
        status: geminiError.status,
        statusText: geminiError.statusText,
        stack: geminiError.stack
      });
      console.log('Gemini API failed, using fallback response');
      
      // Dynamic fallback responses based on user input
      const generateDynamicResponse = (userMessage, greeting) => {
        const lowerMessage = userMessage.toLowerCase();
        
        // Check for specific keywords and provide relevant responses
        if (lowerMessage.includes('urgent') || lowerMessage.includes('emergency') || lowerMessage.includes('immediate')) {
          return `${greeting} I can help you find urgent charging slots! Just say "book urgent slot" and I'll find the nearest available station for you right away! 🔋`;
        }
        
        if (lowerMessage.includes('station') || lowerMessage.includes('near') || lowerMessage.includes('location')) {
          return `${greeting} I can help you find charging stations near you! Share your location or ask "find nearest station" and I'll locate the best options! 📍`;
        }
        
        if (lowerMessage.includes('book') || lowerMessage.includes('slot') || lowerMessage.includes('reserve')) {
          return `${greeting} Ready to book a charging slot? Tell me "book urgent slot" and I'll find available slots and set up payment for you! ⚡`;
        }
        
        if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('payment')) {
          return `${greeting} Current charging prices: ₹120-₈0 for 2 hours depending on station power and time. Peak hours (7-10 AM, 6-10 PM) cost 30% more! I'll show exact real-time pricing when you book. 💰`;
        }
        
        if (lowerMessage.includes('time') || lowerMessage.includes('how long') || lowerMessage.includes('duration')) {
          return `${greeting} Most charging slots are 2 hours long, perfect for a full charge! I can find available time slots based on your schedule. ⏰`;
        }
        
        if (lowerMessage.includes('help') || lowerMessage.includes('support') || lowerMessage.includes('assist')) {
          return `${greeting} I'm here to help with EV charging! I can: find stations, book urgent slots, check prices, and answer charging questions. What do you need help with? 🚗`;
        }
        
        // Default responses with variety
        const defaultResponses = [
          `${greeting} I'm your EV charging assistant! I can help you find stations, book urgent slots, and answer charging questions. What do you need? 🔋`,
          `${greeting} Ready to help with EV charging! Try "find nearest station" or "book urgent slot" for quick assistance! ⚡`,
          `${greeting} I can assist with EV charging services! Need station info, urgent booking, or charging advice? Just ask! 🚗`,
          `${greeting} Here to help with your EV charging needs! I can locate stations and book urgent slots for you. 📍`,
          `${greeting} EV charging help available! I can find nearby stations and book charging slots when you need them! 🔌`
        ];
        
        return defaultResponses[Math.floor(Math.random() * defaultResponses.length)];
      };

      response = generateDynamicResponse(message, lang.greeting);

    }

    res.json({ response, language });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

// Urgent booking endpoint
router.post('/urgent-booking', async (req, res) => {
  try {
    const { userLocation, request } = req.body;
    
    if (!userLocation) {
      return res.status(400).json({ error: 'User location is required' });
    }

    // Find nearest available stations
    const nearestStations = await findNearestStations(userLocation.lat, userLocation.lng);
    
    if (nearestStations.length === 0) {
      return res.status(404).json({ error: 'No stations found nearby' });
    }

    // Find first available slot
    let availableSlot = null;
    let selectedStation = null;

    for (const station of nearestStations) {
      const slot = await findAvailableSlot(station.id);
      if (slot) {
        availableSlot = slot;
        selectedStation = station;
        break;
      }
    }

    if (!availableSlot) {
      return res.status(404).json({ error: 'No available slots found' });
    }

    // Create booking
    const booking = await createUrgentBooking(selectedStation.id, availableSlot);
    
    // Create Razorpay order using existing service
    const razorpayOrder = await createOrder(availableSlot.price, booking.id);

    // Return order details for frontend to handle payment
    const paymentData = {
      key: process.env.RAZORPAY_KEY_ID,
      amount: razorpayOrder.amount,
      currency: razorpayOrder.currency,
      order_id: razorpayOrder.id,
      name: "EV Charging Booking",
      description: `Booking at ${selectedStation.name}`,
      image: "https://example.com/your-logo.png", // Optional
      handler: function (response) {
        // This will be handled by frontend
        console.log("Payment successful:", response);
      },
      prefill: {
        name: "Customer Name",
        email: "customer@example.com",
        contact: "9999999999"
      },
      notes: {
        booking_id: booking.id,
        station_id: selectedStation.id
      },
      theme: {
        color: "#3399cc"
      }
    };

    res.json({
      station: {
        id: selectedStation.id,
        name: selectedStation.name,
        address: selectedStation.address,
        power: selectedStation.power
      },
      slot: {
        id: availableSlot.id,
        startTime: availableSlot.startTime,
        endTime: availableSlot.endTime,
        price: availableSlot.price
      },
      paymentData,
      bookingId: booking.id
    });

  } catch (error) {
    console.error('Urgent booking error:', error);
    res.status(500).json({ error: 'Failed to process urgent booking' });
  }
});

// Helper function to find nearest stations
async function findNearestStations(lat, lng, maxDistance = 10) {
  try {
    const stations = await prisma.station.findMany({
      where: {
        lat: { not: null },
        lng: { not: null }
      }
    });

    // Calculate distances and sort
    const stationsWithDistance = stations.map(station => {
      const distance = calculateDistance(lat, lng, station.lat, station.lng);
      return { ...station, distance };
    }).sort((a, b) => a.distance - b.distance);

    return stationsWithDistance.filter(station => station.distance <= maxDistance);
  } catch (error) {
    console.error('Error finding nearest stations:', error);
    return [];
  }
}

// Helper function to calculate distance between two points
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Helper function to find available slot with real pricing
async function findAvailableSlot(stationId) {
  try {
    const now = new Date();
    const endTime = new Date(now.getTime() + 2 * 60 * 60 * 1000); // 2 hours from now

    // Check if station has any existing bookings in the next 2 hours
    const existingBookings = await prisma.booking.findMany({
      where: {
        station_id: stationId,
        status: { not: 'cancelled' },
        OR: [
          {
            AND: [
              { start_time: { lte: now } },
              { end_time: { gte: now } }
            ]
          },
          {
            AND: [
              { start_time: { gte: now } },
              { start_time: { lte: endTime } }
            ]
          }
        ]
      }
    });

    console.log(`Station ${stationId} has ${existingBookings.length} existing bookings`);

    // Get real-time pricing for this station
    const pricing = await pricingService.getStationPrice(stationId, 2);
    
    const startTime = new Date(now.getTime() + 30 * 60 * 1000); // 30 minutes from now
    const endTimeSlot = new Date(startTime.getTime() + 2 * 60 * 60 * 1000); // 2 hour slot
    
    return {
      id: 'slot-' + Date.now(),
      startTime,
      endTime: endTimeSlot,
      price: pricing.totalPrice,
      pricing: pricing, // Include full pricing breakdown
      isAvailable: true
    };

  } catch (error) {
    console.error('Error finding available slot:', error);
    return null;
  }
}

// Helper function to create urgent booking
async function createUrgentBooking(stationId, slot) {
  try {
    const booking = await prisma.booking.create({
      data: {
        station_id: stationId,
        user_id: '6d638db9-6459-4203-bd53-98cff6041286', // Using existing user ID
        status: 'pending',
        start_time: slot.startTime,
        end_time: slot.endTime,
        total_amount: slot.price
      }
    });

    return booking;
  } catch (error) {
    console.error('Error creating booking:', error);
    throw error;
  }
}

// Get real-time pricing for stations
router.post('/pricing', async (req, res) => {
  try {
    const { userLocation, durationHours = 2 } = req.body;
    
    if (!userLocation) {
      return res.status(400).json({ error: 'User location is required' });
    }

    const pricing = await pricingService.getNearbyStationPricing(userLocation, 10, durationHours);
    
    res.json({
      pricing,
      summary: {
        averagePrice: Math.round(pricing.filter(p => p.totalPrice).reduce((sum, p) => sum + p.totalPrice, 0) / pricing.filter(p => p.totalPrice).length),
        lowestPrice: Math.min(...pricing.filter(p => p.totalPrice).map(p => p.totalPrice)),
        highestPrice: Math.max(...pricing.filter(p => p.totalPrice).map(p => p.totalPrice)),
        stationCount: pricing.length
      }
    });
  } catch (error) {
    console.error('Pricing error:', error);
    res.status(500).json({ error: 'Failed to fetch pricing' });
  }
});

module.exports = router;
