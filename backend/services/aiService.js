const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

/**
 * EV Charge OS Orchestrator (Powered by Gemini)
 * Handles query analysis, routing, and regional language translation.
 */
const orchestrateQuery = async (query) => {
  try {
    const prompt = `
      You are the EV Charge OS Orchestrator. 
      Analyze the user query (which might be in English, Hindi, Bhojpuri, or other Indian languages).
      
      Route it to one of these 4 features:
      1. ChargeAnna (P2P Charging/Listing)
      2. VehicleID (Compatibility/Registration lookup)
      3. ChargeSaathi (Highway Trip Planning)
      4. ReChakra (E-Rickshaw/Regional/General help)

      Respond ONLY in valid JSON format:
      {
        "feature": "Name of the feature",
        "reason": "Brief explanation",
        "suggestion": "A friendly response in the user's language (or English if preferred)",
        "detected_language": "The language you detected"
      }

      User Query: "${query}"
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text().replace(/```json|```/g, "").trim();
    
    return JSON.parse(text);
  } catch (error) {
    console.error("Gemini Orchestration Error:", error);
    return { 
      feature: "General", 
      suggestion: "I am here to help you find a charger. How can I assist you today?" 
    };
  }
};

module.exports = { orchestrateQuery };

