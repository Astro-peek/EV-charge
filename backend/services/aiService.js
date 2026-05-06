const Anthropic = require('@anthropic-ai/sdk');

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const orchestrateQuery = async (query) => {
  try {
    const response = await anthropic.messages.create({
      model: "claude-3-5-sonnet-20240620",
      max_tokens: 1024,
      system: "You are the EV Charge OS Orchestrator. Your job is to analyze user queries and route them to one of our 4 core features: 1. ChargeAnna (P2P Charging), 2. VehicleID (Compatibility), 3. ChargeSaathi (Trip Planning), 6. ReChakra (E-Rickshaw/Regional). Respond in JSON format with 'feature', 'reason', and a 'suggestion'.",
      messages: [{ role: "user", content: query }],
    });

    // Handle potential string vs object response
    const content = response.content[0].text;
    return JSON.parse(content);
  } catch (error) {
    console.error("AI Orchestration Error:", error);
    return { 
      feature: "General", 
      suggestion: "I'm here to help you find a charger or plan your trip. What would you like to do?" 
    };
  }
};

module.exports = { orchestrateQuery };
