const axios = require('axios');

/**
 * ReChakra Voice Service
 * Integrates with Bhashini API for Regional Language Support
 */

const BHASHINI_API_URL = "https://meity-auth.ulcacp.org/ulca/apis/v1/model/compute";

/**
 * Translate regional speech/text to English for the AI Orchestrator
 * @param {string} text - User's query in regional language
 * @param {string} sourceLang - 'hi' (Hindi), 'bn' (Bengali), etc.
 */
const translateToEnglish = async (text, sourceLang = 'hi') => {
    // Note: Bhashini requires complex auth headers. This is a robust skeleton.
    try {
        // If no API key is provided, we simulate the translation for the hackathon demo
        if (!process.env.BHASHINI_API_KEY) {
            console.log(`🗣️ Simulating Bhashini Translation for: ${text}`);
            if (text.includes('charging') || text.includes('bijli') || text.includes('bharna')) {
                return "Find a charging station nearby";
            }
            return text;
        }

        const response = await axios.post(BHASHINI_API_URL, {
            pipelineTasks: [
                { taskType: "translation", config: { language: { sourceLanguage: sourceLang, targetLanguage: "en" } } }
            ],
            inputData: { input: [{ source: text }] }
        }, {
            headers: { Authorization: process.env.BHASHINI_API_KEY }
        });

        return response.data.pipelineResponse[0].output[0].target;
    } catch (err) {
        console.error("Bhashini Error:", err.message);
        return text; // Fallback to original text
    }
};

module.exports = { translateToEnglish };
